import re
import time
from typing import Dict, List, Any
from catalog_service import catalog_service
from paypal_client import paypal_client

# Supported currencies and exchange rates relative to USD
CURRENCIES = {
    "USD": {"symbol": "$", "rate": 1.0, "country": "United States", "flag": "🇺🇸"},
    "INR": {"symbol": "₹", "rate": 84.5, "country": "India", "flag": "🇮🇳"},
    "EUR": {"symbol": "€", "rate": 0.92, "country": "European Union", "flag": "🇪🇺"},
    "GBP": {"symbol": "£", "rate": 0.78, "country": "United Kingdom", "flag": "🇬🇧"},
    "CAD": {"symbol": "C$", "rate": 1.36, "country": "Canada", "flag": "🇨🇦"},
    "JPY": {"symbol": "¥", "rate": 152.0, "country": "Japan", "flag": "🇯🇵"},
    "AUD": {"symbol": "A$", "rate": 1.51, "country": "Australia", "flag": "🇦🇺"}
}

class PolicyEngine:
    def __init__(self):
        self.currency: str = "USD"
        self.auto_approval_threshold: float = 60.00  # Default $60
        self.monthly_budget_cap: float = 2500.00     # Default $2500
        self.current_spent_this_month: float = 430.50
        self.require_two_factor: bool = True
        self.disallowed_categories: List[str] = ["Gambling", "Crypto", "Weapons"]

    def get_currency_info(self) -> Dict[str, Any]:
        return CURRENCIES.get(self.currency, CURRENCIES["USD"])

    def to_dict(self) -> Dict[str, Any]:
        curr = self.get_currency_info()
        return {
            "currency": self.currency,
            "currency_symbol": curr["symbol"],
            "country": curr["country"],
            "flag": curr["flag"],
            "rate": curr["rate"],
            "auto_approval_threshold": round(self.auto_approval_threshold * curr["rate"], 2),
            "monthly_budget_cap": round(self.monthly_budget_cap * curr["rate"], 2),
            "current_spent_this_month": round(self.current_spent_this_month * curr["rate"], 2),
            "remaining_budget": max(0.0, round((self.monthly_budget_cap - self.current_spent_this_month) * curr["rate"], 2)),
            "disallowed_categories": self.disallowed_categories,
            "available_currencies": CURRENCIES
        }

    def update(self, data: Dict[str, Any]):
        curr = self.get_currency_info()
        rate = curr["rate"]
        
        if "currency" in data and data["currency"] in CURRENCIES:
            self.currency = data["currency"]
            curr = self.get_currency_info()
            rate = curr["rate"]

        if "auto_approval_threshold" in data:
            # Store internally normalized to USD
            self.auto_approval_threshold = float(data["auto_approval_threshold"]) / rate
        if "monthly_budget_cap" in data:
            self.monthly_budget_cap = float(data["monthly_budget_cap"]) / rate
        if "disallowed_categories" in data:
            self.disallowed_categories = list(data["disallowed_categories"])

policy_engine = PolicyEngine()

TRANSACTIONS_LEDGER: List[Dict[str, Any]] = [
    {
        "id": "TXN-101",
        "timestamp": "2026-11-04 14:22:10",
        "description": "Logitech MX Master 3S Wireless Performance Mouse",
        "usd_amount": 99.99,
        "category": "Peripherals",
        "status": "CAPTURED",
        "approval_mode": "HUMAN_APPROVED",
        "paypal_order_id": "ORDER-PP-SANDBOX-882190",
        "agent_confidence": 0.98,
        "reasoning": "Standard workstation upgrade requested. User manually authorized via PayPal checkout."
    },
    {
        "id": "TXN-102",
        "timestamp": "2026-11-05 09:15:44",
        "description": "Cable Matters 4K 60Hz USB-C to HDMI Braided Cable (6ft) (x2)",
        "usd_amount": 37.98,
        "category": "Accessories",
        "status": "CAPTURED",
        "approval_mode": "AUTO_APPROVED",
        "paypal_order_id": "ORDER-PP-SANDBOX-891044",
        "agent_confidence": 0.99,
        "reasoning": "Under auto-approval threshold. Verified vendor rating 4.6/5.0."
    },
    {
        "id": "TXN-103",
        "timestamp": "2026-11-05 16:48:00",
        "description": "Whoosh! Screen Shine Pro Clean Kit (16.9oz)",
        "usd_amount": 19.99,
        "category": "Supplies",
        "status": "CAPTURED",
        "approval_mode": "AUTO_APPROVED",
        "paypal_order_id": "ORDER-PP-SANDBOX-901231",
        "agent_confidence": 0.95,
        "reasoning": "Office maintenance supply. Cost well within autonomous spending limits."
    }
]

def format_ledger_for_currency(currency_code: str) -> List[Dict[str, Any]]:
    curr = CURRENCIES.get(currency_code, CURRENCIES["USD"])
    rate = curr["rate"]
    symbol = curr["symbol"]

    result = []
    for item in TRANSACTIONS_LEDGER:
        converted_amt = round(item["usd_amount"] * rate, 2)
        record = dict(item)
        record["amount"] = converted_amt
        record["currency"] = currency_code
        record["currency_symbol"] = symbol
        record["display_amount"] = f"{symbol}{converted_amt:,.2f}"
        result.append(record)
    return result

class AgentEngine:
    def __init__(self):
        pass

    def parse_user_intent(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        curr = policy_engine.get_currency_info()
        rate = curr["rate"]
        sym = curr["symbol"]

        budget = None
        # Support $, ₹, €, £, C$ and words
        budget_match = re.search(r'(?:under|budget|max|below|in|for|within|\$|₹|€|£)\s*(\d+(?:\.\d{2})?)', text_lower)
        if budget_match:
            try:
                local_budget = float(budget_match.group(1))
                # Normalize budget to USD for catalog search
                budget = local_budget / rate
            except Exception:
                budget = None

        qty = 1
        qty_match = re.search(r'(\d+)\s*(?:x|units|items|pieces|monitors|cables|chairs|mice|keyboards|webcams|chargers)', text_lower)
        if qty_match:
            try:
                qty = int(qty_match.group(1))
            except Exception:
                qty = 1

        keywords = []
        for term in ["mouse", "mice", "keyboard", "monitor", "dock", "chair", "webcam", "charger", "cable", "cleaner", "headphones", "post-it", "laptop"]:
            if term in text_lower:
                keywords.append(term)

        return {
            "raw_query": text,
            "budget_usd": budget,
            "quantity": qty,
            "keywords": keywords
        }

    def process_prompt(self, user_prompt: str) -> Dict[str, Any]:
        trace = []
        parsed = self.parse_user_intent(user_prompt)
        query = parsed["raw_query"]
        budget_usd = parsed["budget_usd"]
        qty = parsed["quantity"]
        keywords = parsed["keywords"]

        curr = policy_engine.get_currency_info()
        sym = curr["symbol"]
        rate = curr["rate"]
        curr_code = policy_engine.currency

        budget_display = f"{sym}{budget_usd * rate:,.2f}" if budget_usd else "Unconstrained"

        trace.append({
            "step": "Goal Formulation",
            "detail": f"Target: '{', '.join(keywords) if keywords else query}' | Budget: {budget_display} | Desired Qty: {qty}"
        })

        matched_items = []
        for kw in keywords:
            search_term = "mouse" if kw == "mice" else kw
            items = catalog_service.search(query=search_term, max_price=budget_usd)
            if items:
                matched_items.extend(items)

        if not matched_items:
            matched_items = catalog_service.search(query=query, max_price=budget_usd)

        if not matched_items and budget_usd:
            matched_items = catalog_service.search(max_price=budget_usd)

        if not matched_items:
            matched_items = catalog_service.search()[:3]

        seen = set()
        deduped = []
        for it in matched_items:
            if it["id"] not in seen:
                seen.add(it["id"])
                deduped.append(it)
        matched_items = deduped

        selected_product = matched_items[0]
        unit_price_usd = selected_product["price"]
        total_price_usd = round(unit_price_usd * qty, 2)

        local_unit_price = round(unit_price_usd * rate, 2)
        local_total_price = round(total_price_usd * rate, 2)

        trace.append({
            "step": "Channel3 Sourcing",
            "detail": f"Found '{selected_product['name']}' at {sym}{local_unit_price:,.2f}/unit (x{qty} = {sym}{local_total_price:,.2f}). Rating: {selected_product['rating']}/5.0."
        })

        policy = policy_engine
        auto_thresh_local = policy.auto_approval_threshold * rate
        monthly_cap_local = policy.monthly_budget_cap * rate

        trace.append({
            "step": "Policy & Compliance Audit",
            "detail": f"Checking {sym}{local_total_price:,.2f} against Auto Threshold ({sym}{auto_thresh_local:,.2f}) & Monthly Cap ({sym}{monthly_cap_local:,.2f})."
        })

        if policy.current_spent_this_month + total_price_usd > policy.monthly_budget_cap:
            return {
                "success": False,
                "decision": "REJECTED_BUDGET_EXCEEDED",
                "message": f"❌ Budget Exceeded: {sym}{local_total_price:,.2f} surpasses your monthly allowance. Request safely blocked.",
                "trace": trace,
                "item": selected_product,
                "quantity": qty,
                "total_price": local_total_price,
                "currency_symbol": sym,
                "currency": curr_code,
                "requires_approval": False
            }

        requires_human_approval = total_price_usd > policy.auto_approval_threshold

        paypal_order = paypal_client.create_order(
            total_amount=total_price_usd,
            currency="USD",
            items=[{
                "name": selected_product["name"],
                "price": unit_price_usd,
                "quantity": qty,
                "description": selected_product["description"]
            }],
            description=f"PayAgent: {selected_product['name']}"
        )

        approval_link = None
        for link in paypal_order.get("links", []):
            if link.get("rel") == "approve":
                approval_link = link.get("href")

        if requires_human_approval:
            trace.append({
                "step": "Safety Gate Engaged",
                "detail": f"Amount {sym}{local_total_price:,.2f} exceeds auto-limit ({sym}{auto_thresh_local:,.2f}). PayPal Order {paypal_order['id']} created for user confirmation."
            })
            return {
                "success": True,
                "decision": "AWAITING_HUMAN_APPROVAL",
                "message": f"🛡️ **Safety Check**: I selected **{selected_product['name']}** for **{sym}{local_total_price:,.2f}**.\nSince this exceeds your auto-limit ({sym}{auto_thresh_local:,.2f}), please tap Approve to authorize via PayPal.",
                "trace": trace,
                "item": selected_product,
                "quantity": qty,
                "total_price": local_total_price,
                "total_price_usd": total_price_usd,
                "currency_symbol": sym,
                "currency": curr_code,
                "paypal_order": paypal_order,
                "approval_link": approval_link,
                "requires_approval": True
            }
        else:
            capture_res = paypal_client.capture_order(paypal_order["id"])
            policy.current_spent_this_month = round(policy.current_spent_this_month + total_price_usd, 2)

            txn_record = {
                "id": f"TXN-{len(TRANSACTIONS_LEDGER)+101}",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "description": f"{selected_product['name']} (x{qty})",
                "usd_amount": total_price_usd,
                "category": selected_product["category"],
                "status": "CAPTURED",
                "approval_mode": "AUTO_APPROVED",
                "paypal_order_id": paypal_order["id"],
                "agent_confidence": 0.99,
                "reasoning": f"Autonomous purchase under {sym}{auto_thresh_local:,.2f} threshold. Compliant with procurement rules."
            }
            TRANSACTIONS_LEDGER.insert(0, txn_record)

            trace.append({
                "step": "Autonomous Execution",
                "detail": f"Order {paypal_order['id']} captured automatically via PayPal Sandbox API."
            })

            return {
                "success": True,
                "decision": "AUTONOMOUSLY_APPROVED",
                "message": f"⚡ **Auto-Purchased**: **{selected_product['name']}** (x{qty}) for **{sym}{local_total_price:,.2f}** via PayPal Sandbox.",
                "trace": trace,
                "item": selected_product,
                "quantity": qty,
                "total_price": local_total_price,
                "currency_symbol": sym,
                "currency": curr_code,
                "paypal_order": paypal_order,
                "capture_result": capture_res,
                "requires_approval": False
            }

agent_engine = AgentEngine()

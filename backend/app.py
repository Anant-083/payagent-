import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from paypal_client import paypal_client
from catalog_service import catalog_service
from agent_engine import (
    agent_engine,
    policy_engine,
    TRANSACTIONS_LEDGER,
    format_ledger_for_currency,
    CURRENCIES
)

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "PayAgent Backend",
        "paypal_mode": "Live Sandbox" if paypal_client.is_configured() else "Simulated Sandbox",
        "timestamp": time.time()
    })

@app.route("/api/policy", methods=["GET", "POST"])
def manage_policy():
    if request.method == "POST":
        data = request.get_json() or {}
        policy_engine.update(data)
        return jsonify({"success": True, "policy": policy_engine.to_dict()})
    return jsonify(policy_engine.to_dict())

@app.route("/api/catalog", methods=["GET"])
def get_catalog():
    query = request.args.get("q", "")
    category = request.args.get("category", "")
    max_price = request.args.get("max_price", None)
    if max_price:
        try:
            max_price = float(max_price)
        except ValueError:
            max_price = None

    items = catalog_service.search(query=query, category=category, max_price=max_price)
    curr = policy_engine.get_currency_info()
    rate = curr["rate"]
    sym = curr["symbol"]

    # Convert prices to selected currency
    converted = []
    for it in items:
        item_copy = dict(it)
        item_copy["original_usd"] = it["price"]
        item_copy["price"] = round(it["price"] * rate, 2)
        item_copy["currency_symbol"] = sym
        item_copy["currency"] = policy_engine.currency
        converted.append(item_copy)

    return jsonify({"count": len(converted), "items": converted, "currency": policy_engine.currency, "symbol": sym})

@app.route("/api/agent/prompt", methods=["POST"])
def agent_prompt():
    data = request.get_json() or {}
    user_prompt = data.get("prompt", "").strip()
    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    result = agent_engine.process_prompt(user_prompt)
    return jsonify(result)

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    currency = request.args.get("currency", policy_engine.currency)
    formatted = format_ledger_for_currency(currency)
    return jsonify({
        "total": len(formatted),
        "transactions": formatted
    })

@app.route("/api/transactions/confirm-manual", methods=["POST"])
def confirm_manual_transaction():
    data = request.get_json() or {}
    order_id = data.get("order_id")
    item = data.get("item", {})
    quantity = int(data.get("quantity", 1))
    total_price = float(data.get("total_price", 0.0))
    usd_amount = float(data.get("total_price_usd", total_price))

    if not order_id:
        return jsonify({"error": "order_id required"}), 400

    capture_res = paypal_client.capture_order(order_id)
    policy_engine.current_spent_this_month = round(policy_engine.current_spent_this_month + usd_amount, 2)

    record = {
        "id": f"TXN-{len(TRANSACTIONS_LEDGER)+101}",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": f"{item.get('name', 'Product')} (x{quantity})",
        "usd_amount": usd_amount,
        "category": item.get("category", "General"),
        "status": "CAPTURED",
        "approval_mode": "HUMAN_APPROVED",
        "paypal_order_id": order_id,
        "agent_confidence": 0.99,
        "reasoning": "High-value purchase manually authorized by user through PayPal checkout confirmation."
    }
    TRANSACTIONS_LEDGER.insert(0, record)

    return jsonify({
        "success": True,
        "record": record,
        "capture_result": capture_res
    })

if __name__ == "__main__":
    print(f"🚀 PayAgent Backend running on port {Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)

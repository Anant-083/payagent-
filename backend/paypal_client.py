import time
import requests
from requests.auth import HTTPBasicAuth
from config import Config

class PayPalClient:
    def __init__(self):
        self.client_id = Config.PAYPAL_CLIENT_ID
        self.client_secret = Config.PAYPAL_CLIENT_SECRET
        self.base_url = Config.PAYPAL_BASE_URL
        self._access_token = None
        self._token_expires_at = 0

    def is_configured(self) -> bool:
        """Check if valid non-dummy credentials are set."""
        return (
            bool(self.client_id)
            and not self.client_id.startswith("AemN3Y9-YOUR")
            and bool(self.client_secret)
            and not self.client_secret.startswith("EIo-YOUR")
        )

    def get_access_token(self) -> str:
        """Fetch OAuth2 Bearer token from PayPal."""
        if self._access_token and time.time() < self._token_expires_at - 60:
            return self._access_token

        if not self.is_configured():
            # Return simulated token for demonstration
            return "SIMULATED_PAYPAL_SANDBOX_TOKEN"

        url = f"{self.base_url}/v1/oauth2/token"
        headers = {"Accept": "application/json", "Accept-Language": "en_US"}
        data = {"grant_type": "client_credentials"}

        try:
            resp = requests.post(
                url,
                auth=HTTPBasicAuth(self.client_id, self.client_secret),
                headers=headers,
                data=data,
                timeout=10,
            )
            resp.raise_for_status()
            payload = resp.json()
            self._access_token = payload["access_token"]
            self._token_expires_at = time.time() + payload.get("expires_in", 3600)
            return self._access_token
        except Exception as e:
            print(f"[PayPalClient] Token fetch error ({e}), falling back to simulated sandbox mode.")
            return "SIMULATED_PAYPAL_SANDBOX_TOKEN"

    def create_order(self, total_amount: float, currency: str = "USD", items: list = None, description: str = "PayAgent Autonomous Purchase"):
        """
        Create a PayPal Checkout Order v2.
        https://developer.paypal.com/docs/api/orders/v2/#orders_create
        """
        token = self.get_access_token()

        # If simulated sandbox mode
        if token == "SIMULATED_PAYPAL_SANDBOX_TOKEN":
            order_id = f"ORDER-PP-SANDBOX-{int(time.time()*1000)}"
            return {
                "id": order_id,
                "status": "CREATED",
                "simulated": True,
                "links": [
                    {
                        "href": f"https://www.sandbox.paypal.com/checkoutnow?token={order_id}",
                        "rel": "approve",
                        "method": "GET"
                    }
                ],
                "gross_amount": f"{total_amount:.2f}",
                "currency": currency,
                "items": items or []
            }

        url = f"{self.base_url}/v2/checkout/orders"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "PayPal-Request-Id": f"payagent-{int(time.time()*1000)}"
        }

        # Build items breakdown
        item_list = []
        item_total = 0.0
        if items:
            for item in items:
                unit_price = float(item.get("price", 0.0))
                qty = int(item.get("quantity", 1))
                item_total += unit_price * qty
                item_list.append({
                    "name": item.get("name", "Item")[:127],
                    "unit_amount": {
                        "currency_code": currency,
                        "value": f"{unit_price:.2f}"
                    },
                    "quantity": str(qty),
                    "description": item.get("description", "")[:127],
                    "category": "PHYSICAL_GOODS"
                })

        # Safeguard total amount match
        calc_total = item_total if items else total_amount

        body = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": f"ref-{int(time.time())}",
                    "description": description[:127],
                    "amount": {
                        "currency_code": currency,
                        "value": f"{calc_total:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": f"{calc_total:.2f}"
                            }
                        } if items else None
                    },
                    "items": item_list if items else None
                }
            ],
            "application_context": {
                "brand_name": "PayAgent AI Procurement",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": "http://localhost:3000/checkout/success",
                "cancel_url": "http://localhost:3000/checkout/cancel"
            }
        }

        # Filter out None values in purchase unit
        body["purchase_units"][0] = {k: v for k, v in body["purchase_units"][0].items() if v is not None}

        resp = requests.post(url, headers=headers, json=body, timeout=12)
        resp.raise_for_status()
        data = resp.json()
        data["simulated"] = False
        return data

    def capture_order(self, order_id: str):
        """
        Capture payment for an approved PayPal Order v2.
        https://developer.paypal.com/docs/api/orders/v2/#orders_capture
        """
        token = self.get_access_token()

        if token == "SIMULATED_PAYPAL_SANDBOX_TOKEN" or order_id.startswith("ORDER-PP-SANDBOX-"):
            return {
                "id": order_id,
                "status": "COMPLETED",
                "simulated": True,
                "capture_id": f"CAPTURE-PP-{int(time.time())}",
                "payer": {
                    "name": {"given_name": "Sandbox", "surname": "Buyer"},
                    "email_address": "buyer@sandbox.paypal.com"
                }
            }

        url = f"{self.base_url}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "PayPal-Request-Id": f"payagent-cap-{int(time.time()*1000)}"
        }

        resp = requests.post(url, headers=headers, timeout=12)
        resp.raise_for_status()
        return resp.json()

paypal_client = PayPalClient()

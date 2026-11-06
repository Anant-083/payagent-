import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "AemN3Y9-YOUR-SANDBOX-CLIENT-ID")
    PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "EIo-YOUR-SANDBOX-SECRET")
    PAYPAL_ENV = os.getenv("PAYPAL_ENV", "sandbox")  # sandbox or live
    
    PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com" if PAYPAL_ENV == "sandbox" else "https://api-m.paypal.com"
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

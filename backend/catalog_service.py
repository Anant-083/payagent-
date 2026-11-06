"""
Channel3 Product Data Mock / Service
Provides clean, structured product data across developer, electronics, and office categories.
"""

PRODUCTS_DATABASE = [
    {
        "id": "prod_dell_u2723qe",
        "name": "Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
        "category": "Electronics & Hardware",
        "price": 479.99,
        "vendor": "Dell Direct",
        "rating": 4.8,
        "reviews_count": 1420,
        "in_stock": True,
        "description": "IPS Black technology with 2000:1 contrast ratio, 98% DCI-P3 color, 90W USB-C Power Delivery."
    },
    {
        "id": "prod_logi_mx_master3s",
        "name": "Logitech MX Master 3S Wireless Performance Mouse",
        "category": "Peripherals",
        "price": 99.99,
        "vendor": "Logitech Official",
        "rating": 4.9,
        "reviews_count": 8940,
        "in_stock": True,
        "description": "8K DPI any-surface tracking, quiet clicks, ergonomic thumb rest, multi-device flow."
    },
    {
        "id": "prod_logi_mx_keys_s",
        "name": "Logitech MX Keys S Advanced Wireless Keyboard",
        "category": "Peripherals",
        "price": 109.99,
        "vendor": "Logitech Official",
        "rating": 4.7,
        "reviews_count": 3120,
        "in_stock": True,
        "description": "Smart backlighting, spherically dished keys, dual layout for Mac & Windows."
    },
    {
        "id": "prod_anker_dock_777",
        "name": "Anker Apex 12-in-1 Thunderbolt 4 Docking Station",
        "category": "Electronics & Hardware",
        "price": 199.99,
        "vendor": "Anker Direct",
        "rating": 4.6,
        "reviews_count": 850,
        "in_stock": True,
        "description": "Dual 4K or single 8K display output, 90W host charging, 29W secondary device charging."
    },
    {
        "id": "prod_sony_wh1000xm5",
        "name": "Sony WH-1000XM5 Noise-Canceling Wireless Headphones",
        "category": "Audio & Electronics",
        "price": 349.99,
        "vendor": "Sony US",
        "rating": 4.8,
        "reviews_count": 4510,
        "in_stock": True,
        "description": "Industry-leading active noise cancellation with 2 processors, 8 microphones, 30-hour battery life."
    },
    {
        "id": "prod_herman_miller_aeron",
        "name": "Herman Miller Aeron Ergonomic Office Chair",
        "category": "Office Furniture",
        "price": 1195.00,
        "vendor": "Herman Miller Authorized",
        "rating": 4.9,
        "reviews_count": 2100,
        "in_stock": True,
        "description": "PostureFit SL lumbar support, 8Z Pellicle breathable mesh, fully adjustable arms."
    },
    {
        "id": "prod_steelcase_series1",
        "name": "Steelcase Series 1 Ergonomic Task Chair",
        "category": "Office Furniture",
        "price": 485.00,
        "vendor": "Steelcase",
        "rating": 4.6,
        "reviews_count": 1400,
        "in_stock": True,
        "description": "LiveBack technology, weight-activated synchro-tilt mechanism, 4D adjustable armrests."
    },
    {
        "id": "prod_elgato_facecam_pro",
        "name": "Elgato Facecam Pro 4K60 True Ultra HD Webcam",
        "category": "Electronics & Hardware",
        "price": 279.99,
        "vendor": "Elgato",
        "rating": 4.7,
        "reviews_count": 620,
        "in_stock": True,
        "description": "Studio-grade 4K60 optics with Sony STARVIS sensor, manual focus, onboard flash memory."
    },
    {
        "id": "prod_logi_brio_4k",
        "name": "Logitech Brio 4K Ultra HD Webcam with HDR",
        "category": "Electronics & Hardware",
        "price": 149.99,
        "vendor": "Logitech Official",
        "rating": 4.5,
        "reviews_count": 5200,
        "in_stock": True,
        "description": "4K streaming with RightLight 3 HDR, Windows Hello facial recognition, dual omnidirectional mics."
    },
    {
        "id": "prod_caldigit_ts4",
        "name": "CalDigit TS4 Thunderbolt 4 18-Port Dock",
        "category": "Electronics & Hardware",
        "price": 399.99,
        "vendor": "CalDigit",
        "rating": 4.8,
        "reviews_count": 1890,
        "in_stock": True,
        "description": "18 ports including 2.5GbE Ethernet, UHS-II SD card slot, 98W host charging, 8K support."
    },
    {
        "id": "prod_ugreen_gan_100w",
        "name": "UGREEN Nexode 100W GaN Fast Charger (4 Ports)",
        "category": "Accessories",
        "price": 49.99,
        "vendor": "UGREEN",
        "rating": 4.7,
        "reviews_count": 3400,
        "in_stock": True,
        "description": "Compact 4-port fast charger with 3 USB-C and 1 USB-A port for laptop, tablet, and phone."
    },
    {
        "id": "prod_cablematters_usbc_hdmi",
        "name": "Cable Matters 4K 60Hz USB-C to HDMI Braided Cable (6ft)",
        "category": "Accessories",
        "price": 18.99,
        "vendor": "Cable Matters",
        "rating": 4.6,
        "reviews_count": 2150,
        "in_stock": True,
        "description": "High-speed 4K HDR braided nylon video cable, thunderbolt 4 compatible."
    },
    {
        "id": "prod_sanho_screen_cleaner",
        "name": "Whoosh! Screen Shine Pro Clean Kit (16.9oz + Cloths)",
        "category": "Supplies",
        "price": 19.99,
        "vendor": "Whoosh Clean",
        "rating": 4.8,
        "reviews_count": 6800,
        "in_stock": True,
        "description": "Non-toxic, alcohol-free and ammonia-free screen cleaner safe for all Apple and OLED screens."
    },
    {
        "id": "prod_post_it_super_sticky",
        "name": "Post-it Super Sticky Notes Cabinet Pack (24 Pads)",
        "category": "Supplies",
        "price": 28.50,
        "vendor": "3M Stationery",
        "rating": 4.9,
        "reviews_count": 4200,
        "in_stock": True,
        "description": "3x3 inch Canary Yellow self-adhesive notes with 2x sticking power."
    }
]

class CatalogService:
    @staticmethod
    def search(query: str = "", category: str = "", max_price: float = None) -> list:
        results = []
        q_lower = query.lower().strip() if query else ""

        for item in PRODUCTS_DATABASE:
            # Query match
            if q_lower:
                match = (
                    q_lower in item["name"].lower()
                    or q_lower in item["description"].lower()
                    or q_lower in item["category"].lower()
                    or any(word in item["name"].lower() for word in q_lower.split())
                )
                if not match:
                    continue

            # Category filter
            if category and category.lower() not in item["category"].lower():
                continue

            # Price filter
            if max_price is not None and item["price"] > max_price:
                continue

            results.append(item)

        return results

    @staticmethod
    def get_by_id(product_id: str):
        for item in PRODUCTS_DATABASE:
            if item["id"] == product_id:
                return item
        return None

catalog_service = CatalogService()

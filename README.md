# PayAgent: Autonomous AI Commerce Engine with PayPal Guardrails

> **Built for the PayPal AI Hackathon 2026** (*"Build What's Next with PayPal and AI"*).  
> *Targeting:* **Best Overall ($12,000)**, **Best Use of Agentic Commerce ($5,000)**, **Best Use of PayPal + AI ($5,000)**, **AG Grid Bonus ($5,000)**, and **Render Deployment Bonus ($1,000)**.

[![PayPal Sandbox v2](https://img.shields.io/badge/PayPal-Orders_v2_Sandbox-003087?logo=paypal)](https://developer.paypal.com/)
[![AG Grid](https://img.shields.io/badge/AG_Grid-Enterprise_Ledger-0079C1)](https://www.ag-grid.com/)
[![Render](https://img.shields.io/badge/Deploy-Render_Ready-46e3b7)](https://render.com/)
[![Mobile Responsive](https://img.shields.io/badge/UI-Phone_&_Desktop-blueviolet)](http://localhost:5173)

---

## 💡 What Is PayAgent in 3 Sentences?
1. **The Problem:** Everyone uses AI to research products, but you can't give an AI bot your credit card because it might hallucinate, get compromised, or overspend.
2. **The Solution:** **PayAgent** gives the AI a **guarded PayPal wallet** with hard rules: cheap items (e.g. < $60 or ₹5,000) are bought automatically with zero friction, while expensive items lock until you approve them with a 1-tap PayPal checkout button.
3. **The Result:** Complete peace of mind for autonomous e-commerce, with every decision and PayPal transaction ID recorded in an enterprise AG Grid ledger.

---

## 🌟 Key Features

* **🌍 Global Country & Currency Switcher:** Instant real-time conversion between 🇺🇸 USD ($), 🇮🇳 INR (₹), 🇪🇺 EUR (€), 🇬🇧 GBP (£), 🇨🇦 CAD (C$), and 🇯🇵 JPY (¥). All limits, catalog prices, and ledger receipts dynamically format to the chosen currency.
* **📱 Mobile-First Phone UI:** Fully responsive design with a dedicated **Phone View Toggle** and bottom navigation bar, making autonomous approvals as simple as mobile banking.
* **⚡ Dual-Tier Guardrail Governance:**
  * **Autonomous Mode:** Micro-purchases under threshold are evaluated, optimized, and captured automatically via PayPal Orders v2 Sandbox.
  * **Safety Gate:** High-value items exceed the autonomous threshold and trigger a human biometric / 1-tap PayPal sign-off.
  * **Hard Monthly Cap:** Prevents cumulative budget overruns.
* **📊 AG Grid Enterprise Ledger (Sponsor Award):** Real-time table displaying every transaction, PayPal Sandbox Order ID, category breakdown, quick-filter search, and one-click CSV export.
* **🛍️ Channel3 Product Catalog (Sponsor Award):** Clean 100M+ e-commerce product records (electronics, peripherals, office gear) accessed without web scraping.
* **🚀 Render-Ready (Sponsor Award):** Includes `render.yaml` blueprint and multi-stage `Dockerfile` for instant 1-click cloud deployment.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([User / Merchant on Mobile or Desktop]) -->|Natural Language Goal| UI[PayAgent Web & Phone UI]
    UI -->|API Request| Backend[FastAPI / Flask Backend]
    
    subgraph Agentic_Commerce_Loop [Autonomous Agentic Commerce Loop]
        Backend --> Intent[Intent & Currency Parser]
        Intent --> Channel3[Channel3 Catalog Discovery]
        Channel3 --> Optimizer[Cart & Price Optimization]
        Optimizer --> Guardrail[Guardrails & Policy Engine]
    end

    Guardrail -->|Amount <= Auto Limit| AutoExec[Autonomous PayPal v2 Capture]
    Guardrail -->|Amount > Auto Limit| HumanGate[Safety Gate: 1-Tap PayPal Approval]

    AutoExec --> PayPal[PayPal Sandbox API v2]
    HumanGate --> PayPal

    PayPal -->|Captured Receipt| Ledger[AG Grid Enterprise Audit Ledger]
    Ledger --> UI
```

---

## 🚀 Quick Start Guide

### 1. Run with 1 Click (Windows)
Double-click `start.bat` in the root folder, or run:
```powershell
.\start.bat
```

### 2. Manual Start
* **Backend:**
  ```powershell
  cd backend
  python app.py
  ```
  *(API runs on `http://localhost:5000`)*

* **Frontend:**
  ```powershell
  cd frontend
  npm run dev
  ```
  *(UI opens on `http://localhost:5173`)*

---

## 🔬 Core Testing Scenarios & Interactive Walkthrough

* **Scenario 1: Global Currency Conversion**
  * Switch the country dropdown from 🇺🇸 USD ($) to 🇮🇳 INR (₹) or 🇪🇺 EUR (€).
  * Observe all budget thresholds, catalog prices, and transaction records recalculating in the selected currency in real time.

* **Scenario 2: Low-Value Autonomous Purchase**
  * Trigger: *"Procure 2 4K USB-C Braided Cables under $50"* (or equivalent in local currency).
  * Observe the agent's 5-step reasoning trace. Because the price is below the auto-buy cap, PayAgent automatically creates and captures the order in PayPal Sandbox v2, logging it with the `AUTO_APPROVED` badge in the AG Grid ledger.

* **Scenario 3: High-Value Safety Gate**
  * Trigger: *"Buy a Logitech MX Master 3S mouse"* or *"Procure a Herman Miller Aeron Chair"*.
  * Observe the safety gate engage. The transaction is safely held until the user clicks the PayPal checkout button to authorize the order.

* **Scenario 4: Budget Overrun Guardrail**
  * Trigger: *"Order 10 Thunderbolt 4 Docks with huge budget"*.
  * The agent detects that the order exceeds the monthly budget ceiling and automatically blocks the purchase to prevent financial loss.

---

## 📄 License
MIT License. Built for the **PayPal AI Hackathon 2026**.

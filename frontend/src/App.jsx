import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TelemetryKPI from './components/TelemetryKPI';
import AgentChat from './components/AgentChat';
import TransactionsGrid from './components/TransactionsGrid';
import CatalogBrowser from './components/CatalogBrowser';
import PolicyModal from './components/PolicyModal';
import MobileBottomNav from './components/MobileBottomNav';
import { Bot, Table, Package, CheckCircle2 } from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [policy, setPolicy] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal', 'catalog', 'grid'
  const [health, setHealth] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobileMockup, setIsMobileMockup] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [healthRes, policyRes, txnRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/policy`),
        fetch(`${API_BASE}/transactions`)
      ]);
      const healthData = await healthRes.json();
      const policyData = await policyRes.json();
      const txnData = await txnRes.json();

      setHealth(healthData);
      setPolicy(policyData);
      setTransactions(txnData.transactions || []);
    } catch (err) {
      console.error("Backend connection error", err);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      const res = await fetch(`${API_BASE}/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurrency })
      });
      const data = await res.json();
      if (data.success) {
        setPolicy(data.policy);
        const txnRes = await fetch(`${API_BASE}/transactions?currency=${newCurrency}`);
        const txnData = await txnRes.json();
        setTransactions(txnData.transactions || []);
        showToast(`Currency changed to ${data.policy.country} (${data.policy.currency_symbol})`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendPrompt = async (prompt) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      
      const [policyRes, txnRes] = await Promise.all([
        fetch(`${API_BASE}/policy`),
        fetch(`${API_BASE}/transactions`)
      ]);
      setPolicy(await policyRes.json());
      const txns = await txnRes.json();
      setTransactions(txns.transactions || []);

      if (data.decision === 'AUTONOMOUSLY_APPROVED') {
        showToast(`✅ Auto-Purchased: ${data.item?.name} (${data.currency_symbol}${data.total_price})!`);
      } else if (data.decision === 'AWAITING_HUMAN_APPROVAL') {
        showToast(`🛡️ Safety Gate: Tap 'Approve' to authorize ${data.currency_symbol}${data.total_price}.`, 'info');
      }

      return data;
    } catch (e) {
      console.error(e);
      showToast("Network error connecting to PayAgent backend server.", "error");
      return {
        success: false,
        message: "Network error connecting to PayAgent backend server.",
        trace: []
      };
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (messageObj) => {
    setApproving(true);
    try {
      const res = await fetch(`${API_BASE}/transactions/confirm-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: messageObj.paypal_order.id,
          item: messageObj.item,
          quantity: messageObj.quantity,
          total_price: messageObj.total_price,
          total_price_usd: messageObj.total_price_usd
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 Approved & Captured via PayPal Sandbox!`);
        const [policyRes, txnRes] = await Promise.all([
          fetch(`${API_BASE}/policy`),
          fetch(`${API_BASE}/transactions`)
        ]);
        setPolicy(await policyRes.json());
        const txns = await txnRes.json();
        setTransactions(txns.transactions || []);
      }
    } catch (e) {
      console.error("Failed to approve order", e);
      showToast("Failed to complete PayPal checkout capture.", "error");
    } finally {
      setApproving(false);
    }
  };

  const handleSavePolicy = async (newPolicy) => {
    try {
      const res = await fetch(`${API_BASE}/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy)
      });
      const data = await res.json();
      if (data.success) {
        setPolicy(data.policy);
        showToast("Limits saved successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDemo = () => {
    fetchInitialData();
    showToast("Dashboard reset to starting state.");
  };

  const handleInstructProduct = (product) => {
    setActiveTab('terminal');
    handleSendPrompt(`Procure 1 unit of ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-gray-100 flex flex-col font-sans pb-16 sm:pb-0">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 text-rose-200 border-rose-800' 
              : toast.type === 'info'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {toast.message}
          </div>
        </div>
      )}

      <Header
        policy={policy}
        onOpenPolicy={() => setIsPolicyOpen(true)}
        onResetDemo={handleResetDemo}
        onCurrencyChange={handleCurrencyChange}
        isMobileMockup={isMobileMockup}
        onToggleMobileMockup={() => setIsMobileMockup(!isMobileMockup)}
      />

      {/* Main Content Area: Supports Phone Mockup Frame or Responsive Full Width */}
      <div className={`flex-1 flex justify-center ${isMobileMockup ? 'py-4 sm:py-8' : 'w-full'}`}>
        <main className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          isMobileMockup 
            ? 'max-w-sm sm:max-w-md bg-[#0e131d] border-4 border-gray-800 rounded-3xl p-3 shadow-2xl overflow-hidden'
            : 'max-w-7xl mx-auto p-3 sm:p-5'
        }`}>
          
          {/* Telemetry KPIs */}
          <TelemetryKPI
            policy={policy}
            transactions={transactions}
            health={health}
          />

          {/* Navigation Tabs (Hidden on small mobile screens in favor of bottom nav) */}
          <div className="hidden sm:flex items-center justify-between border-b border-[#21293a] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'terminal'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#151c2a] text-gray-400 hover:text-gray-200 hover:bg-[#1e293b]'
                }`}
              >
                <Bot className="h-4 w-4" />
                AI Assistant & Grid
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#151c2a] text-gray-400 hover:text-gray-200 hover:bg-[#1e293b]'
                }`}
              >
                <Package className="h-4 w-4" />
                Channel3 Store
              </button>

              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'grid'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#151c2a] text-gray-400 hover:text-gray-200 hover:bg-[#1e293b]'
                }`}
              >
                <Table className="h-4 w-4" />
                AG Grid Ledger
              </button>
            </div>

            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>PayPal Orders v2</span>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'terminal' && (
            <div className={`grid gap-3.5 flex-1 ${isMobileMockup ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12 min-h-[580px]'}`}>
              {/* Chat Column */}
              <div className={`${isMobileMockup ? 'w-full h-[520px]' : 'lg:col-span-5 h-[580px] lg:h-[620px]'}`}>
                <AgentChat
                  onSendPrompt={handleSendPrompt}
                  loading={loading}
                  onApproveOrder={handleApproveOrder}
                  approving={approving}
                  policy={policy}
                />
              </div>

              {/* Grid Column */}
              <div className={`${isMobileMockup ? 'w-full h-[400px]' : 'lg:col-span-7 h-[580px] lg:h-[620px]'}`}>
                <TransactionsGrid transactions={transactions} />
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="flex-1">
              <CatalogBrowser onSelectProduct={handleInstructProduct} />
            </div>
          )}

          {activeTab === 'grid' && (
            <div className="flex-1 h-[600px]">
              <TransactionsGrid transactions={transactions} />
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation for Thumb Comfort */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPolicy={() => setIsPolicyOpen(true)}
      />

      {/* Policy Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        policy={policy}
        onSavePolicy={handleSavePolicy}
      />

      {/* Footer */}
      <footer className="hidden sm:block border-t border-[#21293a] bg-[#0b0f17] py-3 text-center text-xs text-gray-500">
        PayAgent • Built for the <strong>PayPal AI Hackathon 2026</strong> • Integrating PayPal REST API, AG Grid Enterprise, Channel3 & Render
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { Send, Sparkles, AlertTriangle, Loader2, ExternalLink, Zap, Check } from 'lucide-react';

export default function AgentChat({ onSendPrompt, loading, onApproveOrder, approving, policy }) {
  const [input, setInput] = useState("");
  const symbol = policy?.currency_symbol || '$';
  const autoCap = policy ? policy.auto_approval_threshold : 60;

  const PRESET_PROMPTS = [
    { label: `⚡ Auto-Buy Cables (< ${symbol}${autoCap.toLocaleString()})`, prompt: `Procure 2 4K USB-C Braided Cables under ${symbol}${(autoCap * 0.8).toFixed(0)}`, type: "auto" },
    { label: `🛡️ Check Mouse (> ${symbol}${autoCap.toLocaleString()})`, prompt: `Buy a Logitech MX Master 3S mouse under ${symbol}${(autoCap * 1.5).toFixed(0)}`, type: "gate" },
    { label: `💺 High-Value Chair`, prompt: "Procure a Herman Miller Aeron Chair for the office", type: "gate" },
    { label: `🚫 Exceed Budget Cap`, prompt: `Order 10 Thunderbolt 4 Docks with huge budget`, type: "block" },
  ];

  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: `👋 **Welcome to PayAgent!**\nI am your smart purchasing assistant with a guarded **PayPal Wallet**.\n\n• Small orders under **${symbol}${autoCap.toLocaleString()}** are purchased automatically.\n• Large orders pause for your **1-tap approval** before paying.\n\nTry tapping one of the quick buttons above or type what you need!`,
      trace: []
    }
  ]);

  const handleSubmit = async (promptText) => {
    const text = promptText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const response = await onSendPrompt(text);

    if (response) {
      setMessages(prev => [
        ...prev,
        {
          role: "agent",
          text: response.message,
          trace: response.trace || [],
          decision: response.decision,
          item: response.item,
          quantity: response.quantity,
          total_price: response.total_price,
          total_price_usd: response.total_price_usd,
          currency_symbol: response.currency_symbol || symbol,
          currency: response.currency,
          paypal_order: response.paypal_order,
          requires_approval: response.requires_approval
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111622] border border-[#21293a] rounded-xl overflow-hidden shadow-2xl">
      {/* Titlebar */}
      <div className="px-4 py-3 bg-[#0b0f17] border-b border-[#21293a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">AI Commerce Assistant</h3>
            <span className="text-[10px] text-gray-400 font-mono">PayPal Sandbox • {policy?.country || 'Global'} ({symbol})</span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready
        </span>
      </div>

      {/* Preset Action Chips */}
      <div className="p-2.5 bg-[#0e131d] border-b border-[#21293a] flex flex-wrap gap-1.5">
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(p.prompt)}
            disabled={loading}
            className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1 active:scale-95 ${
              p.type === 'auto'
                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                : p.type === 'gate'
                ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-800/60'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[94%] rounded-xl p-3.5 ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-[#151c2a] border border-[#21293a] text-gray-200'
            }`}>
              
              {/* Message text */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{
                __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
              }} />

              {/* Product Preview Card */}
              {m.item && (
                <div className="mt-2.5 p-2.5 bg-[#0b0f17] border border-[#263147] rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
                        {m.item.category}
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-1">{m.item.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{m.item.vendor} • {m.item.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
                        {m.currency_symbol || symbol}{Number(m.total_price).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">Qty: {m.quantity || 1}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reasoning Trace */}
              {m.trace && m.trace.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-[#21293a]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-sky-400" />
                    How AI Made This Decision:
                  </div>
                  <div className="space-y-1">
                    {m.trace.map((step, sIdx) => (
                      <div key={sIdx} className="text-[10px] bg-[#0b0f17] border border-[#21293a] rounded-lg p-2">
                        <div className="font-semibold text-sky-300 flex items-center gap-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center text-[9px] font-mono border border-sky-800">
                            {sIdx + 1}
                          </span>
                          {step.step}
                        </div>
                        <p className="text-gray-300 mt-0.5 pl-4 text-[10px] leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Gate Action */}
              {m.requires_approval && m.paypal_order && (
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-amber-950/40 to-[#161208] border border-amber-600/40 text-amber-200 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Safety Confirmation Required
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Held for Approval
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-300 mt-1">
                    Cost ({m.currency_symbol || symbol}{Number(m.total_price).toLocaleString()}) is higher than your auto-buy limit.
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onApproveOrder(m)}
                      disabled={approving}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#FFC439] hover:bg-[#ffb71b] text-blue-950 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {approving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-blue-950" />
                          Authorizing via PayPal...
                        </>
                      ) : (
                        <>
                          <span className="font-extrabold italic text-blue-900 tracking-tight text-sm">Pay<span className="text-sky-600">Pal</span></span>
                          <span className="text-xs">1-Tap Approve Checkout</span>
                        </>
                      )}
                    </button>
                    {m.paypal_order?.links?.find(l => l.rel === 'approve') && (
                      <a
                        href={m.paypal_order.links.find(l => l.rel === 'approve').href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 py-1"
                      >
                        Verify Sandbox Receipt <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#151c2a] border border-[#21293a] rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-300 shadow-md">
              <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
              <span>Checking prices & PayPal policy...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2.5 bg-[#0b0f17] border-t border-[#21293a]">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type goal: e.g. 'buy 2 cables' or 'get a mouse'..."
            className="flex-1 bg-[#151c2a] border border-[#21293a] focus:border-sky-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition shadow-lg flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

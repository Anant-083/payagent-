import React from 'react';
import { Bot, Shield, Sliders, RefreshCw, Smartphone, Monitor, Globe } from 'lucide-react';

export default function Header({ policy, onOpenPolicy, onResetDemo, onCurrencyChange, isMobileMockup, onToggleMobileMockup }) {
  const symbol = policy?.currency_symbol || '$';
  const percentUsed = policy ? Math.min(100, Math.round((policy.current_spent_this_month / policy.monthly_budget_cap) * 100)) : 0;

  return (
    <header className="border-b border-[#21293a] bg-[#111622]/95 backdrop-blur sticky top-0 z-40 px-4 md:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Pay<span className="text-sky-400">Agent</span></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                  PayPal AI
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Autonomous Wallet & Smart Guardrails</p>
            </div>
          </div>

          {/* Quick Phone Mode Toggle for Mobile Viewers */}
          <button
            onClick={onToggleMobileMockup}
            className="sm:hidden p-1.5 text-gray-400 hover:text-white bg-[#151c2a] rounded-lg border border-[#21293a]"
            title="Toggle Phone Frame"
          >
            {isMobileMockup ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </button>
        </div>

        {/* Global Controls & Currency Switcher */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 text-xs w-full sm:w-auto">
          
          {/* Country / Currency Selector */}
          <div className="flex items-center gap-1.5 bg-[#0b0f17] border border-[#21293a] rounded-lg px-2 py-1">
            <Globe className="h-3.5 w-3.5 text-sky-400" />
            <select
              value={policy?.currency || 'USD'}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="INR">🇮🇳 INR (₹)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
              <option value="CAD">🇨🇦 CAD (C$)</option>
              <option value="JPY">🇯🇵 JPY (¥)</option>
              <option value="AUD">🇦🇺 AUD (A$)</option>
            </select>
          </div>

          {/* Budget Metric Summary */}
          {policy && (
            <div className="hidden md:flex items-center gap-3 bg-[#0b0f17] border border-[#21293a] rounded-lg px-3 py-1">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Monthly Limit</span>
                <span className="font-semibold text-gray-200 font-mono text-[11px]">
                  {symbol}{policy.current_spent_this_month.toLocaleString()} / <span className="text-gray-500">{symbol}{policy.monthly_budget_cap.toLocaleString()}</span>
                </span>
              </div>
              <div className="w-14 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${percentUsed > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="border-l border-[#21293a] pl-2.5">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Auto-Buy Cap</span>
                <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                  ≤ {symbol}{policy.auto_approval_threshold.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Desktop/Phone Toggle */}
          <button
            onClick={onToggleMobileMockup}
            className="hidden sm:flex px-2.5 py-1 text-xs font-medium text-gray-300 bg-[#151c2a] hover:bg-[#1e293b] border border-[#21293a] rounded-lg items-center gap-1.5 transition"
            title="Preview as Mobile Smartphone"
          >
            {isMobileMockup ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-sky-400" />
                <span>Desktop View</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-sky-400" />
                <span>Phone View</span>
              </>
            )}
          </button>

          {/* Guardrails Settings */}
          <button
            onClick={onOpenPolicy}
            className="px-2.5 py-1 text-xs font-medium text-gray-300 bg-[#151c2a] hover:bg-[#1e293b] border border-[#21293a] rounded-lg flex items-center gap-1 transition"
          >
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            <span>Limits</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetDemo}
            title="Reset Data"
            className="p-1 text-gray-400 hover:text-white bg-[#151c2a] hover:bg-[#1e293b] rounded-lg border border-[#21293a] transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}

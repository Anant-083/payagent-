import React, { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, Save } from 'lucide-react';

export default function PolicyModal({ isOpen, onClose, policy, onSavePolicy }) {
  const symbol = policy?.currency_symbol || '$';
  const [threshold, setThreshold] = useState(60);
  const [monthlyCap, setMonthlyCap] = useState(2500);

  useEffect(() => {
    if (policy) {
      setThreshold(policy.auto_approval_threshold);
      setMonthlyCap(policy.monthly_budget_cap);
    }
  }, [policy]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePolicy({
      auto_approval_threshold: Number(threshold),
      monthly_budget_cap: Number(monthlyCap)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#111622] border border-[#21293a] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-gray-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-blue-500/10 text-sky-400 rounded-xl border border-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Smart Spending Rules</h2>
            <p className="text-xs text-gray-400">Configure safety thresholds in {policy?.country || 'Local'} ({policy?.currency || 'USD'})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Auto-Buy Limit ({symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">{symbol}</span>
              <input
                type="number"
                step="any"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#21293a] focus:border-sky-500 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Orders ≤ this amount are paid automatically by the AI. Orders above this trigger a 1-tap confirmation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Monthly Budget Ceiling ({symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">{symbol}</span>
              <input
                type="number"
                step="any"
                min="10"
                value={monthlyCap}
                onChange={(e) => setMonthlyCap(e.target.value)}
                className="w-full bg-[#0b0f17] border border-[#21293a] focus:border-sky-500 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Maximum total the AI is allowed to spend in a single month.
            </p>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2 text-xs text-sky-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Protection:</strong> Your rules are enforced locally before any PayPal API request is initiated.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-[#151c2a] rounded-lg border border-[#21293a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Save Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

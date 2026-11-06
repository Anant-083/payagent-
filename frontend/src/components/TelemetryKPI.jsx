import React from 'react';
import { DollarSign, ShieldAlert, Cpu, Activity, Zap } from 'lucide-react';

export default function TelemetryKPI({ policy, transactions, health }) {
  const symbol = policy?.currency_symbol || '$';
  const totalSpent = policy ? policy.current_spent_this_month : 0;
  const autoApprovedCount = transactions.filter(t => t.approval_mode === 'AUTO_APPROVED').length;
  const humanAuthorizedCount = transactions.filter(t => t.approval_mode === 'HUMAN_APPROVED').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-2">
      {/* KPI 1 */}
      <div className="bg-[#111622] border border-[#21293a] rounded-xl p-3 sm:p-3.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">Monthly Spent</span>
          <div className="p-1 rounded-md bg-blue-500/10 text-sky-400 border border-blue-500/20">
            <DollarSign className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
            {symbol}{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            / {symbol}{policy ? policy.monthly_budget_cap.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '2,500'}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-medium truncate">
          <Zap className="h-3 w-3 shrink-0" />
          {policy ? `${Math.round(((policy.monthly_budget_cap - totalSpent) / policy.monthly_budget_cap) * 100)}% remaining allowance` : 'Ready'}
        </div>
      </div>

      {/* KPI 2 */}
      <div className="bg-[#111622] border border-[#21293a] rounded-xl p-3 sm:p-3.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">Auto-Purchases</span>
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tracking-tight">{autoApprovedCount}</span>
          <span className="text-[10px] text-gray-400">zero human delay</span>
        </div>
        <div className="mt-1 text-[10px] text-gray-400 font-mono truncate">
          Limit: ≤ {symbol}{policy ? policy.auto_approval_threshold.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '60'}
        </div>
      </div>

      {/* KPI 3 */}
      <div className="bg-[#111622] border border-[#21293a] rounded-xl p-3 sm:p-3.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">Safety Gates</span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldAlert className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold font-mono text-purple-300 tracking-tight">{humanAuthorizedCount}</span>
          <span className="text-[10px] text-gray-400">biometric check</span>
        </div>
        <div className="mt-1 text-[10px] text-purple-400 font-medium">
          Protected from overrun
        </div>
      </div>

      {/* KPI 4 */}
      <div className="bg-[#111622] border border-[#21293a] rounded-xl p-3 sm:p-3.5 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider text-[9px] sm:text-[10px]">PayPal Sandbox</span>
          <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Activity className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Active & Safe</span>
        </div>
        <div className="mt-1 text-[10px] text-gray-400 font-mono truncate">
          Test play money only
        </div>
      </div>
    </div>
  );
}

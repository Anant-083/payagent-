import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Table, Download, Search, Sparkles, ShieldCheck, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TransactionsGrid({ transactions }) {
  const gridRef = useRef();
  const [quickFilterText, setQuickFilterText] = useState('');

  // Status Badge Renderer
  const StatusRenderer = (params) => {
    const status = params.value;
    const isCaptured = status === 'CAPTURED';
    return (
      <div className="flex items-center h-full">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
          isCaptured 
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCaptured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          {status}
        </span>
      </div>
    );
  };

  // Approval Governance Mode Renderer
  const ApprovalRenderer = (params) => {
    const mode = params.value;
    const isAuto = mode === 'AUTO_APPROVED';
    return (
      <div className="flex items-center h-full">
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 ${
          isAuto 
            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' 
            : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
        }`}>
          {isAuto ? <Sparkles className="h-3 w-3 text-sky-400" /> : <ShieldCheck className="h-3 w-3 text-purple-400" />}
          {isAuto ? 'Autonomous' : 'Biometric/Human'}
        </span>
      </div>
    );
  };

  // Amount Renderer
  const AmountRenderer = (params) => {
    return (
      <div className="flex items-center h-full font-mono font-bold text-gray-100">
        ${Number(params.value).toFixed(2)}
      </div>
    );
  };

  const columnDefs = useMemo(() => [
    { field: 'id', headerName: 'Txn ID', width: 110, filter: true, cellClass: 'font-mono text-xs text-sky-400' },
    { field: 'timestamp', headerName: 'Time (UTC)', width: 160, filter: true, cellClass: 'font-mono text-xs text-gray-400' },
    { field: 'description', headerName: 'Product & Specifications', flex: 2, minWidth: 230, filter: true, cellClass: 'text-xs text-gray-200 font-medium' },
    { field: 'category', headerName: 'Category', width: 140, filter: true, cellClass: 'text-xs text-gray-400' },
    { field: 'amount', headerName: 'Total (USD)', width: 120, cellRenderer: AmountRenderer, filter: 'agNumberColumnFilter' },
    { field: 'status', headerName: 'PayPal Status', width: 140, cellRenderer: StatusRenderer, filter: true },
    { field: 'approval_mode', headerName: 'Governance Mode', width: 160, cellRenderer: ApprovalRenderer, filter: true },
    { field: 'paypal_order_id', headerName: 'PayPal Sandbox Order ID', width: 220, filter: true, cellClass: 'font-mono text-xs text-gray-400' },
    { field: 'reasoning', headerName: 'Agentic Audit Trail', flex: 2, minWidth: 260, tooltipField: 'reasoning', cellClass: 'text-xs text-gray-300' }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  const onExportClick = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({ fileName: 'payagent-audit-ledger.csv' });
    }
  };

  return (
    <div className="bg-[#111622] border border-[#21293a] rounded-xl p-4 shadow-2xl flex flex-col h-full">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-[#21293a]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Table className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">AG Grid Enterprise Audit Ledger</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {transactions.length} records
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Tamper-evident transaction ledger synchronized with PayPal Orders v2 API</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ledger..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="bg-[#0b0f17] border border-[#21293a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition w-36 sm:w-48 shadow-inner"
            />
          </div>

          {/* Export */}
          <button
            onClick={onExportClick}
            className="px-3 py-1.5 bg-[#151c2a] hover:bg-[#1e293b] text-gray-300 text-xs font-medium rounded-lg border border-[#21293a] hover:border-[#334155] flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* AG Grid Component */}
      <div className="ag-theme-quartz-dark flex-1 w-full min-h-[380px]">
        <AgGridReact
          ref={gridRef}
          rowData={transactions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          rowHeight={44}
          headerHeight={40}
          enableCellTextSelection={true}
        />
      </div>
    </div>
  );
}

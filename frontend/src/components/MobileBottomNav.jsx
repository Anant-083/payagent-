import React from 'react';
import { MessageSquare, Package, ReceiptText, Sliders } from 'lucide-react';

export default function MobileBottomNav({ activeTab, onSelectTab, onOpenPolicy }) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0b0f17]/95 backdrop-blur border-t border-[#21293a] px-4 py-2 z-50 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onSelectTab('terminal')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
          activeTab === 'terminal' ? 'text-sky-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <MessageSquare className={`h-5 w-5 ${activeTab === 'terminal' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Agent</span>
      </button>

      <button
        onClick={() => onSelectTab('catalog')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
          activeTab === 'catalog' ? 'text-sky-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Package className={`h-5 w-5 ${activeTab === 'catalog' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Products</span>
      </button>

      <button
        onClick={() => onSelectTab('grid')}
        className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
          activeTab === 'grid' ? 'text-sky-400 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <ReceiptText className={`h-5 w-5 ${activeTab === 'grid' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span>Receipts</span>
      </button>

      <button
        onClick={onOpenPolicy}
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-200 transition"
      >
        <Sliders className="h-5 w-5 stroke-2" />
        <span>Limits</span>
      </button>
    </div>
  );
}

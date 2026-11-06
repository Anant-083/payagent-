import React, { useState, useEffect } from 'react';
import { Package, Star, ShoppingBag, Search, ExternalLink } from 'lucide-react';

export default function CatalogBrowser({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const url = `http://localhost:5000/api/catalog?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.items || []);
    } catch (e) {
      console.error("Failed to load catalog", e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-sky-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Channel3 Product Feed</h3>
            <p className="text-xs text-gray-400">Clean 100M+ e-commerce product catalog accessed by PayAgent</p>
          </div>
        </div>

        {/* Filter bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[#0d1117] border border-gray-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition w-36 sm:w-44"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#0d1117] border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Furniture">Furniture</option>
            <option value="Accessories">Accessories</option>
            <option value="Supplies">Supplies</option>
          </select>
        </form>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[360px] pr-1">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-[#0d1117] border border-gray-800/90 rounded-lg p-3 hover:border-gray-700 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                <span className="truncate max-w-[120px]">{item.vendor}</span>
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {item.rating} ({item.reviews_count})
                </span>
              </div>
              <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-sky-300 transition">
                {item.name}
              </h4>
              <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                {item.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">
                ${item.price.toFixed(2)}
              </span>
              <button
                onClick={() => onSelectProduct(item)}
                className="px-2.5 py-1 text-xs font-medium bg-blue-600/20 hover:bg-blue-600 text-sky-400 hover:text-white border border-blue-500/30 rounded-md flex items-center gap-1 transition"
              >
                <ShoppingBag className="h-3 w-3" />
                Instruct Agent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

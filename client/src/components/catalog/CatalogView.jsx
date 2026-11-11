import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  Search, Filter, ShoppingCart, Plus, Check,
  Cpu, Tv, Layers, Fan, MemoryStick, HardDrive, Zap, Box
} from 'lucide-react';

export default function CatalogView() {
  const { t, i18n } = useTranslation();
  const {
    products,
    categories,
    formatUzs,
    addToCart,
    setBuilderSlot,
    setCurrentView
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc, perf

  const categoryIcons = {
    case: Box,
    cpu: Cpu,
    motherboard: Layers,
    cooler: Fan,
    ram: MemoryStick,
    gpu: Tv,
    storage: HardDrive,
    psu: Zap
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category_slug === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name_ru.toLowerCase().includes(term) ||
        p.name_en.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.model.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price_uzs - b.price_uzs);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price_uzs - a.price_uzs);
    } else if (sortBy === 'perf') {
      list.sort((a, b) => (b.benchmark_score || 0) - (a.benchmark_score || 0));
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleAddToBuilder = (product) => {
    setBuilderSlot(product.category_slug, product);
    setCurrentView('builder');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Catalog Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t('catalog.title')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {t('catalog.subtitle')}
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'bg-[#0e1424] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          {t('catalog.allCategories')} ({products.length})
        </button>

        {categories.map((cat) => {
          const Icon = categoryIcons[cat.slug] || Box;
          const count = products.filter(p => p.category_slug === cat.slug).length;

          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.slug
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#0e1424] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{i18n.language === 'en' ? cat.name_en : cat.name_ru}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.slug ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Toolbar */}
      <div className="bg-[#0e1424] border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('catalog.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
            {t('catalog.sortBy')}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="newest">{t('catalog.sortNewest')}</option>
            <option value="price_asc">{t('catalog.sortPriceAsc')}</option>
            <option value="price_desc">{t('catalog.sortPriceDesc')}</option>
            <option value="perf">{t('catalog.sortPerf')}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-slate-500 bg-[#0e1424] border border-slate-800 rounded-2xl">
          {t('catalog.emptyResults')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            return (
              <div
                key={p.id}
                className="group bg-[#0e1424] border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name_ru}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                  />
                  {/* Stock badge */}
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    {t('catalog.inStock')} ({p.in_stock})
                  </span>
                  {/* Brand pill */}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 text-cyan-400 border border-slate-700">
                    {p.brand}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tags row */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-400 mb-2">
                      {p.socket && <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.socket}</span>}
                      {p.form_factor && <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.form_factor}</span>}
                      {p.memory_type && <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.memory_type}</span>}
                      {p.vram_gb && <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.vram_gb}GB VRAM</span>}
                      {p.wattage && <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{p.wattage}W</span>}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition line-clamp-2">
                      {i18n.language === 'en' ? p.name_en : p.name_ru}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
                      {i18n.language === 'en' ? p.description_en : p.description_ru}
                    </p>
                  </div>

                  {/* Price and CTA buttons */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
                    <div className="text-xl font-black text-cyan-400 font-mono">
                      {formatUzs(p.price_uzs)}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {t('catalog.addToCart')}
                      </button>

                      <button
                        onClick={() => handleAddToBuilder(p)}
                        className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('catalog.addToBuilder')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

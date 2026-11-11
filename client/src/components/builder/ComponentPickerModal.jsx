import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import PartInspector3DModal from './PartInspector3DModal';
import { X, Search, Check, AlertTriangle, ShieldCheck, Zap, Cuboid } from 'lucide-react';

export default function ComponentPickerModal() {
  const { t, i18n } = useTranslation();
  const {
    products,
    builderConfig,
    setBuilderSlot,
    pickerModalSlot,
    setPickerModalSlot,
    formatUzs
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingPart, setInspectingPart] = useState(null);

  if (!pickerModalSlot) return null;

  // Filter products for this specific slot
  const slotProducts = useMemo(() => {
    return products.filter(p => p.category_slug === pickerModalSlot);
  }, [products, pickerModalSlot]);

  // Search filter
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return slotProducts;
    const term = searchTerm.toLowerCase();
    return slotProducts.filter(p =>
      p.name_ru.toLowerCase().includes(term) ||
      p.name_en.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.model.toLowerCase().includes(term)
    );
  }, [slotProducts, searchTerm]);

  // Check compatibility of an individual product against currently chosen parts
  const checkItemCompatibility = (item) => {
    // If checking CPU against chosen Motherboard
    if (pickerModalSlot === 'cpu' && builderConfig.motherboard) {
      if (item.socket && builderConfig.motherboard.socket && item.socket !== builderConfig.motherboard.socket) {
        return {
          compatible: false,
          reasonRu: `Несовместим с сокетом ${builderConfig.motherboard.socket} мат. платы`,
          reasonEn: `Incompatible with motherboard socket ${builderConfig.motherboard.socket}`
        };
      }
    }

    // If checking Motherboard against chosen CPU
    if (pickerModalSlot === 'motherboard' && builderConfig.cpu) {
      if (item.socket && builderConfig.cpu.socket && item.socket !== builderConfig.cpu.socket) {
        return {
          compatible: false,
          reasonRu: `Не совпадает сокет ${builderConfig.cpu.socket} процессора`,
          reasonEn: `Does not match CPU socket ${builderConfig.cpu.socket}`
        };
      }
    }

    // If checking RAM against Motherboard
    if (pickerModalSlot === 'ram' && builderConfig.motherboard) {
      if (item.memory_type && builderConfig.motherboard.memory_type && item.memory_type !== builderConfig.motherboard.memory_type) {
        return {
          compatible: false,
          reasonRu: `Плата требует память ${builderConfig.motherboard.memory_type}`,
          reasonEn: `Motherboard requires ${builderConfig.motherboard.memory_type}`
        };
      }
    }

    // If checking GPU against Case length
    if (pickerModalSlot === 'gpu' && builderConfig.case) {
      const maxLen = builderConfig.case.length_mm || 360;
      if (item.length_mm && item.length_mm > maxLen) {
        return {
          compatible: false,
          reasonRu: `Длина ${item.length_mm} мм больше допустимой в корпусе (${maxLen} мм)`,
          reasonEn: `Length ${item.length_mm}mm exceeds case limit (${maxLen}mm)`
        };
      }
    }

    return { compatible: true };
  };

  const handleSelect = (item) => {
    setBuilderSlot(pickerModalSlot, item);
    setPickerModalSlot(null);
  };

  const isCurrentSelection = (item) => {
    return builderConfig[pickerModalSlot]?.id === item.id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d121f] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                {t('builder.selectComponent')}
              </span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white">
                {t(`categories.${pickerModalSlot}`)}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Доступно моделей: {slotProducts.length}
            </p>
          </div>

          <button
            onClick={() => setPickerModalSlot(null)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-[#090d16]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              {t('catalog.emptyResults')}
            </div>
          ) : (
            filtered.map((item) => {
              const comp = checkItemCompatibility(item);
              const selected = isCurrentSelection(item);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    selected
                      ? 'bg-cyan-950/30 border-cyan-500/80 ring-1 ring-cyan-500/50'
                      : !comp.compatible
                      ? 'bg-red-950/15 border-red-900/40 opacity-75'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left info & image */}
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.image_url}
                      alt={item.name_ru}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-800 bg-slate-950 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {item.brand}
                        </span>
                        {item.socket && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.socket}
                          </span>
                        )}
                        {item.form_factor && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.form_factor}
                          </span>
                        )}
                        {item.memory_type && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            {item.memory_type}
                          </span>
                        )}
                        {item.wattage && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                            {item.wattage}W
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-semibold text-white mt-1">
                        {i18n.language === 'en' ? item.name_en : item.name_ru}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {i18n.language === 'en' ? item.description_en : item.description_ru}
                      </p>

                      {/* Compatibility badge */}
                      {!comp.compatible ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{i18n.language === 'en' ? comp.reasonEn : comp.reasonRu}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Совместимо / Compatible</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Price & Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-lg font-bold text-cyan-400 font-mono">
                      {formatUzs(item.price_uzs)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingPart(item)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="3D Осмотр детали"
                      >
                        <Cuboid className="w-3.5 h-3.5" />
                        <span>3D</span>
                      </button>

                      <button
                        onClick={() => handleSelect(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          selected
                            ? 'bg-cyan-500 text-black'
                            : comp.compatible
                            ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black border border-cyan-500/40'
                            : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40'
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="w-4 h-4" />
                            Выбрано
                          </>
                        ) : (
                          'Выбрать в сборку'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {inspectingPart && (
        <PartInspector3DModal
          part={inspectingPart}
          onClose={() => setInspectingPart(null)}
          onSelect={(selected) => {
            handleSelect(selected);
            setInspectingPart(null);
          }}
        />
      )}
    </div>
  );
}

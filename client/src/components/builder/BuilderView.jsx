import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import PcVisualizer from './PcVisualizer';
import PcVisualizer3D from './PcVisualizer3D';
import PartInspector3DModal from './PartInspector3DModal';
import {
  Box, Cpu, Layers, Fan, MemoryStick, Tv, HardDrive, Zap,
  CheckCircle2, AlertOctagon, AlertTriangle, Plus, Trash2, RefreshCw, ShoppingCart, Gauge,
  BoxSelect, Cuboid
} from 'lucide-react';

export default function BuilderView() {
  const { t, i18n } = useTranslation();
  const {
    builderConfig,
    setPickerModalSlot,
    removeBuilderSlot,
    clearBuilder,
    builderTotalPrice,
    builderPartsCount,
    formatUzs,
    compatibility,
    setCurrentView,
    setIsCheckoutOpen
  } = useShop();

  // Visualizer mode toggle: '2d' or '3d'
  const [visualizerMode, setVisualizerMode] = useState('3d');
  const [inspectingPart, setInspectingPart] = useState(null);

  const slots = [
    { slug: 'case', icon: Box, label: t('categories.case') },
    { slug: 'cpu', icon: Cpu, label: t('categories.cpu') },
    { slug: 'motherboard', icon: Layers, label: t('categories.motherboard') },
    { slug: 'cooler', icon: Fan, label: t('categories.cooler') },
    { slug: 'ram', icon: MemoryStick, label: t('categories.ram') },
    { slug: 'gpu', icon: Tv, label: t('categories.gpu') },
    { slug: 'storage', icon: HardDrive, label: t('categories.storage') },
    { slug: 'psu', icon: Zap, label: t('categories.psu') }
  ];

  const handleOrderBuild = () => {
    if (builderPartsCount === 0) return;
    setIsCheckoutOpen(true);
  };

  const handleTestFps = () => {
    setCurrentView('fps');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header & Metrics Bar */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('builder.title')}
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {t('builder.subtitle')}
            </p>
          </div>

          {/* Stats and Order CTA */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Wattage Meter */}
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1 font-semibold">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                {t('builder.totalWattage')}
              </div>
              <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                ~{compatibility.totalWattage} W
                <span className="text-xs text-slate-400 font-normal ml-1">
                  (рек. {compatibility.recommendedPsuWattage}W)
                </span>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-slate-900/90 border border-cyan-900/40 px-5 py-2.5 rounded-xl glow-cyan">
              <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
                {t('builder.totalPrice')} ({builderPartsCount}/8)
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                {formatUzs(builderTotalPrice)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {builderPartsCount > 0 && (
                <button
                  onClick={clearBuilder}
                  className="p-3 rounded-xl bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-700 transition"
                  title={t('builder.clearConfig')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleTestFps}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/50 text-sm font-semibold flex items-center gap-2 transition"
              >
                <Gauge className="w-4 h-4" />
                <span className="hidden sm:inline">{t('builder.testFps')}</span>
                <span className="sm:hidden">FPS</span>
              </button>

              <button
                onClick={handleOrderBuild}
                disabled={builderPartsCount === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {t('builder.orderBuild')}
              </button>
            </div>
          </div>
        </div>

        {/* Compatibility Alert Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          {compatibility.isCompatible ? (
            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{t('builder.compatibleAll')}</span>
            </div>
          ) : (
            <div className="bg-red-950/30 border border-red-800/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5" />
                <span>{t('builder.issuesDetected')}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-red-300 pl-2">
                {compatibility.issues.map((iss, i) => (
                  <li key={i}>
                    <strong>{i18n.language === 'en' ? iss.titleEn : iss.titleRu}:</strong>{' '}
                    {i18n.language === 'en' ? iss.descEn : iss.descRu}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {compatibility.warnings.length > 0 && (
            <div className="mt-2 bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                {compatibility.warnings.map((w, idx) => (
                  <p key={idx}>{i18n.language === 'en' ? w.descEn : w.descRu}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Left Slots List, Right Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 8 Component Slots */}
        <div className="lg:col-span-6 space-y-3.5">
          {slots.map((slot) => {
            const Icon = slot.icon;
            const item = builderConfig[slot.slug];

            return (
              <div
                key={slot.slug}
                className={`p-4 rounded-2xl border transition ${
                  item
                    ? 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50'
                    : 'bg-[#0b0f19] border-dashed border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Slot Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${item ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                        {slot.label}
                      </span>
                      {item ? (
                        <h4 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-[340px]">
                          {i18n.language === 'en' ? item.name_en : item.name_ru}
                        </h4>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          {t('builder.emptySlot')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slot Action Button */}
                  {item ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-cyan-400 font-mono hidden sm:inline">
                        {formatUzs(item.price_uzs)}
                      </span>
                      <button
                        onClick={() => setInspectingPart(item)}
                        className="p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/40 transition"
                        title="3D Осмотр детали"
                      >
                        <Cuboid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPickerModalSlot(slot.slug)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title={t('builder.changeComponent')}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBuilderSlot(slot.slug)}
                        className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition"
                        title={t('builder.removeComponent')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPickerModalSlot(slot.slug)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      {t('builder.selectComponent')}
                    </button>
                  )}
                </div>

                {/* Selected Item mini specs */}
                {item && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2 flex-wrap font-mono">
                      <span className="text-slate-300">{item.brand}</span>
                      {item.socket && <span>• {item.socket}</span>}
                      {item.form_factor && <span>• {item.form_factor}</span>}
                      {item.memory_type && <span>• {item.memory_type}</span>}
                      {item.tdp > 0 && <span>• {item.tdp}W TDP</span>}
                      {item.vram_gb && <span>• {item.vram_gb}GB VRAM</span>}
                      {item.wattage && <span>• {item.wattage}W</span>}
                    </div>
                    <span className="font-bold text-cyan-400 font-mono sm:hidden">
                      {formatUzs(item.price_uzs)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Visualizer (Sticky on desktop) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-3">
          {/* Mode Switcher Tabs: 2D Blueprint vs 3D Assembly */}
          <div className="flex items-center justify-between bg-[#0e1424] border border-slate-800 p-1.5 rounded-2xl">
            <div className="flex items-center gap-1 w-full">
              <button
                onClick={() => setVisualizerMode('3d')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  visualizerMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cuboid className="w-4 h-4" />
                <span>3D Сборка ПК (WebGL 360°)</span>
              </button>

              <button
                onClick={() => setVisualizerMode('2d')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  visualizerMode === '2d'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BoxSelect className="w-4 h-4" />
                <span>2D Схема (Разрез корпуса)</span>
              </button>
            </div>
          </div>

          {/* Visualizer Body */}
          {visualizerMode === '3d' ? <PcVisualizer3D /> : <PcVisualizer />}
        </div>
      </div>

      {/* Individual Part 3D Inspection Modal */}
      {inspectingPart && (
        <PartInspector3DModal
          part={inspectingPart}
          onClose={() => setInspectingPart(null)}
        />
      )}
    </div>
  );
}

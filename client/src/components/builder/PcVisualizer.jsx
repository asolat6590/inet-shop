import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { Sparkles, Eye, ZoomIn, ZoomOut, RotateCcw, Zap } from 'lucide-react';

export default function PcVisualizer() {
  const { t, i18n } = useTranslation();
  const {
    builderConfig,
    visualizerSettings,
    setVisualizerSettings,
    setPickerModalSlot
  } = useShop();

  const { rgbEnabled, rgbColor, zoomLevel } = visualizerSettings;

  // Colors for RGB lighting
  const rgbMap = {
    cyan: '#06b6d4',
    purple: '#a855f7',
    green: '#10b981',
    pink: '#ec4899',
    white: '#f8fafc',
    rainbow: '#38bdf8'
  };

  const activeRgb = rgbEnabled ? (rgbMap[rgbColor] || '#06b6d4') : 'transparent';
  const glowFilter = rgbEnabled ? `drop-shadow(0 0 10px ${activeRgb})` : 'none';

  const hasCase = !!builderConfig.case;
  const hasMobo = !!builderConfig.motherboard;
  const hasCpu = !!builderConfig.cpu;
  const hasCooler = !!builderConfig.cooler;
  const hasRam = !!builderConfig.ram;
  const hasGpu = !!builderConfig.gpu;
  const hasStorage = !!builderConfig.storage;
  const hasPsu = !!builderConfig.psu;

  const isLiquidCooler = builderConfig.cooler?.name_en?.toLowerCase().includes('liquid') ||
                        builderConfig.cooler?.name_en?.toLowerCase().includes('aio') ||
                        builderConfig.cooler?.name_en?.toLowerCase().includes('lt720') ||
                        builderConfig.cooler?.name_en?.toLowerCase().includes('kraken');

  const handleZoom = (delta) => {
    setVisualizerSettings(prev => ({
      ...prev,
      zoomLevel: Math.max(0.7, Math.min(1.4, prev.zoomLevel + delta))
    }));
  };

  const resetZoom = () => {
    setVisualizerSettings(prev => ({ ...prev, zoomLevel: 1.0 }));
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Top Controls Bar */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            {t('builder.visualizerTitle')}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
            LIVE 2D CHASSIS
          </span>
        </div>

        {/* RGB Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <button
              onClick={() => setVisualizerSettings(prev => ({ ...prev, rgbEnabled: !prev.rgbEnabled }))}
              className={`text-xs font-medium px-2 py-0.5 rounded transition ${
                rgbEnabled ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              RGB {rgbEnabled ? 'ON' : 'OFF'}
            </button>
            {rgbEnabled && (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
                {['cyan', 'purple', 'green', 'pink', 'white'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setVisualizerSettings(prev => ({ ...prev, rgbColor: c }))}
                    className={`w-3.5 h-3.5 rounded-full border transition ${
                      rgbColor === c ? 'scale-125 border-white ring-2 ring-cyan-400/50' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: rgbMap[c] }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800/90 px-1 py-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 hover:text-cyan-400 transition text-slate-400"
              title={t('builder.zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 hover:text-cyan-400 transition text-slate-400"
              title={t('builder.zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 hover:text-cyan-400 transition text-slate-400 ml-0.5"
              title={t('builder.resetView')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG PC Chassis Canvas */}
      <div className="relative flex-1 min-h-[460px] p-4 flex items-center justify-center bg-radial-gradient overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 600 680"
            className="w-[440px] md:w-[480px] h-[520px] drop-shadow-2xl select-none"
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="moboGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="gpuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.01)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0.04)" />
              </linearGradient>
              <filter id="rgbGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ================= 1. CASE CHASSIS ================= */}
            <g
              onClick={() => setPickerModalSlot('case')}
              className="cursor-pointer group"
            >
              {/* Outer Case Outline */}
              <rect
                x="40"
                y="30"
                width="520"
                height="620"
                rx="14"
                fill="url(#chassisGrad)"
                stroke={hasCase ? '#38bdf8' : '#334155'}
                strokeWidth={hasCase ? '3' : '2'}
                strokeDasharray={hasCase ? 'none' : '6 4'}
              />

              {/* Case Feet */}
              <rect x="70" y="650" width="60" height="15" rx="3" fill="#0f172a" stroke="#334155" />
              <rect x="470" y="650" width="60" height="15" rx="3" fill="#0f172a" stroke="#334155" />

              {/* Top Fan / Radiator Mounting Bracket */}
              <rect x="80" y="45" width="440" height="40" rx="4" fill="#0b0f19" stroke="#1e293b" />
              {/* Ventilation Mesh dots */}
              {[...Array(20)].map((_, i) => (
                <circle key={i} cx={100 + i * 21} cy="65" r="4" fill="#1e293b" />
              ))}

              {/* PSU Shroud Basement */}
              <rect
                x="60"
                y="520"
                width="480"
                height="115"
                rx="6"
                fill="#0b0f19"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <text x="80" y="545" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="bold">
                PSU CHAMBER
              </text>

              {!hasCase && (
                <text x="300" y="320" fill="#64748b" textAnchor="middle" fontSize="15" fontWeight="bold">
                  + {t('categories.case')} (Нажмите для выбора)
                </text>
              )}
            </g>

            {/* ================= 2. POWER SUPPLY (PSU) ================= */}
            <g
              onClick={() => setPickerModalSlot('psu')}
              className="cursor-pointer group"
            >
              {hasPsu ? (
                <>
                  <rect
                    x="75"
                    y="535"
                    width="230"
                    height="90"
                    rx="6"
                    fill="#182234"
                    stroke="#06b6d4"
                    strokeWidth="2"
                  />
                  {/* PSU Fan Grille */}
                  <circle cx="140" cy="580" r="30" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <circle cx="140" cy="580" r="14" fill="#1e293b" />
                  <path d="M 120 580 L 160 580 M 140 560 L 140 600" stroke="#475569" strokeWidth="2" />
                  <text x="185" y="570" fill="#f8fafc" fontSize="12" fontWeight="bold">
                    {builderConfig.psu.brand}
                  </text>
                  <text x="185" y="588" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                    {builderConfig.psu.wattage}W {builderConfig.psu.efficiency_rating}
                  </text>
                  <path
                    d="M 305 580 Q 340 580 350 510 Q 360 450 380 430"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <rect
                  x="75"
                  y="535"
                  width="230"
                  height="90"
                  rx="6"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeDasharray="4 3"
                />
              )}
            </g>

            {/* ================= 3. MOTHERBOARD ================= */}
            <g
              onClick={() => setPickerModalSlot('motherboard')}
              className="cursor-pointer group"
            >
              {hasMobo ? (
                <>
                  {/* Motherboard PCB */}
                  <rect
                    x="100"
                    y="105"
                    width="390"
                    height="390"
                    rx="8"
                    fill="url(#moboGrad)"
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                  {/* VRM Heatsinks */}
                  <rect x="115" y="115" width="45" height="130" rx="3" fill="#312e81" stroke="#4338ca" />
                  <rect x="160" y="115" width="130" height="35" rx="3" fill="#312e81" stroke="#4338ca" />
                  <text x="175" y="138" fill="#a5b4fc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    {builderConfig.motherboard.model?.substring(0, 18)}
                  </text>

                  {/* Motherboard Chipset Heatsink */}
                  <rect x="360" y="380" width="110" height="95" rx="4" fill="#1e1b4b" stroke="#4f46e5" />
                  <text x="415" y="435" fill="#818cf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {builderConfig.motherboard.socket}
                  </text>

                  {/* PCIe Slots */}
                  <rect x="120" y="330" width="310" height="12" rx="2" fill="#090d16" stroke="#475569" />
                  <rect x="120" y="410" width="220" height="10" rx="2" fill="#090d16" stroke="#334155" />
                </>
              ) : (
                <rect
                  x="100"
                  y="105"
                  width="390"
                  height="390"
                  rx="8"
                  fill="#0b0f19"
                  stroke="#334155"
                  strokeDasharray="6 4"
                />
              )}
            </g>

            {/* ================= 4. CPU SOCKET & CPU ================= */}
            <g
              onClick={() => setPickerModalSlot('cpu')}
              className="cursor-pointer group"
            >
              {/* CPU Socket outline */}
              <rect x="210" y="165" width="105" height="105" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              {hasCpu ? (
                <>
                  {/* CPU IHS (Integrated Heat Spreader) */}
                  <rect x="220" y="175" width="85" height="85" rx="4" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="262" y="215" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {builderConfig.cpu.brand?.toUpperCase()}
                  </text>
                  <text x="262" y="230" fill="#1e293b" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {builderConfig.cpu.socket}
                  </text>
                </>
              ) : (
                <text x="262" y="222" fill="#64748b" fontSize="10" textAnchor="middle">
                  CPU
                </text>
              )}
            </g>

            {/* ================= 5. RAM SLOTS & STICKS ================= */}
            <g
              onClick={() => setPickerModalSlot('ram')}
              className="cursor-pointer group"
            >
              {/* 4 RAM Slots */}
              {[0, 1, 2, 3].map((slotIdx) => {
                const x = 340 + slotIdx * 18;
                return (
                  <rect
                    key={slotIdx}
                    x={x}
                    y="150"
                    width="10"
                    height="130"
                    rx="2"
                    fill="#090d16"
                    stroke="#334155"
                  />
                );
              })}

              {hasRam && (
                <>
                  {/* RAM Stick 1 & 2 (Dual Channel) */}
                  <rect
                    x="358"
                    y="145"
                    width="10"
                    height="140"
                    rx="2"
                    fill="#1e293b"
                    stroke={activeRgb}
                    strokeWidth="1.5"
                    filter={rgbEnabled ? 'url(#rgbGlow)' : 'none'}
                  />
                  <rect
                    x="394"
                    y="145"
                    width="10"
                    height="140"
                    rx="2"
                    fill="#1e293b"
                    stroke={activeRgb}
                    strokeWidth="1.5"
                    filter={rgbEnabled ? 'url(#rgbGlow)' : 'none'}
                  />
                  {/* ARGB Diffuser Light Strip on top */}
                  {rgbEnabled && (
                    <>
                      <rect x="359" y="145" width="8" height="35" rx="1" fill={activeRgb} />
                      <rect x="395" y="145" width="8" height="35" rx="1" fill={activeRgb} />
                    </>
                  )}
                </>
              )}
            </g>

            {/* ================= 6. STORAGE (M.2 NVMe) ================= */}
            <g
              onClick={() => setPickerModalSlot('storage')}
              className="cursor-pointer group"
            >
              {hasStorage ? (
                <>
                  <rect x="170" y="295" width="120" height="24" rx="2" fill="#182234" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="230" y="311" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    NVMe M.2 SSD ({builderConfig.storage.capacity_gb}GB)
                  </text>
                  <circle cx="280" cy="307" r="2.5" fill="#10b981" />
                </>
              ) : null}
            </g>

            {/* ================= 7. COOLER / AIO LIQUID ================= */}
            <g
              onClick={() => setPickerModalSlot('cooler')}
              className="cursor-pointer group"
            >
              {hasCooler && isLiquidCooler && (
                <>
                  {/* Top 360mm Radiator */}
                  <rect x="100" y="48" width="400" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  {/* 3 Radiator Fans */}
                  {[0, 1, 2].map((fIdx) => (
                    <g key={fIdx}>
                      <circle
                        cx={160 + fIdx * 120}
                        cy="64"
                        r="14"
                        fill="#1e293b"
                        stroke={activeRgb}
                        strokeWidth="2"
                        filter={rgbEnabled ? 'url(#rgbGlow)' : 'none'}
                      />
                    </g>
                  ))}
                  {/* Liquid Cooling Braided Tubes */}
                  <path
                    d="M 430 80 C 440 140, 310 160, 290 200"
                    stroke="#334155"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 450 80 C 460 150, 320 170, 300 215"
                    stroke="#1e293b"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Infinity Mirror AIO Pump Block on CPU */}
                  <circle
                    cx="262"
                    cy="217"
                    r="34"
                    fill="#090d16"
                    stroke={activeRgb}
                    strokeWidth="3"
                    filter={rgbEnabled ? 'url(#rgbGlow)' : 'none'}
                  />
                  <circle cx="262" cy="217" r="22" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" />
                  <text x="262" y="221" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                    AIO
                  </text>
                </>
              )}

              {hasCooler && !isLiquidCooler && (
                <>
                  {/* Air Dual Tower Cooler */}
                  <rect
                    x="185"
                    y="145"
                    width="155"
                    height="140"
                    rx="6"
                    fill="#334155"
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                  {/* Aluminum Heat Fins */}
                  {[...Array(12)].map((_, i) => (
                    <line key={i} x1="190" y1={155 + i * 10} x2="335" y2={155 + i * 10} stroke="#1e293b" strokeWidth="2" />
                  ))}
                  {/* Center RGB Fan */}
                  <circle
                    cx="262"
                    cy="215"
                    r="40"
                    fill="none"
                    stroke={activeRgb}
                    strokeWidth="3"
                    filter={rgbEnabled ? 'url(#rgbGlow)' : 'none'}
                  />
                </>
              )}
            </g>

            {/* ================= 8. GRAPHICS CARD (GPU) ================= */}
            <g
              onClick={() => setPickerModalSlot('gpu')}
              className="cursor-pointer group"
            >
              {hasGpu ? (
                <>
                  {/* GPU Main Shroud */}
                  <rect
                    x="110"
                    y="325"
                    width="370"
                    height="75"
                    rx="6"
                    fill="url(#gpuGrad)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                  {/* 3 GPU Axial Fans */}
                  {[0, 1, 2].map((gIdx) => (
                    <g key={gIdx}>
                      <circle
                        cx={170 + gIdx * 105}
                        cy="362"
                        r="26"
                        fill="#090d16"
                        stroke="#475569"
                        strokeWidth="2"
                      />
                      <circle
                        cx={170 + gIdx * 105}
                        cy="362"
                        r="11"
                        fill="#1e293b"
                        stroke={activeRgb}
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                  {/* GPU Illuminated Brand Logo */}
                  <rect x="390" y="335" width="80" height="20" rx="3" fill="#090d16" />
                  <text
                    x="430"
                    y="349"
                    fill={activeRgb || '#38bdf8'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {builderConfig.gpu.brand?.toUpperCase()}
                  </text>
                  {/* 12VHPWR PCIe Power Cable */}
                  <path
                    d="M 440 375 L 440 430 Q 440 460 380 480"
                    stroke="#0f172a"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <rect
                  x="110"
                  y="325"
                  width="370"
                  height="70"
                  rx="6"
                  fill="#0b0f19"
                  stroke="#334155"
                  strokeDasharray="6 4"
                />
              )}
            </g>

            {/* ================= 9. TEMPERED GLASS OVERLAY ================= */}
            <rect
              x="50"
              y="40"
              width="500"
              height="600"
              rx="12"
              fill="url(#glassGrad)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              pointerEvents="none"
            />

            {/* Glass corner thumb screws */}
            <circle cx="65" cy="55" r="4.5" fill="#334155" stroke="#64748b" />
            <circle cx="535" cy="55" r="4.5" fill="#334155" stroke="#64748b" />
            <circle cx="65" cy="625" r="4.5" fill="#334155" stroke="#64748b" />
            <circle cx="535" cy="625" r="4.5" fill="#334155" stroke="#64748b" />
          </svg>
        </div>
      </div>

      {/* Interactive Legend / Status bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Кликните по любой детали на схеме для быстрого выбора или замены</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={hasMobo ? 'text-green-400' : 'text-slate-500'}>MOBO ●</span>
          <span className={hasCpu ? 'text-green-400' : 'text-slate-500'}>CPU ●</span>
          <span className={hasRam ? 'text-green-400' : 'text-slate-500'}>RAM ●</span>
          <span className={hasGpu ? 'text-green-400' : 'text-slate-500'}>GPU ●</span>
          <span className={hasPsu ? 'text-green-400' : 'text-slate-500'}>PSU ●</span>
        </div>
      </div>
    </div>
  );
}

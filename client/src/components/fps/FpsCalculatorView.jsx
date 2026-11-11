import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  Gauge, Monitor, Sliders, Cpu, Tv, MemoryStick,
  AlertCircle, CheckCircle2, Search, Flame, Sparkles
} from 'lucide-react';

export default function FpsCalculatorView() {
  const { t, i18n } = useTranslation();
  const {
    games,
    builderConfig,
    fpsSettings,
    setFpsSettings,
    fpsResults,
    bottleneck,
    setCurrentView
  } = useShop();

  const [searchGame, setSearchGame] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  const resolutions = [
    { id: '1080p', label: '1080p FHD', sub: '1920×1080' },
    { id: '1440p', label: '1440p 2K', sub: '2560×1440' },
    { id: '4k', label: '2160p 4K', sub: '3840×2160' }
  ];

  const presets = [
    { id: 'low', label: t('fps.presets.low'), color: 'from-blue-600 to-cyan-500' },
    { id: 'med', label: t('fps.presets.med'), color: 'from-cyan-500 to-emerald-500' },
    { id: 'high', label: t('fps.presets.high'), color: 'from-purple-500 to-indigo-500' },
    { id: 'ultra', label: t('fps.presets.ultra'), color: 'from-pink-500 to-rose-600' }
  ];

  // Map results by gameId
  const resultsMap = useMemo(() => {
    const map = {};
    fpsResults.forEach(r => { map[r.gameId] = r; });
    return map;
  }, [fpsResults]);

  // Filter games
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchSearch = g.title.toLowerCase().includes(searchGame.toLowerCase()) ||
                          (g.genre && g.genre.toLowerCase().includes(searchGame.toLowerCase()));
      const matchGenre = filterGenre === 'all' || g.genre?.toLowerCase().includes(filterGenre.toLowerCase());
      return matchSearch && matchGenre;
    });
  }, [games, searchGame, filterGenre]);

  // FPS badge helper
  const getFpsBadge = (fps) => {
    if (fps >= 120) {
      return {
        bg: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300',
        label: t('fps.ratings.esports'),
        barColor: 'bg-emerald-400'
      };
    } else if (fps >= 60) {
      return {
        bg: 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300',
        label: t('fps.ratings.smooth'),
        barColor: 'bg-cyan-400'
      };
    } else if (fps >= 30) {
      return {
        bg: 'bg-amber-950/80 border-amber-500/60 text-amber-300',
        label: t('fps.ratings.playable'),
        barColor: 'bg-amber-400'
      };
    } else {
      return {
        bg: 'bg-red-950/80 border-red-500/60 text-red-300',
        label: t('fps.ratings.unplayable'),
        barColor: 'bg-red-500'
      };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Gauge className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('fps.title')}
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              {t('fps.subtitle')}
            </p>
          </div>

          {/* Current Hardware Specs Pill */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300 font-mono">
                {builderConfig.cpu ? builderConfig.cpu.model : 'Core i7-14700K (Эталон)'}
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <Tv className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-300 font-mono">
                {builderConfig.gpu ? builderConfig.gpu.model : 'RTX 4070 Ti SUPER (Эталон)'}
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <MemoryStick className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-mono">
                {builderConfig.ram ? `${builderConfig.ram.capacity_gb}GB` : '32GB RAM'}
              </span>
            </div>
            <button
              onClick={() => setCurrentView('builder')}
              className="text-xs text-cyan-400 hover:underline font-semibold ml-2"
            >
              Сменить в Конструкторе →
            </button>
          </div>
        </div>

        {/* Bottleneck Meter */}
        {bottleneck && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${bottleneck.status === 'optimal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'}`}>
                  {bottleneck.status === 'optimal' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {t('fps.bottleneckTitle')}:
                    <span className="text-cyan-400 font-mono">{bottleneck.bottleneckPercentage}%</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {i18n.language === 'en' ? bottleneck.messageEn : bottleneck.messageRu}
                  </p>
                </div>
              </div>

              {/* Progress Bar Balance */}
              <div className="w-full md:w-56 flex-shrink-0">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>CPU Balance</span>
                  <span>GPU Balance</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.max(20, Math.min(80, 50 - (bottleneck.bottleneckComponent === 'cpu' ? bottleneck.bottleneckPercentage / 2 : -bottleneck.bottleneckPercentage / 2)))}%` }}
                  />
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.max(20, Math.min(80, 50 + (bottleneck.bottleneckComponent === 'cpu' ? bottleneck.bottleneckPercentage / 2 : -bottleneck.bottleneckPercentage / 2)))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolution and Preset Selectors */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Resolutions */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-cyan-400" />
              {t('fps.selectResolution')}
            </div>
            <div className="flex items-center gap-2">
              {resolutions.map((res) => (
                <button
                  key={res.id}
                  onClick={() => setFpsSettings(prev => ({ ...prev, resolution: res.id }))}
                  className={`px-4 py-2.5 rounded-xl border text-left transition ${
                    fpsSettings.resolution === res.id
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{res.label}</div>
                  <div className={`text-[10px] font-mono ${fpsSettings.resolution === res.id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {res.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Graphics Presets */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              {t('fps.selectPreset')}
            </div>
            <div className="flex items-center gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFpsSettings(prev => ({ ...prev, preset: p.id }))}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                    fpsSettings.preset === p.id
                      ? 'bg-gradient-to-r text-white border-transparent shadow-lg ' + p.color
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('fps.searchGame')}
            value={searchGame}
            onChange={(e) => setSearchGame(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0e1424] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {t('fps.gamesCount')} <span className="text-cyan-400 font-bold">{filteredGames.length}</span> / {games.length}
        </div>
      </div>

      {/* 20 Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => {
          const res = resultsMap[game.id];
          const avgFps = res ? res.avgFps : 60;
          const lowFps = res ? res.lowFps : 48;
          const badge = getFpsBadge(avgFps);

          return (
            <div
              key={game.id}
              className="group bg-[#0e1424] border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 flex flex-col"
            >
              {/* Game Cover Image Header */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={game.cover_image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1424] via-transparent to-black/60" />

                {/* Genre badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                    {game.genre || 'Action'}
                  </span>
                  {game.release_year && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-cyan-400 border border-white/10">
                      {game.release_year}
                    </span>
                  )}
                </div>

                {/* Big FPS Counter Overlay */}
                <div className="absolute bottom-3 right-3 text-right">
                  <div className="text-3xl font-black font-mono tracking-tighter text-white drop-shadow-md">
                    {avgFps} <span className="text-xs font-semibold uppercase text-cyan-400">FPS</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 drop-shadow">
                    1% Low: <span className="font-bold">{lowFps} FPS</span>
                  </div>
                </div>
              </div>

              {/* Game Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition line-clamp-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {i18n.language === 'en' ? game.description_en : game.description_ru}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {/* Rating Tag */}
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold text-center mb-2.5 ${badge.bg}`}>
                    {badge.label}
                  </div>

                  {/* Visual FPS Bar Meter */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${badge.barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (avgFps / 165) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  Cpu, ShoppingCart, Layers, Gauge, Box, Globe,
  ShieldAlert, Menu, X
} from 'lucide-react';

export default function Header() {
  const { t } = useTranslation();
  const {
    currentView,
    setCurrentView,
    cartItemsCount,
    setIsCartOpen,
    language,
    changeLanguage,
    builderPartsCount
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'catalog', label: t('nav.catalog'), icon: Box },
    { id: 'builder', label: t('nav.builder'), icon: Layers, badge: builderPartsCount > 0 ? `${builderPartsCount}/8` : null },
    { id: 'fps', label: t('nav.fpsCalculator'), icon: Gauge }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-white flex items-center gap-1.5 font-mono">
                CYBER<span className="text-cyan-400">PULSE</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold font-mono">
                PC Builder • Uzbekistan
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0e1424] px-2 py-1.5 rounded-2xl border border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black text-cyan-400' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Toolbar: Language Switcher & Cart */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#0e1424] border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => changeLanguage('ru')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                  language === 'ru'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                  language === 'en'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 hover:border-cyan-500/60 text-slate-200 hover:text-cyan-400 transition"
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-black font-black text-[11px] flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentView(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    isActive ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-900 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/20">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

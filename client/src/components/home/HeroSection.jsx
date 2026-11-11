import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  Layers, Gauge, ShoppingCart, Sparkles, Send, ShieldCheck,
  Cpu, Tv, Flame, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';

export default function HeroSection() {
  const { t } = useTranslation();
  const { setCurrentView } = useShop();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1424] via-[#090d16] to-[#080c14] border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Glow orb background accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {t('hero.title1')}{' '}
            <span className="text-gradient-neon block mt-1">
              {t('hero.title2')}
            </span>
          </h1>

          <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentView('builder')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition group"
            >
              <Layers className="w-4 h-4" />
              <span>{t('hero.startBuilding')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setCurrentView('fps')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition"
            >
              <Gauge className="w-4 h-4 text-purple-400" />
              <span>{t('hero.testFps')}</span>
            </button>

            <button
              onClick={() => setCurrentView('catalog')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition"
            >
              {t('hero.exploreCatalog')}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillars: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pillar 1: Visual PC Builder */}
        <div
          onClick={() => setCurrentView('builder')}
          className="group cursor-pointer p-8 rounded-3xl bg-[#0e1424] border border-slate-800 hover:border-cyan-500/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
              Интерактивный 2D Конструктор
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Наблюдайте, как шаг за шагом собирается ваш компьютер: материнская плата, процессор, кулер, память, видеокарта и подсветка ARGB наглядно визуализируются в корпусе в реальном времени.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-cyan-400 gap-1.5 group-hover:translate-x-1 transition">
            <span>Открыть сборщик</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pillar 2: 20 Heavy Games FPS Calculator */}
        <div
          onClick={() => setCurrentView('fps')}
          className="group cursor-pointer p-8 rounded-3xl bg-[#0e1424] border border-slate-800 hover:border-purple-500/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">
              FPS в 20 самых тяжелых играх
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Точный расчет кадров в секунду (Cyberpunk 2077, Black Myth: Wukong, S.T.A.L.K.E.R. 2, Alan Wake 2) на пресетах Low, Med, High, Ultra в разрешениях 1080p, 1440p и 4K с анализом Bottleneck.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-purple-400 gap-1.5 group-hover:translate-x-1 transition">
            <span>Рассчитать FPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Pillar 3: Telegram Bot Payments in UZS */}
        <div
          onClick={() => setCurrentView('catalog')}
          className="group cursor-pointer p-8 rounded-3xl bg-[#0e1424] border border-slate-800 hover:border-emerald-500/50 shadow-xl transition duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
              Оплата через Telegram в UZS
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Прямая передача заказа с полной спецификацией ПК в Telegram-аккаунт владельца. Оплата в узбекских сумах через Payme, Click или банковские переводы с мгновенным подтверждением.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-emerald-400 gap-1.5 group-hover:translate-x-1 transition">
            <span>Выбрать комплектующие</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

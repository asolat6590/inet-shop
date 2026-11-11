import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { Cpu, Send, Lock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const { setCurrentView } = useShop();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#060910] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black">
                <Cpu className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black text-white font-mono">
                CYBER<span className="text-cyan-400">PULSE</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Интернет-магазин оригинальных комплектующих для ПК в Ташкенте и по всему Узбекистану. Интерактивный конфигуратор ПК, калькулятор FPS на 20 тяжелых игр и удобная оплата через Telegram.
            </p>
            <div className="text-[11px] text-cyan-400 font-mono">
              Валюта: Узбекский сум (UZS) • Быстрая доставка по Республике Узбекистан
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Контакты
            </h4>
            <p className="text-slate-300">г. Ташкент, Узбекистан</p>
            <p className="font-mono text-slate-300">+998 (90) 123-45-67</p>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@cyberpulse_pc</span>
            </a>
          </div>

          {/* Quick links & Hidden Admin entrance */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Сервис
            </h4>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => setCurrentView('catalog')}
                className="text-left text-slate-400 hover:text-white transition"
              >
                Каталог комплектующих
              </button>
              <button
                onClick={() => setCurrentView('builder')}
                className="text-left text-slate-400 hover:text-white transition"
              >
                Конструктор ПК
              </button>
              <button
                onClick={() => setCurrentView('fps')}
                className="text-left text-slate-400 hover:text-white transition"
              >
                Тест FPS в 20 играх
              </button>
              
              {/* Discrete hidden entrance for shop owner */}
              <button
                onClick={() => setCurrentView('admin')}
                className="text-left text-slate-600 hover:text-cyan-400 transition flex items-center gap-1.5 pt-2 text-[11px]"
                title="Скрытая панель администратора"
              >
                <Lock className="w-3 h-3" />
                <span>{t('nav.secretAdmin')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 CYBERPULSE PC Shop. Все права защищены.
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by Node.js, React & Telegram Bot API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

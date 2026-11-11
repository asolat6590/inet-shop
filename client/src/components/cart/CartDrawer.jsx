import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { t, i18n } = useTranslation();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartTotal,
    cartItemsCount,
    formatUzs,
    setIsCheckoutOpen,
    setCurrentView
  } = useShop();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d121f] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t('cart.title')}
                </h2>
                <span className="text-xs text-slate-400">
                  {cartItemsCount} {t('cart.itemsCount')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t('cart.emptyTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {t('cart.emptyDesc')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-xs transition hover:bg-cyan-400"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-4"
                >
                  <img
                    src={item.image_url}
                    alt={item.name_ru}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                      {item.brand}
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">
                      {i18n.language === 'en' ? item.name_en : item.name_ru}
                    </h4>
                    <div className="text-xs font-bold text-cyan-400 font-mono mt-1">
                      {formatUzs(item.price_uzs)}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          className="p-1 hover:text-cyan-400 text-slate-400 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 1)}
                          className="p-1 hover:text-cyan-400 text-slate-400 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-[#090d16] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t('cart.total')}</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {formatUzs(cartTotal)}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                >
                  <span>{t('cart.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-xs text-slate-500 hover:text-red-400 transition text-center"
                >
                  {t('cart.clear')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

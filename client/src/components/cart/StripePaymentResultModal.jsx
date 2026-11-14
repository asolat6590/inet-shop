import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Send, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function StripePaymentResultModal() {
  const { clearCart } = useShop();
  const [modalState, setModalState] = useState(null); // { type: 'success' | 'cancel', orderNumber, sessionId, isVerifying, error }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSuccess = params.get('stripe_success');
    const stripeCancel = params.get('stripe_cancel');
    const orderNumber = params.get('order_number');
    const sessionId = params.get('session_id');

    if (stripeSuccess === 'true' && sessionId) {
      setModalState({
        type: 'success',
        orderNumber,
        sessionId,
        isVerifying: true,
        error: null
      });

      // Clear the local cart on successful Stripe payment
      clearCart();

      // Verify the session on the backend to update database and notify Telegram
      fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.isPaid) {
            setModalState(prev => prev ? { ...prev, isVerifying: false } : null);
          } else {
            setModalState(prev => prev ? { ...prev, isVerifying: false, error: 'Платеж в обработке' } : null);
          }
        })
        .catch(err => {
          console.error('Stripe verification error:', err);
          setModalState(prev => prev ? { ...prev, isVerifying: false } : null);
        });
    } else if (stripeCancel === 'true') {
      setModalState({
        type: 'cancel',
        orderNumber: orderNumber || '',
        sessionId: null,
        isVerifying: false,
        error: null
      });
    }
  }, [clearCart]);

  const handleClose = () => {
    // Clear URL query params cleanly without reloading
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    setModalState(null);
  };

  if (!modalState) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d121f] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        {modalState.type === 'success' ? (
          <div>
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              {modalState.isVerifying ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {modalState.isVerifying ? 'Проверка оплаты Stripe...' : 'Оплата успешно принята! 🎉'}
            </h3>

            <p className="text-sm text-slate-300 mb-4">
              {modalState.isVerifying
                ? 'Связываемся со шлюзом Stripe для подтверждения...'
                : 'Ваш платеж через Stripe (Visa / MasterCard / Apple Pay) успешно проведен.'}
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Номер заказа:</span>
                <span className="font-mono font-bold text-cyan-400">#{modalState.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Способ оплаты:</span>
                <span className="font-semibold text-slate-200">Stripe Online</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Статус:</span>
                <span className="font-bold text-emerald-400">ОПЛАЧЕН</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2 mb-6 text-left">
              <Send className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Менеджер магазина уже получил уведомление об оплате в Telegram и готовит заказ к сборке!</span>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition"
            >
              <span>Вернуться в магазин</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Оплата Stripe отменена
            </h3>

            <p className="text-sm text-slate-300 mb-4">
              Вы отменили процесс оплаты в Stripe. Заказ сохранен, вы можете повторить попытку или выбрать другой метод.
            </p>

            {modalState.orderNumber && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-6">
                Заказ <span className="font-mono text-cyan-400">#{modalState.orderNumber}</span> ожидает оплаты.
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

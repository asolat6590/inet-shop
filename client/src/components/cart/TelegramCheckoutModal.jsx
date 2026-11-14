import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  X, Send, CheckCircle2, ShieldCheck, CreditCard,
  Building, Phone, User, MapPin, AtSign, Loader2, ExternalLink,
  UploadCloud, Image, Trash2, FileCheck, Mail
} from 'lucide-react';

export default function TelegramCheckoutModal() {
  const { t, i18n } = useTranslation();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    builderConfig,
    builderTotalPrice,
    builderPartsCount,
    cartTotal,
    clearCart,
    formatUzs
  } = useShop();

  // If cart is empty but builder has parts, default to builder order
  const isBuilderOrder = cart.length === 0 && builderPartsCount > 0;
  const grandTotal = isBuilderOrder ? builderTotalPrice : cartTotal;

  const [form, setForm] = useState({
    name: '',
    phone: '+998 ',
    telegram: '',
    email: '',
    address: '',
    paymentMethod: 'stripe'
  });

  const [receiptFile, setReceiptFile] = useState(null); // { name, size, base64, previewUrl }
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCheckoutOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер 15 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptFile({
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        base64: reader.result,
        previewUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMessage('Пожалуйста, укажите ваше имя и номер телефона.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare items payload
      let itemsPayload;
      if (isBuilderOrder) {
        itemsPayload = Object.entries(builderConfig)
          .filter(([_, item]) => item !== null)
          .map(([slot, item]) => ({
            slot,
            id: item.id,
            name_ru: item.name_ru,
            name_en: item.name_en,
            brand: item.brand,
            model: item.model,
            price_uzs: item.price_uzs,
            quantity: 1
          }));
      } else {
        itemsPayload = cart.map(item => ({
          id: item.id,
          name_ru: item.name_ru,
          name_en: item.name_en,
          brand: item.brand,
          model: item.model,
          price_uzs: item.price_uzs,
          quantity: item.quantity
        }));
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_tg: form.telegram,
          shipping_address: form.address,
          items: itemsPayload,
          total_uzs: grandTotal,
          payment_method: form.paymentMethod,
          receipt_base64: receiptFile ? receiptFile.base64 : null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // If user selected Stripe, create checkout session and redirect to Stripe
      if (form.paymentMethod === 'stripe') {
        try {
          const stripeRes = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: data.order.order_number,
              items: itemsPayload,
              totalUzs: grandTotal,
              customerEmail: form.email,
              customerName: form.name
            })
          });

          const stripeData = await stripeRes.json();
          if (stripeData.success && stripeData.url) {
            if (!isBuilderOrder) {
              clearCart();
            }
            window.location.href = stripeData.url;
            return;
          } else {
            throw new Error(stripeData.error || 'Не удалось создать сессию оплаты Stripe');
          }
        } catch (stripeErr) {
          console.error('Stripe redirect error:', stripeErr);
          setErrorMessage(stripeErr.message || 'Ошибка подключения к Stripe');
          setIsSubmitting(false);
          return;
        }
      }

      setOrderResult(data);
      if (!isBuilderOrder) {
        clearCart();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Ошибка соединения с сервером.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0d121f] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t('checkout.title')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('checkout.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderResult ? (
            /* Order Success View */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {t('checkout.successTitle')}
                </h3>
                <div className="mt-2 inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-sm">
                  {t('checkout.orderNumber')}: {orderResult.order?.order_number}
                </div>
                <p className="text-xs text-slate-300 mt-4 max-w-md mx-auto leading-relaxed">
                  {i18n.language === 'en'
                    ? orderResult.paymentInfo?.instructionsEn
                    : orderResult.paymentInfo?.instructionsRu}
                </p>
              </div>

              {/* Order total banner */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">{t('cart.total')}:</span>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {formatUzs(grandTotal)}
                </span>
              </div>

              {/* Telegram status notice */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Заказ и чек отправлены в Telegram менеджера</span>
                </div>
                <p className="text-slate-300">
                  {orderResult.receiptUrl
                    ? 'Чек об оплате успешно передан менеджеру вместе с составом сборки. Ожидайте подтверждения!'
                    : 'Менеджер получил полный список компонентов, сумму в сумах и ваши контакты.'}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition"
              >
                {t('checkout.close')}
              </button>
            </div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Total summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">
                    {isBuilderOrder ? 'Сборка ПК из Конструктора' : 'Товары из Корзины'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isBuilderOrder ? `${builderPartsCount} деталей` : `${cart.length} позиций`}
                  </span>
                </div>
                <span className="text-xl font-black text-cyan-400 font-mono">
                  {formatUzs(grandTotal)}
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  {t('checkout.name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров / Jasur Alimov"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Phone & Telegram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123-45-67"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-purple-400" />
                    {t('checkout.tgHandle')}
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={form.telegram}
                    onChange={(e) => setForm(prev => ({ ...prev, telegram: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Email (for Stripe Receipts & Notifications) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Email (для квитанции Stripe / чека)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {form.paymentMethod === 'stripe' ? 'Рекомендуется для Stripe' : 'Необязательно'}
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {t('checkout.address')}
                </label>
                <input
                  type="text"
                  placeholder="г. Ташкент, Мирзо-Улугбекский р-н..."
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  {t('checkout.paymentMethod')}
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'stripe',
                      label: t('checkout.methods.stripe'),
                      sub: 'Visa, MasterCard, Apple Pay, Google Pay',
                      badge: '⚡ Быстро и безопасно'
                    },
                    {
                      id: 'telegram_payme',
                      label: t('checkout.methods.telegram_payme'),
                      sub: 'Бот выставит счет Click / Payme'
                    },
                    {
                      id: 'bank_card',
                      label: t('checkout.methods.bank_card'),
                      sub: 'Реквизиты карты HUMO / UzCard'
                    },
                    {
                      id: 'cash_pickup',
                      label: t('checkout.methods.cash_pickup'),
                      sub: 'Оплата наличными в шоуруме'
                    }
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        form.paymentMethod === m.id
                          ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={form.paymentMethod === m.id}
                          onChange={(e) => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-2">
                            <span>{m.label}</span>
                            {m.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{m.sub}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Receipt Image Upload (Чек об оплате) */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    Прикрепить чек об оплате (Скриншот)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Необязательно
                  </span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-file-input"
                />

                {!receiptFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/40 hover:bg-slate-800/40"
                  >
                    <Image className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
                    <div className="text-xs font-semibold text-slate-200">
                      Нажмите для загрузки чека / скриншота оплаты
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      JPG, PNG или WEBP (Click, Payme, квитанция банка)
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={receiptFile.previewUrl}
                        alt="Receipt preview"
                        className="w-12 h-12 object-cover rounded-lg border border-cyan-800 bg-slate-950 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                          <FileCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{receiptFile.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Размер: {receiptFile.size} • Будет передан в Telegram
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                      title="Удалить чек"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || grandTotal === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {form.paymentMethod === 'stripe'
                        ? (i18n.language === 'en' ? 'Redirecting to Stripe...' : 'Переход к оплате Stripe...')
                        : t('checkout.processing')}
                    </>
                  ) : form.paymentMethod === 'stripe' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {i18n.language === 'en' ? `Pay with Stripe (${formatUzs(grandTotal)})` : `Оплатить через Stripe (${formatUzs(grandTotal)})`}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('checkout.submitOrder')}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSetting } from './telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export function getStripeKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    getSetting('stripe_secret_key') ||
    ''
  ).trim();
}

export function getStripePublishableKey() {
  return (
    process.env.STRIPE_PUBLISHABLE_KEY ||
    getSetting('stripe_publishable_key') ||
    ''
  ).trim();
}

export function isStripeConfigured() {
  const key = getStripeKey();
  return Boolean(key && key.startsWith('sk_'));
}

export function getStripeInstance() {
  const key = getStripeKey();
  if (!key) return null;
  return new Stripe(key);
}

/**
 * Creates a Stripe Checkout Session for an order
 */
export async function createCheckoutSession({ orderNumber, items, totalUzs, customerEmail, customerName, originUrl }) {
  const stripe = getStripeInstance();
  if (!stripe) {
    throw new Error('Stripe Secret Key не настроен. Укажите STRIPE_SECRET_KEY в .env или панели администратора.');
  }

  const successUrl = `${originUrl}/?stripe_success=true&order_number=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${originUrl}/?stripe_cancel=true&order_number=${orderNumber}`;

  // Attempt 1: Native UZS (zero-decimal currency)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: orderNumber,
      metadata: {
        order_number: orderNumber,
        customer_name: customerName || ''
      },
      line_items: items.map(item => ({
        price_data: {
          currency: 'uzs',
          product_data: {
            name: `${item.name_ru || item.name_en || 'Комплектующие для ПК'} (${item.model || ''})`.trim(),
            description: item.brand ? `Бренд: ${item.brand}` : undefined,
          },
          unit_amount: Math.round(item.price_uzs)
        },
        quantity: item.quantity || 1
      })),
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    return { sessionUrl: session.url, sessionId: session.id, currency: 'uzs' };
  } catch (err) {
    // If Stripe account currency settings do not allow direct UZS charges, fall back to USD equivalent
    if (err.message && (err.message.toLowerCase().includes('currency') || err.message.includes('UZS'))) {
      console.warn('[Stripe] UZS is not enabled for this Stripe account. Automatically converting to USD equivalent (1 USD = 12,800 UZS)...');
      const USD_RATE = 12800;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customerEmail || undefined,
        client_reference_id: orderNumber,
        metadata: {
          order_number: orderNumber,
          customer_name: customerName || ''
        },
        line_items: items.map(item => {
          const usdPriceCents = Math.max(50, Math.round(((item.price_uzs || 0) / USD_RATE) * 100));
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${item.name_ru || item.name_en || 'PC Hardware'} (${item.model || ''})`.trim(),
                description: `${item.brand || ''} (Цена в сумах: ${new Intl.NumberFormat('ru-RU').format(item.price_uzs)} UZS)`,
              },
              unit_amount: usdPriceCents
            },
            quantity: item.quantity || 1
          };
        }),
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      return { sessionUrl: session.url, sessionId: session.id, currency: 'usd' };
    }
    throw err;
  }
}

/**
 * Verifies a Stripe Checkout Session status
 */
export async function verifyCheckoutSession(sessionId) {
  const stripe = getStripeInstance();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    isPaid: session.payment_status === 'paid',
    orderNumber: session.client_reference_id || session.metadata?.order_number,
    customerEmail: session.customer_details?.email,
    amountTotal: session.amount_total,
    currency: session.currency
  };
}

export default {
  getStripeKey,
  getStripePublishableKey,
  isStripeConfigured,
  getStripeInstance,
  createCheckoutSession,
  verifyCheckoutSession
};

import express from 'express';
import db from '../db/index.js';
import {
  isStripeConfigured,
  getStripePublishableKey,
  createCheckoutSession,
  verifyCheckoutSession
} from '../services/stripe.js';
import { getBotInstance, getManagerChatId, formatUzs, escapeHtml } from '../services/telegramBot.js';

const router = express.Router();

// GET Stripe configuration status
router.get('/stripe/config', (req, res) => {
  res.json({
    configured: isStripeConfigured(),
    publishableKey: getStripePublishableKey()
  });
});

// POST Create Stripe Checkout Session
router.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { orderNumber, items, totalUzs, customerEmail, customerName } = req.body;

    if (!orderNumber || !items || !items.length) {
      return res.status(400).json({ error: 'Order items and orderNumber are required' });
    }

    // Determine base URL from headers or fallback
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://inet-shop-theta.vercel.app';

    const sessionData = await createCheckoutSession({
      orderNumber,
      items,
      totalUzs,
      customerEmail,
      customerName,
      originUrl: origin
    });

    res.json({
      success: true,
      url: sessionData.sessionUrl,
      sessionId: sessionData.sessionId,
      currency: sessionData.currency
    });
  } catch (error) {
    console.error('[Stripe Checkout Error]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST Verify Stripe Checkout Session and mark order paid
router.post('/stripe/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const verification = await verifyCheckoutSession(sessionId);

    if (verification.isPaid && verification.orderNumber) {
      // Update order status in database
      await db.prepare("UPDATE orders SET status = 'paid' WHERE order_number = ?").run(verification.orderNumber);

      // Notify manager in Telegram
      const managerChatId = getManagerChatId();
      const bot = getBotInstance();
      if (bot && managerChatId) {
        try {
          const paidMsg = `
🎉 <b>ОПЛАТА ПОЛУЧЕНА ЧЕРЕЗ STRIPE!</b>
━━━━━━━━━━━━━━━━━━━━
💳 <b>Заказ:</b> #<code>${escapeHtml(verification.orderNumber)}</code>
✅ <b>Статус:</b> ОПЛАЧЕН (Stripe Card / Apple Pay)
💰 <b>Сумма:</b> ${verification.amountTotal} ${verification.currency?.toUpperCase()}
📧 <b>Email плательщика:</b> ${escapeHtml(verification.customerEmail || 'Не указан')}
📅 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
━━━━━━━━━━━━━━━━━━━━
<i>Заказ переведен в статус «Оплачен» и готов к сборке и отправке клиенту.</i>
`.trim();

          await bot.sendMessage(managerChatId, paidMsg, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: `📦 Заказ #${verification.orderNumber}`, callback_data: `noop` }
                ]
              ]
            }
          });
          console.log(`[Stripe] Successfully marked order #${verification.orderNumber} as paid and alerted manager.`);
        } catch (tgErr) {
          console.warn('[Stripe] Failed to send Telegram alert:', tgErr.message);
        }
      }

      return res.json({
        success: true,
        isPaid: true,
        orderNumber: verification.orderNumber
      });
    }

    res.json({
      success: true,
      isPaid: false,
      orderNumber: verification.orderNumber
    });
  } catch (error) {
    console.error('[Stripe Verify Error]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

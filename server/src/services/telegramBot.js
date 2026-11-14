import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import db, { getCachedSetting, setCachedSetting } from '../db/index.js';

dotenv.config();

let botInstance = null;
let currentToken = null;

export function getSetting(key, defaultValue = '') {
  return getCachedSetting(key, defaultValue);
}

export function setSetting(key, value) {
  setCachedSetting(key, value);
  return true;
}

export function getBotToken() {
  return (
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.TG_BOT_TOKEN ||
    getSetting('tg_bot_token') ||
    ''
  ).trim();
}

export function getManagerChatId() {
  return (
    process.env.TELEGRAM_MANAGER_CHAT_ID ||
    process.env.MANAGER_CHAT_ID ||
    process.env.TG_OWNER_CHAT_ID ||
    getSetting('tg_owner_chat_id') ||
    ''
  ).trim();
}

/**
 * Initializes or restarts Telegram bot instance with current token from .env or DB
 */
export function initTelegramBot() {
  const token = getBotToken();

  if (!token) {
    console.log('[Telegram Bot] Token is not configured. Running in simulated notification mode.');
    botInstance = null;
    currentToken = null;
    return null;
  }

  if (botInstance && currentToken === token) {
    return botInstance;
  }

  try {
    if (botInstance) {
      botInstance.stopPolling();
    }

    const isServerless = !!process.env.VERCEL;
    botInstance = new TelegramBot(token, { polling: !isServerless });
    currentToken = token;
    console.log(`[Telegram Bot] Initialized successfully with polling ${!isServerless ? 'enabled' : 'disabled (serverless mode)'}.`);

    // Handle bot commands
    botInstance.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const text = `👋 *Добро пожаловать в бот интернет-магазина ПК!*\n\nВаш Chat ID: \`${chatId}\`\nИспользуйте этот Chat ID в настройках скрытой панели администратора, чтобы получать заказы и платежи прямо сюда!`;
      botInstance.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    });

    // Handle inline button callbacks (Confirm / Reject payment)
    botInstance.on('callback_query', async (query) => {
      const data = query.data;
      const [action, orderNumber] = data.split(':');

      if (action === 'confirm_order') {
        await db.prepare("UPDATE orders SET status = 'paid' WHERE order_number = ?").run(orderNumber);
        botInstance.answerCallbackQuery(query.id, { text: `Заказ #${orderNumber} подтвержден как оплаченный!` });
        botInstance.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: `✅ ОПЛАЧЕН (#${orderNumber})`, callback_data: 'noop' }]] },
          { chat_id: query.message.chat.id, message_id: query.message.message_id }
        );
      } else if (action === 'reject_order') {
        await db.prepare("UPDATE orders SET status = 'cancelled' WHERE order_number = ?").run(orderNumber);
        botInstance.answerCallbackQuery(query.id, { text: `Заказ #${orderNumber} отклонен.` });
        botInstance.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: `❌ ОТКЛОНЕН (#${orderNumber})`, callback_data: 'noop' }]] },
          { chat_id: query.message.chat.id, message_id: query.message.message_id }
        );
      }
    });

    return botInstance;
  } catch (error) {
    console.error('[Telegram Bot] Initialization error:', error.message);
    botInstance = null;
    return null;
  }
}

export function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format currency in UZS
 */
export function formatUzs(amount) {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' сум';
}

/**
 * Get current bot instance
 */
export function getBotInstance() {
  return initTelegramBot();
}

/**
 * Sends order notification and receipt image to store manager's Telegram account
 */
export async function sendOrderToOwner(order, receiptPhoto = null, fileOptions = { filename: 'receipt.jpg', contentType: 'image/jpeg' }) {
  const managerChatId = getManagerChatId();
  const bot = initTelegramBot();

  const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;

  let itemsHtmlList = '';
  let itemsPlainList = '';

  if (Array.isArray(items)) {
    itemsHtmlList = items.map((it, idx) => {
      const name = it.name_ru || it.name || it.model || 'Товар';
      const price = formatUzs(it.price_uzs || it.price || 0);
      const qty = it.quantity || 1;
      return `${idx + 1}. <b>${escapeHtml(name)}</b> × ${qty}\n   └ ${price}`;
    }).join('\n');

    itemsPlainList = items.map((it, idx) => {
      const name = it.name_ru || it.name || it.model || 'Товар';
      const price = formatUzs(it.price_uzs || it.price || 0);
      const qty = it.quantity || 1;
      return `${idx + 1}. ${name} x ${qty} - ${price}`;
    }).join('\n');
  } else if (typeof items === 'object') {
    // Configuration object
    itemsHtmlList = Object.entries(items).map(([slot, it]) => {
      if (!it) return null;
      const name = it.name_ru || it.name || it.model;
      const price = formatUzs(it.price_uzs || it.price || 0);
      return `• <b>${escapeHtml(slot.toUpperCase())}</b>: ${escapeHtml(name)} — ${price}`;
    }).filter(Boolean).join('\n');

    itemsPlainList = Object.entries(items).map(([slot, it]) => {
      if (!it) return null;
      const name = it.name_ru || it.name || it.model;
      const price = formatUzs(it.price_uzs || it.price || 0);
      return `• ${slot.toUpperCase()}: ${name} - ${price}`;
    }).filter(Boolean).join('\n');
  }

  const receiptNoticeHtml = (receiptPhoto || order.receipt_url) ? '\n📸 <b>ЧЕК ОБ ОПЛАТЕ ПРИКРЕПЛЕН</b>' : '';
  const receiptNoticePlain = (receiptPhoto || order.receipt_url) ? '\n[ЧЕК ОБ ОПЛАТЕ ПРИКРЕПЛЕН]' : '';

  const customerTgDisplay = order.customer_tg && order.customer_tg.trim()
    ? '@' + order.customer_tg.replace('@', '').trim()
    : 'не указан';

  const htmlMessage = `
🔔 <b>НОВЫЙ ЗАКАЗ #${escapeHtml(order.order_number)}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Покупатель:</b> ${escapeHtml(order.customer_name)}
📞 <b>Телефон:</b> <code>${escapeHtml(order.customer_phone)}</code>
💬 <b>Telegram:</b> ${escapeHtml(customerTgDisplay)}
📍 <b>Адрес:</b> ${escapeHtml(order.shipping_address || 'Самовывоз / Не указан')}
💳 <b>Способ оплаты:</b> ${escapeHtml(order.payment_method || 'Telegram / Click / Payme')}${receiptNoticeHtml}

📦 <b>СОСТАВ ЗАКАЗА / СБОРКИ:</b>
${itemsHtmlList || '— Комплектующие'}

━━━━━━━━━━━━━━━━━━━━
💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${formatUzs(order.total_uzs)}</b>
📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}
`.trim();

  const plainMessage = `
НОВЫЙ ЗАКАЗ #${order.order_number}
------------------------------------
Покупатель: ${order.customer_name}
Телефон: ${order.customer_phone}
Telegram: ${customerTgDisplay}
Адрес: ${order.shipping_address || 'Самовывоз / Не указан'}
Оплата: ${order.payment_method || 'Telegram / Click / Payme'}${receiptNoticePlain}

СОСТАВ ЗАКАЗА:
${itemsPlainList || '- Комплектующие'}

ИТОГО К ОПЛАТЕ: ${formatUzs(order.total_uzs)}
Дата: ${new Date().toLocaleString('ru-RU')}
`.trim();

  // Telegram Inline Action buttons for the manager
  const actionRow = [
    { text: '✅ Подтвердить оплату', callback_data: `confirm_order:${order.order_number}` },
    { text: '❌ Отклонить', callback_data: `reject_order:${order.order_number}` }
  ];
  if (order.receipt_url && order.receipt_url.startsWith('http')) {
    actionRow.push({ text: '📸 Чек онлайн', url: order.receipt_url });
  }

  const inlineKeyboard = [actionRow];

  if (order.customer_tg && order.customer_tg.trim()) {
    const handle = order.customer_tg.replace(/[@\s]/g, '');
    if (/^[a-zA-Z0-9_]{3,32}$/.test(handle)) {
      inlineKeyboard.push([
        { text: '💬 Написать клиенту в TG', url: `https://t.me/${handle}` }
      ]);
    }
  }

  if (bot && managerChatId) {
    try {
      if (receiptPhoto) {
        try {
          if (htmlMessage.length <= 1024) {
            await bot.sendPhoto(managerChatId, receiptPhoto, {
              caption: htmlMessage,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard }
            }, fileOptions);
          } else {
            await bot.sendMessage(managerChatId, htmlMessage, { parse_mode: 'HTML' });
            await bot.sendPhoto(managerChatId, receiptPhoto, {
              caption: `📸 <b>Чек об оплате к заказу #${escapeHtml(order.order_number)}</b> (${formatUzs(order.total_uzs)})`,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard }
            }, fileOptions);
          }
        } catch (photoErr) {
          console.warn('[Telegram Bot] Failed to send photo, falling back to message:', photoErr.message);
          await bot.sendMessage(managerChatId, htmlMessage, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        }
      } else {
        try {
          await bot.sendMessage(managerChatId, htmlMessage, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        } catch (htmlErr) {
          console.warn('[Telegram Bot] HTML send failed, falling back to plain text:', htmlErr.message);
          await bot.sendMessage(managerChatId, plainMessage, {
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        }
      }

      console.log(`[Telegram Bot] Order #${order.order_number} successfully sent to manager chat ${managerChatId}`);
      await db.prepare('UPDATE orders SET tg_notified = 1 WHERE order_number = ?').run(order.order_number);
      return { success: true, notified: true };
    } catch (err) {
      console.error('[Telegram Bot] Failed to send message to manager:', err.message);
      // Last-ditch emergency attempt with raw plain text
      try {
        await bot.sendMessage(managerChatId, plainMessage);
        await db.prepare('UPDATE orders SET tg_notified = 1 WHERE order_number = ?').run(order.order_number);
        return { success: true, notified: true };
      } catch (lastErr) {
        return { success: false, error: err.message, notified: false, text: plainMessage };
      }
    }
  } else {
    console.log(`[Telegram Bot Simulation] Order #${order.order_number} ready for Telegram:`, htmlMessage);
    return {
      success: true,
      simulated: true,
      notified: false,
      reason: !bot ? 'No bot token configured' : 'No manager chat ID configured',
      text: htmlMessage
    };
  }
}

/**
 * Send test ping message to manager Telegram
 */
export async function sendTestMessage(chatId) {
  const bot = initTelegramBot();
  if (!bot) {
    throw new Error('Telegram Bot токен не задан. Укажите TELEGRAM_BOT_TOKEN в файле .env или в настройках.');
  }

  const targetChatId = chatId || getManagerChatId();
  if (!targetChatId) {
    throw new Error('Telegram Chat ID менеджера не задан. Укажите TELEGRAM_MANAGER_CHAT_ID в .env.');
  }

  const text = `🚀 *Тестовое сообщение от интернет-магазина ПК!*\n\nСвязь с Telegram ботом успешно установлена!\nВсе чеки и заказы покупателей будут мгновенно приходить сюда.`;
  await bot.sendMessage(targetChatId, text, { parse_mode: 'Markdown' });
  return true;
}

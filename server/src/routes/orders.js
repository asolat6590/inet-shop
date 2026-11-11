import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/index.js';
import { sendOrderToOwner, getSetting } from '../services/telegramBot.js';
import { uploadToStorage, getStoragePresignedUrl } from '../services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST create order
router.post('/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_tg,
      shipping_address,
      items,
      total_uzs,
      payment_method = 'telegram_payme',
      receipt_base64 = null
    } = req.body;

    if (!customer_name || !customer_phone || !items || !total_uzs) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const orderNumber = 'PC-' + Math.floor(100000 + Math.random() * 900000);
    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);

    // Handle receipt upload to Neon Object Storage
    let receiptUrl = null;
    let receiptFilePath = null;

    if (receipt_base64 && typeof receipt_base64 === 'string') {
      try {
        const matches = receipt_base64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        let ext = 'jpg';
        let base64Data = receipt_base64;
        let mimeType = 'image/jpeg';

        if (matches && matches.length === 3) {
          ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          base64Data = matches[2];
          mimeType = `image/${matches[1]}`;
        }

        const fileName = `receipt-${orderNumber}.${ext}`;
        const fileBuffer = Buffer.from(base64Data, 'base64');

        // 1. Upload to Neon Object Storage
        try {
          const storageRes = await uploadToStorage({
            buffer: fileBuffer,
            key: `receipts/${fileName}`,
            contentType: mimeType
          });
          // Generate a presigned URL or public storage URL
          receiptUrl = storageRes.url;
          console.log(`[Neon Object Storage] Uploaded receipt ${fileName} -> ${receiptUrl}`);
        } catch (storageErr) {
          console.error('[Neon Object Storage] Upload failed, falling back:', storageErr.message);
        }

        // 2. Also keep local copy for Telegram sendPhoto
        const receiptsDir = path.join(__dirname, '..', '..', 'uploads', 'receipts');
        if (!fs.existsSync(receiptsDir)) {
          fs.mkdirSync(receiptsDir, { recursive: true });
        }
        receiptFilePath = path.join(receiptsDir, fileName);
        fs.writeFileSync(receiptFilePath, fileBuffer);

        if (!receiptUrl) {
          receiptUrl = `/uploads/receipts/${fileName}`;
        }
      } catch (err) {
        console.error('Failed to process receipt image:', err);
      }
    }

    const stmt = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_tg,
        shipping_address, items_json, total_uzs, payment_method, receipt_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    await stmt.run(
      orderNumber,
      customer_name,
      customer_phone,
      customer_tg || '',
      shipping_address || '',
      itemsJson,
      Number(total_uzs),
      payment_method,
      receiptUrl
    );

    const createdOrder = await db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);

    // Send Telegram Notification & Receipt to Owner/Manager
    const tgResult = await sendOrderToOwner(createdOrder, receiptFilePath);

    // Payment details from settings
    const storePhone = getSetting('store_phone', '+998 (90) 123-45-67');
    const storeAddress = getSetting('store_address', 'Tashkent, Uzbekistan');

    res.status(201).json({
      success: true,
      order: createdOrder,
      telegram: tgResult,
      receiptUrl,
      paymentInfo: {
        orderNumber,
        totalUzs: total_uzs,
        storePhone,
        storeAddress,
        instructionsRu: 'Ваш заказ и чек об оплате успешно переданы менеджеру в Telegram! Менеджер свяжется с вами или подтвердит оплату через бота.',
        instructionsEn: 'Your order and payment receipt have been sent to our manager in Telegram! We will contact you or confirm your payment.'
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET order by order number
router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const order = await db.prepare('SELECT * FROM orders WHERE order_number = ?').get(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

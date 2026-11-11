import express from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
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
    let receiptBuffer = null;
    let fileOptions = null;

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
        receiptBuffer = Buffer.from(base64Data, 'base64');
        fileOptions = { filename: fileName, contentType: mimeType };

        // 1. Upload to Neon Object Storage
        try {
          const storageRes = await uploadToStorage({
            buffer: receiptBuffer,
            key: `receipts/${fileName}`,
            contentType: mimeType
          });
          // Also generate a presigned URL valid for 7 days so anyone with the link can view it
          try {
            receiptUrl = await getStoragePresignedUrl({
              key: `receipts/${fileName}`,
              expiresIn: 604800 // 7 days
            });
          } catch (signErr) {
            receiptUrl = storageRes.url;
          }
          console.log(`[Neon Object Storage] Uploaded receipt ${fileName} -> ${receiptUrl}`);
        } catch (storageErr) {
          console.error('[Neon Object Storage] Upload failed, falling back:', storageErr.message);
        }

        // 2. Safe local write (non-fatal if read-only on serverless)
        try {
          const baseUploadsDir = process.env.VERCEL
            ? path.join(os.tmpdir(), 'receipts')
            : path.join(__dirname, '..', '..', 'uploads', 'receipts');
          if (!fs.existsSync(baseUploadsDir)) {
            fs.mkdirSync(baseUploadsDir, { recursive: true });
          }
          fs.writeFileSync(path.join(baseUploadsDir, fileName), receiptBuffer);
        } catch (fsErr) {
          // Non-fatal on serverless environments
        }

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

    // Send Telegram Notification & Receipt directly as Buffer to Manager
    const tgResult = await sendOrderToOwner(createdOrder, receiptBuffer, fileOptions);

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

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRoutes from '../server/src/routes/products.js';
import gamesRoutes from '../server/src/routes/games.js';
import compatibilityRoutes from '../server/src/routes/compatibility.js';
import ordersRoutes from '../server/src/routes/orders.js';
import adminRoutes from '../server/src/routes/admin.js';
import { initTelegramBot } from '../server/src/services/telegramBot.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Routes
app.use('/api', productsRoutes);
app.use('/api', gamesRoutes);
app.use('/api', compatibilityRoutes);
app.use('/api', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverless: true, time: new Date().toISOString() });
});

try {
  initTelegramBot();
} catch (e) {
  console.warn('Telegram bot init warning:', e.message);
}

export default app;

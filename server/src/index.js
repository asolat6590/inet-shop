import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRoutes from './routes/products.js';
import gamesRoutes from './routes/games.js';
import compatibilityRoutes from './routes/compatibility.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import { initTelegramBot } from './services/telegramBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server folder and workspace root
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

import fs from 'fs';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api', productsRoutes);
app.use('/api', gamesRoutes);
app.use('/api', compatibilityRoutes);
app.use('/api', ordersRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend static build if exists
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback to index.html for SPA client-side routing (e.g. /vault-admin-99)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // If request contains a file extension and wasn't matched by express.static, return 404
  if (path.extname(req.path)) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start Telegram Bot
try {
  initTelegramBot();
} catch (e) {
  console.warn('Telegram bot warning on startup:', e.message);
}

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 PC Hardware Store running on http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🎮 20 Heavy Games FPS Engine: Ready`);
  console.log(`🔒 Hidden Admin Route: http://localhost:${PORT}/vault-admin-99`);
  console.log(`===============================================`);
});

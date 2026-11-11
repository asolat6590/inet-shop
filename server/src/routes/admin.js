import express from 'express';
import db, { getCachedSetting, setCachedSetting } from '../db/index.js';
import { getSetting, setSetting, sendTestMessage, initTelegramBot } from '../services/telegramBot.js';

const router = express.Router();

// Simple auth middleware for admin
const verifyAdminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.headers['authorization'];
  const storedPassword = getSetting('admin_password', 'admin123');

  if (!token || (token !== storedPassword && token !== `Bearer ${storedPassword}`)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin credentials.' });
  }
  next();
};

// Admin Login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const storedPassword = getSetting('admin_password', 'admin123');

  if (password === storedPassword) {
    res.json({
      success: true,
      token: storedPassword,
      secretPath: getSetting('secret_admin_path', 'vault-admin-99')
    });
  } else {
    res.status(401).json({ success: false, error: 'Неверный пароль администратора / Invalid password' });
  }
});

// Admin Overview Dashboard Stats
router.get('/overview', verifyAdminAuth, async (req, res) => {
  try {
    const productsCountRow = await db.prepare('SELECT COUNT(*) as count FROM products').get();
    const gamesCountRow = await db.prepare('SELECT COUNT(*) as count FROM games').get();
    const ordersCountRow = await db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const totalRevenueRow = await db.prepare("SELECT SUM(total_uzs) as sum FROM orders WHERE status = 'paid'").get();
    const recentOrders = await db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();

    res.json({
      stats: {
        productsCount: productsCountRow ? productsCountRow.count : 0,
        gamesCount: gamesCountRow ? gamesCountRow.count : 0,
        ordersCount: ordersCountRow ? ordersCountRow.count : 0,
        totalRevenue: totalRevenueRow ? totalRevenueRow.sum || 0 : 0
      },
      recentOrders: recentOrders.map(o => ({
        ...o,
        items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRODUCTS MANAGEMENT ---
router.post('/products', verifyAdminAuth, async (req, res) => {
  try {
    const p = req.body;
    const stmt = db.prepare(`
      INSERT INTO products (
        category_slug, name_ru, name_en, brand, model, price_uzs, in_stock, image_url,
        description_ru, description_en, socket, form_factor, tdp, memory_type, memory_slots,
        capacity_gb, vram_gb, length_mm, height_mm, wattage, efficiency_rating,
        benchmark_score, specs_json
      ) VALUES (
        @category_slug, @name_ru, @name_en, @brand, @model, @price_uzs, @in_stock, @image_url,
        @description_ru, @description_en, @socket, @form_factor, @tdp, @memory_type, @memory_slots,
        @capacity_gb, @vram_gb, @length_mm, @height_mm, @wattage, @efficiency_rating,
        @benchmark_score, @specs_json
      )
    `);

    const result = await stmt.run({
      category_slug: p.category_slug || 'cpu',
      name_ru: p.name_ru,
      name_en: p.name_en || p.name_ru,
      brand: p.brand || '',
      model: p.model || '',
      price_uzs: Number(p.price_uzs) || 0,
      in_stock: Number(p.in_stock) || 1,
      image_url: p.image_url || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80',
      description_ru: p.description_ru || '',
      description_en: p.description_en || '',
      socket: p.socket || null,
      form_factor: p.form_factor || null,
      tdp: Number(p.tdp) || 0,
      memory_type: p.memory_type || null,
      memory_slots: p.memory_slots ? Number(p.memory_slots) : null,
      capacity_gb: p.capacity_gb ? Number(p.capacity_gb) : null,
      vram_gb: p.vram_gb ? Number(p.vram_gb) : null,
      length_mm: p.length_mm ? Number(p.length_mm) : null,
      height_mm: p.height_mm ? Number(p.height_mm) : null,
      wattage: p.wattage ? Number(p.wattage) : null,
      efficiency_rating: p.efficiency_rating || null,
      benchmark_score: Number(p.benchmark_score) || 0,
      specs_json: typeof p.specs === 'object' ? JSON.stringify(p.specs) : (p.specs_json || '{}')
    });

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/products/:id', verifyAdminAuth, async (req, res) => {
  try {
    const p = req.body;
    const stmt = db.prepare(`
      UPDATE products SET
        category_slug = @category_slug, name_ru = @name_ru, name_en = @name_en, brand = @brand,
        model = @model, price_uzs = @price_uzs, in_stock = @in_stock, image_url = @image_url,
        description_ru = @description_ru, description_en = @description_en, socket = @socket,
        form_factor = @form_factor, tdp = @tdp, memory_type = @memory_type, memory_slots = @memory_slots,
        capacity_gb = @capacity_gb, vram_gb = @vram_gb, length_mm = @length_mm, height_mm = @height_mm,
        wattage = @wattage, efficiency_rating = @efficiency_rating, benchmark_score = @benchmark_score,
        specs_json = @specs_json
      WHERE id = @id
    `);

    await stmt.run({
      id: req.params.id,
      category_slug: p.category_slug,
      name_ru: p.name_ru,
      name_en: p.name_en || p.name_ru,
      brand: p.brand || '',
      model: p.model || '',
      price_uzs: Number(p.price_uzs),
      in_stock: Number(p.in_stock),
      image_url: p.image_url,
      description_ru: p.description_ru,
      description_en: p.description_en,
      socket: p.socket || null,
      form_factor: p.form_factor || null,
      tdp: Number(p.tdp) || 0,
      memory_type: p.memory_type || null,
      memory_slots: p.memory_slots ? Number(p.memory_slots) : null,
      capacity_gb: p.capacity_gb ? Number(p.capacity_gb) : null,
      vram_gb: p.vram_gb ? Number(p.vram_gb) : null,
      length_mm: p.length_mm ? Number(p.length_mm) : null,
      height_mm: p.height_mm ? Number(p.height_mm) : null,
      wattage: p.wattage ? Number(p.wattage) : null,
      efficiency_rating: p.efficiency_rating || null,
      benchmark_score: Number(p.benchmark_score) || 0,
      specs_json: typeof p.specs === 'object' ? JSON.stringify(p.specs) : (p.specs_json || '{}')
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/products/:id', verifyAdminAuth, async (req, res) => {
  try {
    await db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GAMES MANAGEMENT ---
router.post('/games', verifyAdminAuth, async (req, res) => {
  try {
    const g = req.body;
    const slug = g.slug || g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const stmt = db.prepare(`
      INSERT INTO games (
        title, slug, cover_image, genre, release_year, description_ru, description_en,
        base_gpu_requirement, base_cpu_requirement, preset_multipliers, res_multipliers,
        min_vram_gb, rec_vram_gb, min_ram_gb
      ) VALUES (
        @title, @slug, @cover_image, @genre, @release_year, @description_ru, @description_en,
        @base_gpu_requirement, @base_cpu_requirement, @preset_multipliers, @res_multipliers,
        @min_vram_gb, @rec_vram_gb, @min_ram_gb
      )
    `);

    const result = await stmt.run({
      title: g.title,
      slug,
      cover_image: g.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      genre: g.genre || 'Action',
      release_year: Number(g.release_year) || 2024,
      description_ru: g.description_ru || '',
      description_en: g.description_en || '',
      base_gpu_requirement: Number(g.base_gpu_requirement) || 20000,
      base_cpu_requirement: Number(g.base_cpu_requirement) || 22000,
      preset_multipliers: typeof g.preset_multipliers === 'object' ? JSON.stringify(g.preset_multipliers) : g.preset_multipliers || '{"low":1.8,"med":1.35,"high":1.0,"ultra":0.68}',
      res_multipliers: typeof g.res_multipliers === 'object' ? JSON.stringify(g.res_multipliers) : g.res_multipliers || '{"1080p":1.0,"1440p":0.72,"4k":0.44}',
      min_vram_gb: Number(g.min_vram_gb) || 8,
      rec_vram_gb: Number(g.rec_vram_gb) || 12,
      min_ram_gb: Number(g.min_ram_gb) || 16
    });

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/games/:id', verifyAdminAuth, async (req, res) => {
  try {
    const g = req.body;
    const stmt = db.prepare(`
      UPDATE games SET
        title = @title, cover_image = @cover_image, genre = @genre, release_year = @release_year,
        description_ru = @description_ru, description_en = @description_en,
        base_gpu_requirement = @base_gpu_requirement, base_cpu_requirement = @base_cpu_requirement,
        preset_multipliers = @preset_multipliers, res_multipliers = @res_multipliers,
        min_vram_gb = @min_vram_gb, rec_vram_gb = @rec_vram_gb, min_ram_gb = @min_ram_gb
      WHERE id = @id
    `);

    await stmt.run({
      id: req.params.id,
      title: g.title,
      cover_image: g.cover_image,
      genre: g.genre,
      release_year: Number(g.release_year),
      description_ru: g.description_ru,
      description_en: g.description_en,
      base_gpu_requirement: Number(g.base_gpu_requirement),
      base_cpu_requirement: Number(g.base_cpu_requirement),
      preset_multipliers: typeof g.preset_multipliers === 'object' ? JSON.stringify(g.preset_multipliers) : g.preset_multipliers,
      res_multipliers: typeof g.res_multipliers === 'object' ? JSON.stringify(g.res_multipliers) : g.res_multipliers,
      min_vram_gb: Number(g.min_vram_gb),
      rec_vram_gb: Number(g.rec_vram_gb),
      min_ram_gb: Number(g.min_ram_gb)
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/games/:id', verifyAdminAuth, async (req, res) => {
  try {
    await db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDERS MANAGEMENT ---
router.get('/orders', verifyAdminAuth, async (req, res) => {
  try {
    const orders = await db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const formatted = orders.map(o => ({
      ...o,
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/orders/:id/status', verifyAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SETTINGS MANAGEMENT (Telegram & Secrets) ---
router.get('/settings', verifyAdminAuth, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });

    // Populate from .env if available
    if (process.env.TELEGRAM_BOT_TOKEN || process.env.TG_BOT_TOKEN) {
      settings.tg_bot_token = process.env.TELEGRAM_BOT_TOKEN || process.env.TG_BOT_TOKEN;
    }
    if (process.env.TELEGRAM_MANAGER_CHAT_ID || process.env.MANAGER_CHAT_ID || process.env.TG_OWNER_CHAT_ID) {
      settings.tg_owner_chat_id = process.env.TELEGRAM_MANAGER_CHAT_ID || process.env.MANAGER_CHAT_ID || process.env.TG_OWNER_CHAT_ID;
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', verifyAdminAuth, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      setSetting(key, String(value));
    }
    // Re-initialize bot if token changed
    if (updates.tg_bot_token !== undefined) {
      initTelegramBot();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Telegram Bot Message
router.post('/telegram/test', verifyAdminAuth, async (req, res) => {
  try {
    const { chatId } = req.body;
    const targetChatId = chatId || getSetting('tg_owner_chat_id');
    if (!targetChatId) {
      return res.status(400).json({ error: 'Укажите Chat ID получателя' });
    }
    await sendTestMessage(targetChatId);
    res.json({ success: true, message: 'Тестовое сообщение отправлено в Telegram!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

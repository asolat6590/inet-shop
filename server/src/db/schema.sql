-- SQLite Database Schema for PC Hardware Store

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_slug TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price_uzs INTEGER NOT NULL,
  in_stock INTEGER DEFAULT 1,
  image_url TEXT NOT NULL,
  description_ru TEXT,
  description_en TEXT,
  -- Technical specs for compatibility & visualizer
  socket TEXT,                  -- LGA1700, AM5, AM4
  form_factor TEXT,             -- ATX, Micro-ATX, Mini-ITX
  tdp INTEGER DEFAULT 0,        -- Watts
  memory_type TEXT,             -- DDR4, DDR5
  memory_slots INTEGER,         -- 2, 4
  capacity_gb INTEGER,          -- RAM or Storage size in GB
  vram_gb INTEGER,              -- GPU VRAM
  length_mm INTEGER,            -- GPU or Case length limit
  height_mm INTEGER,            -- Cooler height or Case limit
  wattage INTEGER,              -- PSU Wattage
  efficiency_rating TEXT,       -- 80+ Bronze, Gold, Platinum
  -- Benchmark points for FPS computation
  benchmark_score INTEGER DEFAULT 0,
  specs_json TEXT,              -- Detailed JSON specs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT NOT NULL,
  genre TEXT,
  release_year INTEGER,
  description_ru TEXT,
  description_en TEXT,
  base_gpu_requirement INTEGER DEFAULT 10000,
  base_cpu_requirement INTEGER DEFAULT 15000,
  preset_multipliers TEXT,     -- JSON: {"low": 1.7, "med": 1.3, "high": 1.0, "ultra": 0.72}
  res_multipliers TEXT,        -- JSON: {"1080p": 1.0, "1440p": 0.72, "4k": 0.44}
  min_vram_gb INTEGER DEFAULT 6,
  rec_vram_gb INTEGER DEFAULT 8,
  min_ram_gb INTEGER DEFAULT 16,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_tg TEXT,
  shipping_address TEXT,
  items_json TEXT NOT NULL,
  total_uzs INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'telegram_payme',
  receipt_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, cancelled
  tg_notified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

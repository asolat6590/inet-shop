import Database from 'better-sqlite3';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const sqlitePath = path.join(__dirname, '..', '..', 'inet_shop.sqlite');
const sqlite = new Database(sqlitePath);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    console.log('Creating tables in Neon PostgreSQL...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name_ru VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        icon VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_slug VARCHAR(255) NOT NULL,
        name_ru VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        price_uzs BIGINT NOT NULL,
        in_stock INTEGER DEFAULT 1,
        image_url TEXT NOT NULL,
        description_ru TEXT,
        description_en TEXT,
        socket VARCHAR(100),
        form_factor VARCHAR(100),
        tdp INTEGER DEFAULT 0,
        memory_type VARCHAR(50),
        memory_slots INTEGER,
        capacity_gb INTEGER,
        vram_gb INTEGER,
        length_mm INTEGER,
        height_mm INTEGER,
        wattage INTEGER,
        efficiency_rating VARCHAR(50),
        benchmark_score INTEGER DEFAULT 0,
        specs_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        cover_image TEXT NOT NULL,
        genre VARCHAR(100),
        release_year INTEGER,
        description_ru TEXT,
        description_en TEXT,
        base_gpu_requirement INTEGER DEFAULT 10000,
        base_cpu_requirement INTEGER DEFAULT 15000,
        preset_multipliers TEXT,
        res_multipliers TEXT,
        min_vram_gb INTEGER DEFAULT 6,
        rec_vram_gb INTEGER DEFAULT 8,
        min_ram_gb INTEGER DEFAULT 16,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(100) NOT NULL,
        customer_tg VARCHAR(100),
        shipping_address TEXT,
        items_json TEXT NOT NULL,
        total_uzs BIGINT NOT NULL,
        payment_method VARCHAR(100) DEFAULT 'telegram_payme',
        receipt_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        tg_notified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT
      );
    `);

    // Migrate categories
    const categories = sqlite.prepare('SELECT * FROM categories').all();
    console.log(`Migrating ${categories.length} categories...`);
    for (const c of categories) {
      await client.query(`
        INSERT INTO categories (id, slug, name_ru, name_en, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (slug) DO UPDATE SET
          name_ru = EXCLUDED.name_ru,
          name_en = EXCLUDED.name_en,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order;
      `, [c.id, c.slug, c.name_ru, c.name_en, c.icon, c.sort_order]);
    }
    await client.query("SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));");

    // Migrate products
    const products = sqlite.prepare('SELECT * FROM products').all();
    console.log(`Migrating ${products.length} products...`);
    for (const p of products) {
      await client.query(`
        INSERT INTO products (
          id, category_slug, name_ru, name_en, brand, model, price_uzs, in_stock, image_url,
          description_ru, description_en, socket, form_factor, tdp, memory_type, memory_slots,
          capacity_gb, vram_gb, length_mm, height_mm, wattage, efficiency_rating, benchmark_score, specs_json
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24
        ) ON CONFLICT (id) DO UPDATE SET
          name_ru = EXCLUDED.name_ru,
          name_en = EXCLUDED.name_en,
          price_uzs = EXCLUDED.price_uzs,
          image_url = EXCLUDED.image_url;
      `, [
        p.id, p.category_slug, p.name_ru, p.name_en, p.brand, p.model, p.price_uzs, p.in_stock, p.image_url,
        p.description_ru, p.description_en, p.socket, p.form_factor, p.tdp, p.memory_type, p.memory_slots,
        p.capacity_gb, p.vram_gb, p.length_mm, p.height_mm, p.wattage, p.efficiency_rating, p.benchmark_score, p.specs_json
      ]);
    }
    await client.query("SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));");

    // Migrate games
    const games = sqlite.prepare('SELECT * FROM games').all();
    console.log(`Migrating ${games.length} games...`);
    for (const g of games) {
      await client.query(`
        INSERT INTO games (
          id, title, slug, cover_image, genre, release_year, description_ru, description_en,
          base_gpu_requirement, base_cpu_requirement, preset_multipliers, res_multipliers,
          min_vram_gb, rec_vram_gb, min_ram_gb
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12,
          $13, $14, $15
        ) ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          cover_image = EXCLUDED.cover_image,
          base_gpu_requirement = EXCLUDED.base_gpu_requirement,
          base_cpu_requirement = EXCLUDED.base_cpu_requirement;
      `, [
        g.id, g.title, g.slug, g.cover_image, g.genre, g.release_year, g.description_ru, g.description_en,
        g.base_gpu_requirement, g.base_cpu_requirement, g.preset_multipliers, g.res_multipliers,
        g.min_vram_gb, g.rec_vram_gb, g.min_ram_gb
      ]);
    }
    await client.query("SELECT setval('games_id_seq', (SELECT COALESCE(MAX(id), 1) FROM games));");

    // Migrate settings
    const settings = sqlite.prepare('SELECT * FROM settings').all();
    console.log(`Migrating ${settings.length} settings...`);
    for (const s of settings) {
      await client.query(`
        INSERT INTO settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `, [s.key, s.value]);
    }

    // Migrate orders
    const orders = sqlite.prepare('SELECT * FROM orders').all();
    console.log(`Migrating ${orders.length} orders...`);
    for (const o of orders) {
      await client.query(`
        INSERT INTO orders (
          id, order_number, customer_name, customer_phone, customer_tg,
          shipping_address, items_json, total_uzs, payment_method, receipt_url,
          status, tg_notified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (order_number) DO NOTHING;
      `, [
        o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_tg,
        o.shipping_address, o.items_json, o.total_uzs, o.payment_method, o.receipt_url,
        o.status, o.tg_notified
      ]);
    }
    await client.query("SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));");

    console.log('✅ Migration to Neon PostgreSQL completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});

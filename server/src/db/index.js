import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[Neon PostgreSQL] Unexpected pool error:', err.message);
});

// Cache for settings to provide synchronous getSetting()
const settingsCache = new Map();

export async function loadSettingsCache() {
  try {
    const res = await pool.query('SELECT key, value FROM settings');
    res.rows.forEach(r => settingsCache.set(r.key, r.value));
    console.log(`[Neon PostgreSQL] Settings cache loaded (${settingsCache.size} entries)`);
  } catch (err) {
    console.warn('[Neon PostgreSQL] Could not load settings cache yet:', err.message);
  }
}

export function getCachedSetting(key, defaultValue = '') {
  if (settingsCache.has(key)) {
    return settingsCache.get(key);
  }
  return defaultValue;
}

export async function setCachedSetting(key, value) {
  settingsCache.set(key, value);
  try {
    await pool.query(`
      INSERT INTO settings (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [key, value]);
  } catch (err) {
    console.error('[Neon PostgreSQL] Error saving setting:', err.message);
  }
}

function prepareQuery(sql, params) {
  let values = [];
  let pgSql = sql;

  // Handle @named params object
  if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
    const obj = params[0];
    let count = 0;
    pgSql = sql.replace(/@([a-zA-Z0-9_]+)/g, (match, key) => {
      count++;
      values.push(obj[key] !== undefined ? obj[key] : null);
      return '$' + count;
    });
  } else {
    values = params.flat();
    let count = 0;
    pgSql = sql.replace(/\?/g, () => '$' + (++count));
  }

  // Adapt INSERT OR REPLACE for settings
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+settings/i.test(pgSql)) {
    pgSql = `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  }

  // If INSERT products/games/orders and doesn't have RETURNING, add RETURNING id
  if (/^\s*INSERT\s+INTO\s+(products|games|orders)\b/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  return { pgSql, values };
}

export const db = {
  pool,
  query: (text, params) => pool.query(text, params),
  prepare(sql) {
    return {
      async all(...params) {
        const { pgSql, values } = prepareQuery(sql, params);
        const res = await pool.query(pgSql, values);
        return res.rows.map(row => {
          if (row.price_uzs !== undefined) row.price_uzs = Number(row.price_uzs);
          if (row.total_uzs !== undefined) row.total_uzs = Number(row.total_uzs);
          if (row.count !== undefined) row.count = Number(row.count);
          if (row.sum !== undefined) row.sum = Number(row.sum);
          return row;
        });
      },
      async get(...params) {
        const { pgSql, values } = prepareQuery(sql, params);
        const res = await pool.query(pgSql, values);
        if (!res.rows || res.rows.length === 0) return null;
        const row = res.rows[0];
        if (row.price_uzs !== undefined) row.price_uzs = Number(row.price_uzs);
        if (row.total_uzs !== undefined) row.total_uzs = Number(row.total_uzs);
        if (row.count !== undefined) row.count = Number(row.count);
        if (row.sum !== undefined) row.sum = Number(row.sum);
        return row;
      },
      async run(...params) {
        const { pgSql, values } = prepareQuery(sql, params);
        const res = await pool.query(pgSql, values);
        return {
          changes: res.rowCount,
          rowCount: res.rowCount,
          lastInsertRowid: res.rows?.[0]?.id || null,
        };
      }
    };
  }
};

loadSettingsCache();

export default db;

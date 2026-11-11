import express from 'express';
import db from '../db/index.js';

const router = express.Router();

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET products with optional filters
router.get('/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, socket, memory_type, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category_slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name_ru ILIKE ? OR name_en ILIKE ? OR brand ILIKE ? OR model ILIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (minPrice) {
      query += ' AND price_uzs >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND price_uzs <= ?';
      params.push(Number(maxPrice));
    }

    if (socket) {
      query += ' AND socket = ?';
      params.push(socket);
    }

    if (memory_type) {
      query += ' AND memory_type = ?';
      params.push(memory_type);
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY price_uzs ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY price_uzs DESC';
    } else if (sort === 'perf_desc') {
      query += ' ORDER BY benchmark_score DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const products = await db.prepare(query).all(...params);

    // Parse specs_json for convenience
    const formatted = products.map(p => ({
      ...p,
      specs: p.specs_json ? (typeof p.specs_json === 'string' ? JSON.parse(p.specs_json) : p.specs_json) : {}
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET product by id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.specs = product.specs_json ? (typeof product.specs_json === 'string' ? JSON.parse(product.specs_json) : product.specs_json) : {};
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

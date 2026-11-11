import express from 'express';
import { checkCompatibility } from '../services/compatibility.js';

const router = express.Router();

router.post('/compatibility/check', (req, res) => {
  try {
    const { parts = {} } = req.body;
    const result = checkCompatibility(parts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

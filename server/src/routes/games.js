import express from 'express';
import db from '../db/index.js';
import { calculateFpsForGame, calculateBottleneck } from '../services/fpsCalculator.js';

const router = express.Router();

// GET all games for FPS calculator
router.get('/games', async (req, res) => {
  try {
    const games = await db.prepare('SELECT * FROM games ORDER BY base_gpu_requirement DESC').all();
    const formatted = games.map(g => ({
      ...g,
      preset_multipliers: typeof g.preset_multipliers === 'string' ? JSON.parse(g.preset_multipliers) : g.preset_multipliers,
      res_multipliers: typeof g.res_multipliers === 'string' ? JSON.parse(g.res_multipliers) : g.res_multipliers
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST calculate FPS across games based on current PC configuration
router.post('/games/calculate-fps', async (req, res) => {
  try {
    const { config = {}, resolution = '1080p', preset = 'high', gameId } = req.body;

    let gamesQuery = 'SELECT * FROM games';
    const params = [];

    if (gameId) {
      gamesQuery += ' WHERE id = ?';
      params.push(gameId);
    } else {
      gamesQuery += ' ORDER BY base_gpu_requirement DESC';
    }

    const games = await db.prepare(gamesQuery).all(...params);

    const results = games.map(game => calculateFpsForGame(game, config, resolution, preset));

    const bottleneck = calculateBottleneck(config.cpu, config.gpu);

    res.json({
      resolution,
      preset,
      bottleneck,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

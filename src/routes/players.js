import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Link a player (attach game account to user) - extended: country and game_account_created_at
router.post('/link', optionalAuth, async (req, res, next) => {
  try {
    const { player_id_game, server_region, display_name, user_id, country, game_account_created_at } = req.body;
    const uid = req.user?.id || user_id;
    if (!uid) return res.status(400).json({ error: 'user_id required or be authenticated' });
    const db = await getDb();
    const existing = await db.get('SELECT * FROM players WHERE player_id_game = ? AND server_region = ?', [player_id_game, server_region]);
    if (existing) return res.status(400).json({ error: 'Player already linked' });
    const id = uuidv4();
    const linked_on = new Date().toISOString();
    await db.run('INSERT INTO players (id, user_id, player_id_game, server_region, country, display_name, linked_on, game_account_created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      uid,
      player_id_game,
      server_region,
      country || null,
      display_name,
      linked_on,
      game_account_created_at || null,
    ]);
    res.json({ id, player_id_game, server_region, display_name, country, linked_on, game_account_created_at });
  } catch (err) {
    next(err);
  }
});

// Get player by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const db = await getDb();
    const p = await db.get('SELECT * FROM players WHERE id = ?', [id]);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

export default router;

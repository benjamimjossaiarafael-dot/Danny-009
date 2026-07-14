import express from 'express';
import { verifyAdminToken } from '../middleware/auth.js';
import { getPrizesForPlayer } from '../services/prizeService.js';

const router = express.Router();

router.get('/player/:playerId', async (req, res, next) => {
  try {
    const playerId = req.params.playerId;
    const prizes = await getPrizesForPlayer(playerId);
    res.json(prizes);
  } catch (err) {
    next(err);
  }
});

export default router;

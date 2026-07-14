import express from 'express';
import { verifyAdminToken } from '../middleware/auth.js';
import { getDb } from '../database.js';

const router = express.Router();

router.get('/stats', verifyAdminToken, async (req, res, next) => {
  try {
    const db = await getDb();
    const totalLikesToday = await db.get("SELECT COUNT(*) as c FROM likes WHERE date(created_at) = date('now')");
    const pending = await db.get("SELECT COUNT(*) as c FROM likes WHERE status = 'queued'");
    const sent = await db.get("SELECT COUNT(*) as c FROM likes WHERE status = 'sent'");
    const users = await db.get('SELECT COUNT(*) as c FROM users');
    const tournaments = await db.get("SELECT COUNT(*) as c FROM tournaments WHERE status = 'active'");
    res.json({ totalLikesToday: totalLikesToday.c, pending: pending.c, sent: sent.c, users: users.c, activeTournaments: tournaments.c });
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { generateSecret, verifyToken as verifyTotp } from '../services/2faService.js';
import { getDb } from '../database.js';

const router = express.Router();

// Generate TOTP secret and return to user (store in DB by caller)
router.post('/setup', verifyToken, async (req, res, next) => {
  try {
    const secret = generateSecret();
    // store secret temporarily in users table (simple approach)
    const db = await getDb();
    await db.run('UPDATE users SET twofa_secret = ? WHERE id = ?', [secret.base32, req.user.id]);
    res.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
  } catch (err) {
    next(err);
  }
});

// Verify token
router.post('/verify', verifyToken, async (req, res, next) => {
  try {
    const { token } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT twofa_secret FROM users WHERE id = ?', [req.user.id]);
    if (!user || !user.twofa_secret) return res.status(400).json({ error: '2FA not setup' });
    const ok = verifyTotp({ base32: user.twofa_secret }, token);
    res.json({ ok });
  } catch (err) {
    next(err);
  }
});

export default router;

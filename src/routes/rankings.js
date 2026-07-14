import express from 'express';
import { verifyAdminToken } from '../middleware/auth.js';
import { topPlayersByCountry, awardPrizesTopByCountry } from '../services/prizeService.js';

const router = express.Router();

// Get top 10 players for a country (country param is ISO code or name)
router.get('/country/:countryCode', async (req, res, next) => {
  try {
    const country = req.params.countryCode;
    const limit = parseInt(req.query.limit || '10', 10);
    const top = await topPlayersByCountry(country, limit);
    res.json(top);
  } catch (err) {
    next(err);
  }
});

// Global top across Africa
router.get('/africa/top', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const top = await topPlayersByCountry(null, limit);
    res.json(top);
  } catch (err) {
    next(err);
  }
});

// Admin: award prizes to top N in a country
router.post('/country/:countryCode/award', verifyAdminToken, async (req, res, next) => {
  try {
    const country = req.params.countryCode;
    const limit = parseInt(req.body.limit || '3', 10);
    const awarded = await awardPrizesTopByCountry(country, limit, (pos, player) => {
      if (pos === 1) return 'Gold Prize';
      if (pos === 2) return 'Silver Prize';
      return 'Bronze Prize';
    });
    res.json({ awarded });
  } catch (err) {
    next(err);
  }
});

export default router;

import { getDb } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

// Return top N players for a country or globally within Africa
export async function topPlayersByCountry(countryCode, limit = 10) {
  const db = await getDb();
  let rows;
  if (countryCode) {
    rows = await db.all('SELECT id, player_id_game, display_name, country, likes_received_count, game_account_created_at FROM players WHERE country = ? AND server_region = ? ORDER BY likes_received_count DESC LIMIT ?', [countryCode, 'africa', limit]);
  } else {
    // top across Africa
    rows = await db.all('SELECT id, player_id_game, display_name, country, likes_received_count, game_account_created_at FROM players WHERE server_region = ? ORDER BY likes_received_count DESC LIMIT ?', ['africa', limit]);
  }
  return rows;
}

export async function awardPrizesTopByCountry(countryCode, limit = 3, prizeBuilder = (pos, player) => `Prize for position ${pos}`) {
  const db = await getDb();
  const top = await topPlayersByCountry(countryCode, limit);
  const awarded = [];
  for (let i = 0; i < top.length; i++) {
    const p = top[i];
    const id = uuidv4();
    const prize = prizeBuilder(i + 1, p);
    const awarded_at = new Date().toISOString();
    await db.run('INSERT INTO prizes (id, player_id, prize, reason, awarded_at) VALUES (?, ?, ?, ?, ?)', [id, p.id, prize, `Top ${i + 1} in ${countryCode}`, awarded_at]);
    awarded.push({ player: p, prize, awarded_at });
  }
  return awarded;
}

export async function getPrizesForPlayer(playerId) {
  const db = await getDb();
  return db.all('SELECT * FROM prizes WHERE player_id = ? ORDER BY awarded_at DESC', [playerId]);
}

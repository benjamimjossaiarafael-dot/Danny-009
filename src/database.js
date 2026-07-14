import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.DATABASE_FILE || `${__dirname}/../data/database.sqlite`;

let db;

export async function getDb() {
  if (db) return db;
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });
  await migrate(db);
  return db;
}

async function migrate(db) {
  // Users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT,
      twofa_secret TEXT
    );
  `);

  // Players (game accounts linked)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      player_id_game TEXT,
      server_region TEXT,
      country TEXT,
      display_name TEXT,
      linked_on TEXT,
      game_account_created_at TEXT,
      likes_received_count INTEGER DEFAULT 0,
      likes_sent_count INTEGER DEFAULT 0
    );
  `);

  // Likes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      from_player_id TEXT,
      to_player_game_id TEXT,
      server_region TEXT,
      status TEXT,
      created_at TEXT,
      sent_at TEXT,
      remote_response TEXT
    );
  `);

  // Tournaments
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT,
      server_region TEXT,
      start_date TEXT,
      end_date TEXT,
      max_players INTEGER,
      rules TEXT,
      status TEXT,
      created_at TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_participants (
      id TEXT PRIMARY KEY,
      tournament_id TEXT,
      player_id TEXT,
      joined_at TEXT,
      eliminated_at TEXT,
      rank INTEGER
    );
  `);

  // Plans
  await db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      plan_name TEXT,
      expires_at TEXT,
      created_at TEXT
    );
  `);

  // Prizes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS prizes (
      id TEXT PRIMARY KEY,
      player_id TEXT,
      prize TEXT,
      reason TEXT,
      awarded_at TEXT
    );
  `);
}

// initialize immediately so migrations run on start
getDb().catch((err) => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});

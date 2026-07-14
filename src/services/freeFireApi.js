import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.FREEFIRE_API_KEY;
const API_URL = process.env.FREEFIRE_API_URL;
const ENABLED = (process.env.FREEFIRE_ENABLED || 'false').toLowerCase() === 'true';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function requestWithRetry(method, url, data, headers = {}, retries = 3) {
  let attempt = 0;
  let lastErr = null;
  while (attempt <= retries) {
    try {
      const resp = await axios({ method, url, data, headers, timeout: 8000 });
      return { success: true, status: resp.status, data: resp.data };
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const wait = Math.pow(2, attempt) * 250; // exponential backoff
      // If client error (4xx), do not retry
      const status = err.response?.status;
      if (status && status >= 400 && status < 500) {
        return { success: false, status, error: err.message, data: err.response?.data };
      }
      if (attempt > retries) break;
      await sleep(wait + Math.floor(Math.random() * 100));
    }
  }
  return { success: false, error: lastErr?.message || 'unknown', status: lastErr?.response?.status, data: lastErr?.response?.data };
}

export async function sendLike(toPlayerGameId, serverRegion) {
  if (!ENABLED) {
    // simulation mode
    await sleep(200);
    return { success: true, simulated: true, message: 'Simulated send (FREEFIRE_ENABLED not true)' };
  }
  if (!API_KEY || !API_URL) {
    return { success: false, error: 'FREEFIRE_API_KEY or FREEFIRE_API_URL not configured', simulated: false };
  }
  const endpoint = `${API_URL.replace(/\/$/, '')}/likes/send`;
  const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
  const payload = { to: toPlayerGameId, region: serverRegion };
  const res = await requestWithRetry('post', endpoint, payload, headers, 3);
  return res;
}

export async function sendPass(toPlayerGameId, serverRegion, passType = 'basic') {
  if (!ENABLED) {
    await sleep(200);
    return { success: true, simulated: true, message: 'Simulated sendPass (FREEFIRE_ENABLED not true)' };
  }
  if (!API_KEY || !API_URL) {
    return { success: false, error: 'FREEFIRE_API_KEY or FREEFIRE_API_URL not configured' };
  }
  const endpoint = `${API_URL.replace(/\/$/, '')}/passes/send`;
  const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
  const payload = { to: toPlayerGameId, region: serverRegion, passType };
  const res = await requestWithRetry('post', endpoint, payload, headers, 3);
  return res;
}

export async function getPlayerInfo(playerId, serverRegion) {
  if (!ENABLED) {
    return { success: true, simulated: true, data: { playerId, serverRegion, created_at: null } };
  }
  if (!API_KEY || !API_URL) {
    return { success: false, error: 'FREEFIRE_API_KEY or FREEFIRE_API_URL not configured' };
  }
  const endpoint = `${API_URL.replace(/\/$/, '')}/players/${encodeURIComponent(playerId)}?region=${encodeURIComponent(serverRegion)}`;
  const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
  const res = await requestWithRetry('get', endpoint, null, headers, 2);
  return res;
}

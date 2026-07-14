import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export async function sendLike(toPlayerGameId, serverRegion) {
  const API_KEY = process.env.FREEFIRE_API_KEY;
  const API_URL = process.env.FREEFIRE_API_URL;
  if (!API_KEY || !API_URL) {
    // simulate success with some delay
    await new Promise((r) => setTimeout(r, 250));
    return { success: true, simulated: true, message: 'Simulated send (no API key configured)' };
  }
  try {
    const resp = await axios.post(`${API_URL}/likes/send`, {
      to: toPlayerGameId,
      region: serverRegion,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 5000,
    });
    return { success: true, data: resp.data };
  } catch (err) {
    return { success: false, error: err.message, status: err.response?.status, data: err.response?.data };
  }
}

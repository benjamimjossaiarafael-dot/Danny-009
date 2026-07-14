import { getDb } from '../database.js';
import cron from 'node-cron';
import * as freeFireApi from '../services/freeFireApi.js';

export function startLikeProcessor(io) {
  // run every minute for demo; in production you might run every 1-5 minutes depending on rate limits
  cron.schedule('* * * * *', async () => {
    try {
      const db = await getDb();
      const queued = await db.all("SELECT * FROM likes WHERE status = 'queued' ORDER BY created_at LIMIT 50");
      for (const like of queued) {
        try {
          // attempt remote send
          const res = await freeFireApi.sendLike(like.to_player_game_id, like.server_region);
          const sent_at = new Date().toISOString();
          const status = res.success ? 'sent' : 'failed';
          await db.run('UPDATE likes SET status = ?, sent_at = ?, remote_response = ? WHERE id = ?', [
            status,
            sent_at,
            JSON.stringify(res),
            like.id,
          ]);

          if (res.success) {
            // increment recipient counter if linked
            const recipient = await db.get('SELECT * FROM players WHERE player_id_game = ? AND server_region = ?', [like.to_player_game_id, like.server_region]);
            if (recipient) {
              await db.run('UPDATE players SET likes_received_count = COALESCE(likes_received_count,0) + 1 WHERE id = ?', [recipient.id]);
            }
            io.emit('like:sent', { likeId: like.id, to: like.to_player_game_id, simulated: !!res.simulated });
          } else {
            io.emit('like:error', { likeId: like.id, error: res.error || res.data || 'unknown' });
          }
        } catch (err) {
          console.error('Processing like failed', err);
          await db.run('UPDATE likes SET status = ?, remote_response = ? WHERE id = ?', ['failed', JSON.stringify({ error: err.message }), like.id]);
          io.emit('like:error', { likeId: like.id, error: err.message });
        }
      }
    } catch (err) {
      console.error('Like processor failed', err);
    }
  });
}

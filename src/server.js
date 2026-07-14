import './database.js';
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import routesAuth from './routes/authAdvanced.js';
import routesPlayers from './routes/players.js';
import routesLikes from './routes/likesAdvanced.js';
import routesTournaments from './routes/tournaments.js';
import routesAdmin from './routes/admin.js';
import route2fa from './routes/2fa.js';
import adminStats from './routes/adminStats.js';
import rankings from './routes/rankings.js';
import prizes from './routes/prizes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initWebsocket } from './websocket.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { startLikeProcessor } from './jobs/likeProcessor.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });
initWebsocket(io);

app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.use('/api/auth', routesAuth);
app.use('/api/players', routesPlayers);
app.use('/api/likes', routesLikes);
app.use('/api/tournaments', routesTournaments);
app.use('/api/admin', routesAdmin);
app.use('/api/admin', adminStats);
app.use('/api/2fa', route2fa);
app.use('/api/rankings', rankings);
app.use('/api/prizes', prizes);

app.get('/', (req, res) => res.json({ ok: true, service: 'Free Fire Africa API' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startLikeProcessor(io);
});

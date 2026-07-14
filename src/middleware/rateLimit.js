import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export const likesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // per IP
  message: { error: 'Too many like requests from this IP, please try later' },
});

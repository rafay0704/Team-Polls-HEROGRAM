// src/middleware/rateLimit.js
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const rateLimiter = async (req, res, next) => {
  const key = `rate:${req.user.userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 1); // 1 sec window
  if (count > 5) return res.status(429).send('Rate limit exceeded');
  next();
};

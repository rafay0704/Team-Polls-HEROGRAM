// src/routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/anon', (req, res) => {
  const token = jwt.sign({ userId: `user-${Date.now()}` }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ token });
});

export default router;

// src/routes/pollRoutes.js
import express from 'express';
import {
  createPoll,
  votePoll,
  getPoll,
  getAllPolls
} from '../controllers/pollController.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/', createPoll); // F2
router.post('/:id/vote', authenticate, rateLimiter, votePoll); // F3, F6, F7
router.get('/:id', getPoll); // F4
router.get('/', getAllPolls); // GET /poll — fetch all polls


export default router;

//index.js

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { setupWebSocket } from './ws/publisher.js';
import pollRoutes from './routes/pollRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { initDB } from './db/db.js';
import { metricsMiddleware, exposeMetrics } from './middleware/metrics.js';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(metricsMiddleware);

// Define root route to avoid "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Welcome to the Team Polls API!');
});

// Routes
app.use('/auth', authRoutes);
app.use('/poll', pollRoutes);
app.get('/metrics', exposeMetrics);

// Setup WebSocket
setupWebSocket(server);

// Initialize PostgreSQL database
initDB(); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

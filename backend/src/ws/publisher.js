import WebSocket, { WebSocketServer } from 'ws';
import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const subscribers = {};
const pub = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const sub = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

// WebSocket server setup
export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  // Subscribe to Redis channels (like 'poll:123')
  sub.psubscribe('poll:*');
  sub.subscribe('poll:new');      // NEW: subscribe to new poll channel

sub.on('message', (channel, message) => {
  if (channel === 'poll:new') {
    // Broadcast to all connected clients
    Object.values(subscribers).flat().forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'newPoll', data: JSON.parse(message) }));
      }
    });
  }
});

  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pollId = url.pathname.split('/').pop();

    // Keep track of subscribers for each pollId
    if (!subscribers[pollId]) subscribers[pollId] = [];
    subscribers[pollId].push(ws);

    ws.on('close', () => {
      // Clean up when a client disconnects
      subscribers[pollId] = subscribers[pollId].filter(s => s !== ws);
    });
  });

  // When a Redis message is received, broadcast it to the connected clients
  sub.on('pmessage', (pattern, channel, message) => {
    const pollId = channel.split(':')[1];
    if (subscribers[pollId]) {
      subscribers[pollId].forEach(ws => ws.send(message));
    }
  });
};

// Publish real-time tally updates to Redis
export const publishTallyUpdate = (pollId, tally) => {
  pub.publish(`poll:${pollId}`, JSON.stringify(tally));
};

export const publishNewPoll = (pollData) => {
  pub.publish('poll:new', JSON.stringify(pollData)); // Channel for new polls
};
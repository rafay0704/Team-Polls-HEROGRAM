// src/middleware/metrics.js
import client from 'prom-client';
const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const metricsMiddleware = (req, res, next) => {
  // custom metrics can be added here
  next();
};

export const exposeMetrics = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

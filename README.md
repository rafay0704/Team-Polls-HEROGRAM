# 🗳️ Team Polls – Node.js Real-Time Voting App

A fast, scalable, and real-time polling system built for all-hands meetings and live events. Supports poll creation, voting, and real-time result updates via WebSockets.

---

## ✅ Features

- ✅ **Create Polls** with a question, multiple options, and an expiration time.
- ✅ **Vote Casting** for authenticated users, idempotent per user.
- ✅ **Real-Time Streaming** of vote tallies via WebSocket.
- ✅ **Durable Persistence** with PostgreSQL + Redis (survives restarts).
- ✅ **Scalable Architecture** capable of handling **10k+ concurrent voters**.
- ✅ **Rate-Limited Voting** (5/sec per user, burst-safe).
- ✅ **JWT-based Anonymous Auth** for secure and quick voting.
- ✅ **Poll Auto-Close** after `expiresAt`; final results stay available.

---

## 🏗️ Architecture

- **Backend**: Node.js, Express, WebSocket (`ws`)
- **DB**: PostgreSQL (via Knex migrations)
- **Auth**: Anonymous JWT (short-lived)
- **Cache/Rate-limit**: Redis (token buckets + WebSocket pub/sub)
- **Observability**: `/metrics` endpoint (Prometheus format), request logging, error tracking
- **Security**: `helmet`, OWASP headers, ENV-based secrets

---

## 🐳 Quick Start (Docker-First)

```bash
# 1. Clone the repo
git clone https://github.com/rafay0704/Team-Polls-HEROGRAM

# 2. Start everything
docker-compose up



loom link
https://www.loom.com/share/bcf4c8c3a7d14f6b81cec4ddf10f4b6a?sid=4f2eff16-9164-4327-9365-e8a4d4f01f09




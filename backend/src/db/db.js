import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS polls (
        id SERIAL PRIMARY KEY,
        question TEXT,
        options TEXT[],
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        poll_id INTEGER REFERENCES polls(id),
        user_id TEXT,
        option TEXT,
        UNIQUE(poll_id, user_id)
      );
    `);
    console.log('✅ Connected to PostgreSQL and ensured tables exist');
  } catch (error) {
    console.error('❌ Error initializing DB:', error);
  }
};

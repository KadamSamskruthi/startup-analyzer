const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      startup_name VARCHAR(200) NOT NULL,
      industry VARCHAR(100),
      budget VARCHAR(100),
      market_demand VARCHAR(50),
      competition VARCHAR(50),
      description TEXT,
      risk_score INTEGER,
      risk_level VARCHAR(20),
      verdict TEXT,
      innovation_comment TEXT,
      risks TEXT,
      predictions TEXT,
      suggestions TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('✅ Database tables initialized');
}

module.exports = { sql, initDB };

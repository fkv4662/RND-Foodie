const { pool } = require('./db');

async function initTables() {
  // Create users table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Add email column if missing
  const result = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  `);
  if (result.rows.length === 0) {
    await pool.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE`);
  }
  // Create oven_logs table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS oven_logs (
      id SERIAL PRIMARY KEY,
      device_name TEXT NOT NULL,
      food_item TEXT,
      temperature NUMERIC NOT NULL,
      status TEXT NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = { initTables };

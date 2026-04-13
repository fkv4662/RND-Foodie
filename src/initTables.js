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

  // Existing oven logs table
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

  // New Testo fridge readings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testo_readings (
      id SERIAL PRIMARY KEY,
      source VARCHAR(50) NOT NULL DEFAULT 'TESTO_CLOUD',
      external_id VARCHAR(255) UNIQUE,
      device_id VARCHAR(255) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      temperature DECIMAL NOT NULL,
      humidity DECIMAL,
      status VARCHAR(10) NOT NULL,
      recorded_at TIMESTAMP NOT NULL,
      imported_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { initTables };
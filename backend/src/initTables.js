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

  // Existing oven logs table with starting and finishing temperature
  await pool.query(`
    CREATE TABLE IF NOT EXISTS oven_logs (
      id SERIAL PRIMARY KEY,
      device_name TEXT NOT NULL,
      food_item TEXT,
      starting_temperature NUMERIC,
      finishing_temperature NUMERIC,
      status TEXT NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add starting_temperature if missing
  const resultStartTemp = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'oven_logs' AND column_name = 'starting_temperature'
  `);
  if (resultStartTemp.rows.length === 0) {
    await pool.query(`ALTER TABLE oven_logs ADD COLUMN starting_temperature NUMERIC`);
  }

  // Add finishing_temperature if missing
  const resultFinishTemp = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'oven_logs' AND column_name = 'finishing_temperature'
  `);
  if (resultFinishTemp.rows.length === 0) {
    await pool.query(`ALTER TABLE oven_logs ADD COLUMN finishing_temperature NUMERIC`);
  }

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

  // CCP tasks table - Shazia
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ccp_tasks (
      id SERIAL PRIMARY KEY,
      task_name VARCHAR(100),
      temperature DECIMAL(5,2),
      time_recorded VARCHAR(20),
      notes TEXT,
      status VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // CCP logs table - Shazia
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ccp_logs (
      id SERIAL PRIMARY KEY,
      date_recorded DATE,
      time_recorded VARCHAR(20),
      temperature DECIMAL(5,2),
      humidity DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Hot food checks table - Shazia
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hot_food_checks (
      id SERIAL PRIMARY KEY,
      food_item VARCHAR(100),
      batch_id VARCHAR(50),
      temperature DECIMAL(5,2),
      action_taken TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications table - Shazia
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = { initTables };
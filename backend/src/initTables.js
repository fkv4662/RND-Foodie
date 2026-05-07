const { pool } = require('./db');

async function initTables() {
  // Create users table if it doesn't exist
    // Create users table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      password_hash TEXT,
      role VARCHAR(50) DEFAULT 'CHEF',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(255)
  `);

  await pool.query(`
    UPDATE users
    SET username = COALESCE(NULLIF(username, ''), username, split_part(email, '@', 1), 'user-' || id)
    WHERE username IS NULL OR username = ''
  `);

  await pool.query(`
    ALTER TABLE users
    ALTER COLUMN username SET NOT NULL
  `);

  // Add email column if missing
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE
  `);

  // Add password_hash column if missing
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash TEXT
  `);

  // Add role column if missing
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'CHEF'
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'name'
      ) THEN
        ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
      END IF;
    END $$;
  `);

  // Remove old password column if it exists
  await pool.query(`
    ALTER TABLE users
    DROP COLUMN IF EXISTS password
  `);

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

// Diary incidents table - edited tommy
  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      date DATE,
      time TIME,
      reported_by VARCHAR(255),
      description TEXT,
      action_taken TEXT,
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);


  await pool.query(`
    CREATE TABLE IF NOT EXISTS business_details (
      id INTEGER PRIMARY KEY,
      form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'business_details_id_check'
      ) THEN
        ALTER TABLE business_details DROP CONSTRAINT business_details_id_check;
      END IF;
    END $$;
  `);

  await pool.query(`CREATE SEQUENCE IF NOT EXISTS business_details_id_seq`);
  await pool.query(`
    ALTER TABLE business_details
    ALTER COLUMN id SET DEFAULT nextval('business_details_id_seq')
  `);
  await pool.query(`
    SELECT setval(
      'business_details_id_seq',
      GREATEST(COALESCE((SELECT MAX(id) FROM business_details), 0), 1),
      true
    )
  `);
}

module.exports = { initTables };
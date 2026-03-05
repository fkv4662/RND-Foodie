
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(async () => {
    console.log("Connected to PostgreSQL");
    // Auto-create fridge_logs table if not exists
    const createTableSQL = `CREATE TABLE IF NOT EXISTS public.fridge_logs (
      id SERIAL PRIMARY KEY,
      device_name VARCHAR(255) NOT NULL,
      temperature DECIMAL NOT NULL,
      humidity DECIMAL NOT NULL,
      status VARCHAR(10) NOT NULL,
      recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    try {
      await pool.query(createTableSQL);
      console.log("fridge_logs table ensured.");
    } catch (err) {
      console.error("Error creating fridge_logs table:", err.message);
    }
    // Auto-create users table if not exists
    const createUsersTableSQL = `CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    try {
      await pool.query(createUsersTableSQL);
      console.log("users table ensured.");
    } catch (err) {
      console.error("Error creating users table:", err.message);
    }
  })
  .catch(err => console.error("Database connection error:", err));

module.exports = { pool };
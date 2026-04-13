const bcrypt = require("bcrypt");
const { pool } = require("./db");

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";
    const role = process.env.ADMIN_ROLE || "ADMIN";

    if (!email || !password) {
      console.log("Admin seed skipped: missing ADMIN_EMAIL or ADMIN_PASSWORD");
      return;
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rowCount > 0) {
      console.log("Admin already exists");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, true)`,
      [name, email, passwordHash, role]
    );

    console.log("Admin user created");
  } catch (error) {
    console.error("Admin seed error:", error.message);
  }
}

module.exports = { seedAdmin };
const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// ✅ CREATE (POST)
router.post("/", async (req, res) => {
  try {
    const { temps } = req.body;

    for (let item of temps) {
      await pool.query(
        "INSERT INTO delivery_logs (name, temperature, time) VALUES ($1, $2, $3)",
        [item.name, item.value, item.time]
      );
    }

    res.json({ message: "Delivery data saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET (VIEW DATA)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM delivery_logs ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
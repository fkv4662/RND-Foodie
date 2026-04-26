const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// CREATE
router.post("/", async (req, res) => {
  const { date, time, reported_by, description, action_taken, status } = req.body;

  try {
    await pool.query(
      `INSERT INTO incidents (date, time, reported_by, description, action_taken, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [date, time, reported_by, description, action_taken, status]
    );

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM incidents ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
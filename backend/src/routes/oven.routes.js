const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all oven logs
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM oven_logs ORDER BY recorded_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get oven alerts
router.get('/alerts', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM oven_logs WHERE status = 'ALERT' ORDER BY recorded_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new oven log
router.post('/log', async (req, res) => {
  const { device_name, food_item, temperature } = req.body;
  const status = Number(temperature) < 75 ? 'ALERT' : 'SAFE';
  try {
    const result = await pool.query(
      'INSERT INTO oven_logs (device_name, food_item, temperature, status, recorded_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [device_name, food_item, temperature, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a log by id
router.delete('/log/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM oven_logs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all logs
router.delete('/logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM oven_logs');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

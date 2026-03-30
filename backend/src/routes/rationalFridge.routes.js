
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /api/fridge/log
router.post('/log', async (req, res) => {
  try {
    const { device_name, temperature, humidity } = req.body;
    if (!device_name || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const status = temperature > 5 ? 'ALERT' : 'SAFE';
    const sql = `INSERT INTO fridge_logs (device_name, temperature, humidity, status, recorded_at) VALUES ($1, $2, $3, $4, NOW())`;
    await pool.query(sql, [device_name, temperature, humidity, status]);
    res.json({ message: 'Log recorded', status });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/fridge/logs
router.get('/logs', async (req, res) => {
  try {
    const sql = `SELECT device_name, temperature, humidity, status, to_char(recorded_at, 'YYYY-MM-DD HH24:MI') as recorded_at FROM fridge_logs ORDER BY recorded_at DESC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/fridge/alerts
router.get('/alerts', async (req, res) => {
  try {
    const sql = `SELECT device_name, temperature, humidity, status, to_char(recorded_at, 'YYYY-MM-DD HH24:MI') as recorded_at FROM fridge_logs WHERE status = 'ALERT' ORDER BY recorded_at DESC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;

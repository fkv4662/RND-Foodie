
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const ovenController = require('../controllers/ovenController');


// POST /api/rational-oven/log
router.post('/log', ovenController.logOvenTemperature);

// GET /api/fridge/logs

router.get('/logs', async (req, res) => {
  try {
    const sql = `SELECT device_name, food_item, starting_temperature, finishing_temperature, status, to_char(recorded_at, 'YYYY-MM-DD HH24:MI') as recorded_at FROM oven_logs ORDER BY recorded_at DESC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/fridge/alerts

router.get('/alerts', async (req, res) => {
  try {
    const sql = `SELECT device_name, food_item, starting_temperature, finishing_temperature, status, to_char(recorded_at, 'YYYY-MM-DD HH24:MI') as recorded_at FROM oven_logs WHERE status = 'ALERT' ORDER BY recorded_at DESC`;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;

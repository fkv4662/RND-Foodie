const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all CCP tasks
router.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ccp_tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a CCP task
router.post('/tasks', async (req, res) => {
  const { task_name, temperature, time_recorded, notes, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ccp_tasks (task_name, temperature, time_recorded, notes, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [task_name, temperature, time_recorded, notes, status]
    );
    res.json({ message: 'Task saved!', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all CCP logs
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ccp_logs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save hot food check
router.post('/hotfood', async (req, res) => {
  const { food_item, batch_id, temperature, action_taken, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO hot_food_checks (food_item, batch_id, temperature, action_taken, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [food_item, batch_id, temperature, action_taken, notes]
    );
    res.json({ message: 'Hot food check saved!', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
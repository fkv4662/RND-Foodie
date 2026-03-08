const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all CCP tasks
router.get('/tasks', (req, res) => {
  db.query('SELECT * FROM ccp_tasks', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Save a CCP task
router.post('/tasks', (req, res) => {
  const { task_name, temperature, time_recorded, notes, status } = req.body;
  db.query(
    'INSERT INTO ccp_tasks (task_name, temperature, time_recorded, notes, status) VALUES (?, ?, ?, ?, ?)',
    [task_name, temperature, time_recorded, notes, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Task saved!', id: result.insertId });
    }
  );
});

// Get all CCP logs
router.get('/logs', (req, res) => {
  db.query('SELECT * FROM ccp_logs', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Save hot food check
router.post('/hotfood', (req, res) => {
  const { food_item, batch_id, temperature, action_taken, notes } = req.body;
  db.query(
    'INSERT INTO hot_food_checks (food_item, batch_id, temperature, action_taken, notes) VALUES (?, ?, ?, ?, ?)',
    [food_item, batch_id, temperature, action_taken, notes],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Hot food check saved!', id: result.insertId });
    }
  );
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sendTemperatureAlert, sendTaskReminderEmail, sendCompletionEmail } = require('../emailService');

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a notification and send email
router.post('/', async (req, res) => {
  const { title, message, type, food_item, temperature, incomplete_tasks } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notifications (title, message, type) VALUES ($1, $2, $3) RETURNING *',
      [title, message, type || 'info']
    );

    // Send email based on notification type
    try {
      if (type === 'alert' && food_item && temperature) {
        await sendTemperatureAlert(food_item, temperature);
      } else if (type === 'warning' && incomplete_tasks) {
        await sendTaskReminderEmail(incomplete_tasks);
      } else if (type === 'success') {
        await sendCompletionEmail();
      }
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.json({ message: 'Notification created!', notification: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1',
      [id]
    );
    res.json({ message: 'Notification marked as read!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE');
    res.json({ message: 'All notifications marked as read!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ message: 'Notification deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
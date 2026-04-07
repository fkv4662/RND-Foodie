const { pool } = require('../db');

// POST /api/fridge/log
exports.logOvenTemperature = async (req, res) => {
  try {
    const { device_name, food_item, temperature } = req.body;
    if (!device_name || !food_item || typeof temperature !== 'number' || isNaN(temperature)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const status = temperature < 75 ? 'ALERT' : 'SAFE';
    const query = `INSERT INTO oven_logs (device_name, food_item, temperature, status) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [device_name, food_item, temperature, status];
    const result = await pool.query(query, values);
    // After insert, keep only 30 most recent SAFE logs, never delete ALERT logs
    await pool.query(`DELETE FROM oven_logs WHERE id IN (
      SELECT id FROM oven_logs WHERE status = 'SAFE' ORDER BY recorded_at DESC OFFSET 30
    )`);
    res.json({ success: true, log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// DELETE /api/fridge/log/:id
exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM oven_logs WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/fridge/logs (delete all logs)
exports.deleteAllLogs = async (req, res) => {
  try {
    await pool.query('DELETE FROM oven_logs');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fridge/logs
exports.getOvenLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM oven_logs ORDER BY recorded_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fridge/alerts
exports.getOvenAlerts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM oven_logs WHERE status = 'ALERT' ORDER BY recorded_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

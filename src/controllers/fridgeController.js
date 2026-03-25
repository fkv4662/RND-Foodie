const { pool } = require('../db');

// POST /api/fridge/log
exports.logFridgeData = async (req, res) => {
  try {
    const { device_name, temperature, humidity } = req.body;
    if (!device_name || temperature === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const status = temperature > 5 ? 'ALERT' : 'SAFE';
    const query = `INSERT INTO fridge_logs (device_name, temperature, humidity, status) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [device_name, temperature, humidity, status];
    const result = await pool.query(query, values);

    // Auto-delete non-alert logs after 30 entries (keep alerts)
    await pool.query(`DELETE FROM fridge_logs WHERE id IN (
      SELECT id FROM fridge_logs WHERE status != 'ALERT' ORDER BY recorded_at DESC OFFSET 30
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
    const result = await pool.query('DELETE FROM fridge_logs WHERE id = $1 RETURNING *', [id]);
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
    await pool.query('DELETE FROM fridge_logs');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fridge/logs
exports.getAllLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fridge_logs ORDER BY recorded_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fridge/alerts
exports.getAlerts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM fridge_logs WHERE status = 'ALERT' ORDER BY recorded_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

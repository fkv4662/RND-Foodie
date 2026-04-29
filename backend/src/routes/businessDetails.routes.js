const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         COALESCE(form_data->>'legalName', '') AS legal_name,
         COALESCE(form_data->>'tradingName', '') AS trading_name,
         updated_at
       FROM business_details
       ORDER BY updated_at DESC, id DESC`
    );

    return res.json(
      result.rows.map((row) => ({
        id: row.id,
        legalName: row.legal_name,
        tradingName: row.trading_name,
        updatedAt: row.updated_at,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, form_data, updated_at FROM business_details WHERE id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Business details not found' });
    }

    return res.json({
      id: result.rows[0].id,
      formData: result.rows[0].form_data || {},
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'A form object is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO business_details (form_data, updated_at)
       VALUES ($1::jsonb, NOW())
       RETURNING id, updated_at`,
      [JSON.stringify(req.body)]
    );

    return res.json({
      message: 'Business details created',
      id: result.rows[0].id,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'A form object is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE business_details
       SET form_data = $2::jsonb, updated_at = NOW()
       WHERE id = $1
       RETURNING id, updated_at`,
      [req.params.id, JSON.stringify(req.body)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Business details not found' });
    }

    return res.json({
      message: 'Business details updated',
      id: result.rows[0].id,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM business_details WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Business details not found' });
    }

    return res.json({ message: 'Business details deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
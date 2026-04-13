const express = require('express');
const router = express.Router();

const {
  ingestMockTestoReadings,
  addManualTestoReading,
  getAllTestoReadings,
  getTestoAlerts
} = require('../services/testoService');

// Manual entry
router.post('/manual', async (req, res) => {
  try {
    const row = await addManualTestoReading(req.body);
    res.json({
      success: true,
      message: 'Manual Testo reading saved',
      reading: row
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Mock cloud import
router.post('/ingest', async (req, res) => {
  try {
    const result = await ingestMockTestoReadings();
    res.json({
      success: true,
      message: 'Testo cloud import completed',
      result
    });
  } catch (error) {
    console.error('Testo ingestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Testo ingestion failed',
      error: error.message
    });
  }
});

// All readings
router.get('/readings', async (req, res) => {
  try {
    const rows = await getAllTestoReadings();
    res.json(rows);
  } catch (error) {
    console.error('Get Testo readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Testo readings',
      error: error.message
    });
  }
});

// Alerts only
router.get('/alerts', async (req, res) => {
  try {
    const rows = await getTestoAlerts();
    res.json(rows);
  } catch (error) {
    console.error('Get Testo alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Testo alerts',
      error: error.message
    });
  }
});

module.exports = router;
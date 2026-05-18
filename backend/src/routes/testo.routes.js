const express = require('express');
const router = express.Router();

const {
  ingestMockTestoReadings,
  importTestoCsvText,
  addManualTestoReading,
  getAllTestoReadings,
  getTestoAlerts,
  getTestoDevices,
} = require('../services/testoService');

/**
 * Gets date/time filters from the frontend query string.
 * Example:
 * /api/testo/readings?start=2026-05-11T00:00:00&end=2026-05-18T23:59:59
 */
function getDateFilters(req) {
  return {
    start: req.query.start,
    end: req.query.end,
  };
}

// Manual entry
router.post('/manual', async (req, res) => {
  try {
    const row = await addManualTestoReading(req.body);

    res.json({
      success: true,
      message: 'Manual Testo reading saved',
      reading: row,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Real Testo CSV import
router.post('/import-csv', async (req, res) => {
  try {
    const { csvText, fileName } = req.body;

    if (!csvText) {
      return res.status(400).json({
        success: false,
        message: 'CSV text is required',
      });
    }

    const result = await importTestoCsvText(csvText, fileName);

    res.json({
      success: true,
      message: 'Testo CSV import completed',
      result,
    });
  } catch (error) {
    console.error('Testo CSV import error:', error);

    res.status(500).json({
      success: false,
      message: 'Testo CSV import failed',
      error: error.message,
    });
  }
});

// Mock import kept for development/testing
router.post('/ingest', async (req, res) => {
  try {
    const result = await ingestMockTestoReadings();

    res.json({
      success: true,
      message: 'Mock Testo import completed',
      result,
    });
  } catch (error) {
    console.error('Testo ingestion error:', error);

    res.status(500).json({
      success: false,
      message: 'Testo ingestion failed',
      error: error.message,
    });
  }
});

// Device list for frontend filter
router.get('/devices', async (req, res) => {
  try {
    const devices = await getTestoDevices();
    res.json(devices);
  } catch (error) {
    console.error('Get Testo devices error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch Testo devices',
      error: error.message,
    });
  }
});

// All readings with optional date filters
router.get('/readings', async (req, res) => {
  try {
    const rows = await getAllTestoReadings(getDateFilters(req));
    res.json(rows);
  } catch (error) {
    console.error('Get Testo readings error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch Testo readings',
      error: error.message,
    });
  }
});

// Alert readings with optional date filters
router.get('/alerts', async (req, res) => {
  try {
    const rows = await getTestoAlerts(getDateFilters(req));
    res.json(rows);
  } catch (error) {
    console.error('Get Testo alerts error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch Testo alerts',
      error: error.message,
    });
  }
});

module.exports = router;
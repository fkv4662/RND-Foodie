const express = require('express');
const router = express.Router();
const ovenController = require('../controllers/ovenController');

// POST /api/oven/log
router.post('/log', ovenController.logOvenTemperature);

// GET /api/oven/logs
router.get('/logs', ovenController.getOvenLogs);

// GET /api/oven/alerts
router.get('/alerts', ovenController.getOvenAlerts);

// DELETE single log
router.delete('/log/:id', ovenController.deleteLog);

// DELETE all logs
router.delete('/logs', ovenController.deleteAllLogs);

module.exports = router;

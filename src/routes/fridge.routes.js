const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridgeController');

// POST /api/fridge/log
router.post('/log', fridgeController.logFridgeData);

// GET /api/fridge/logs
router.get('/logs', fridgeController.getAllLogs);

// GET /api/fridge/alerts
router.get('/alerts', fridgeController.getAlerts);

// DELETE single log
router.delete('/log/:id', fridgeController.deleteLog);

// DELETE all logs
router.delete('/logs', fridgeController.deleteAllLogs);

module.exports = router;

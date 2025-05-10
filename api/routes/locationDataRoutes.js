const express = require('express');
const router = express.Router();
const locationDataController = require('../controllers/locationDataController');

// Route to get distinct location values for filtering
router.get('/distinct-values', locationDataController.getDistinctLocationValues);

module.exports = router; 
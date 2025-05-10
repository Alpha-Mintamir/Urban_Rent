const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/isAuth'); // Assuming you want to protect this route
const aiController = require('../controllers/aiController');

// POST /api/ai/generate-summary (or just /generate-summary if mounted under /api/ai)
router.post('/generate-summary', isAuth, aiController.generatePropertySummary);

module.exports = router; 
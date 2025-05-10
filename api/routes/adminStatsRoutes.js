const express = require('express');
const router = express.Router();
const { getTotalUsers, getTotalProperties, getPendingVerificationsCount } = require('../controllers/adminStatsController');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/roleMiddleware');

// GET /api/admin/stats/total-users
router.get('/total-users', isAuth, isAdmin, getTotalUsers);

// GET /api/admin/stats/total-properties
router.get('/total-properties', isAuth, isAdmin, getTotalProperties);

// GET /api/admin/stats/pending-verifications
router.get('/pending-verifications', isAuth, isAdmin, getPendingVerificationsCount);


module.exports = router; 
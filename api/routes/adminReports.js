const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/isAuth');
// We'll keep isAdmin commented out for now as per previous security bypass
// const { isAdmin } = require('../middleware/roleMiddleware'); 

const adminReportController = require('../controllers/adminReportController');
const { getUsersSummary, getPropertiesSummary } = require('../controllers/adminReportController');

// Middleware to simulate isAdmin for development if needed, or rely on global bypass
const ensureAdminAccess = (req, res, next) => {
  // This is just a placeholder. The actual isAdmin middleware is globally bypassed.
  // If you re-enable isAdmin in roleMiddleware.js, uncomment it above and use it here.
  console.log('Accessing admin report route. Ensure isAdmin middleware is configured if security is reinstated.');
  next();
};

// User Insights
router.get('/users-summary', isAuth, ensureAdminAccess, getUsersSummary);

// Property Insights
router.get('/properties-summary', isAuth, ensureAdminAccess, getPropertiesSummary);

// Broker Insights (Placeholder for now)
// router.get('/brokers-summary', isAuth, ensureAdminAccess, adminReportController.getBrokersSummary);

// Review Insights (Placeholder for now)
// router.get('/reviews-summary', isAuth, ensureAdminAccess, adminReportController.getReviewsSummary);

// Booking Insights (Placeholder for now)
// router.get('/bookings-summary', isAuth, ensureAdminAccess, adminReportController.getBookingsSummary);

module.exports = router; 
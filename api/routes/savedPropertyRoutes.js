// api/routes/savedPropertyRoutes.js
const express = require('express');
const router = express.Router();
const {
  saveOrUnsaveProperty,
  getSavedProperties,
  getSavedPropertyStatus
} = require('../controllers/savedPropertyController');
// const { protect, authorize } = require('../middleware/auth'); // Old import
const { isLoggedIn } = require('../middleware/auth'); // Corrected import

// All routes in this file will be protected and require a logged-in user.
// The isLoggedIn middleware handles this.
// If role-specific authorization (e.g., only 'tenant') is needed,
// it should be handled within the controller or by a separate authorize middleware.
router.use(isLoggedIn); // Use the correct middleware

router.route('/')
  .post(saveOrUnsaveProperty)    // POST /api/saved-properties (body: { propertyId })
  .get(getSavedProperties);       // GET /api/saved-properties

router.route('/:propertyId/status')
  .get(getSavedPropertyStatus); // GET /api/saved-properties/:propertyId/status

module.exports = router; 
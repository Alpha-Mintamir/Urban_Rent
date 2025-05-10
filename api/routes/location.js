const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/user');

const {
  createLocation,
  getAllLocations,
  getLocationById,
  getLocationsBySubCity,
  getLocationsByWoreda,
  getSubCities,
  getWoredasBySubCity,
  getKebelesByWoreda
} = require('../controllers/locationController');

// Get unique sub-cities - moved to the top to avoid conflict with :id route
router.route('/sub-cities').get(getSubCities);

// Get woredas by sub-city
router.route('/sub-city/:sub_city/woredas').get(getWoredasBySubCity);

// Get kebeles by woreda
router.route('/sub-city/:sub_city/woreda/:woreda/kebeles').get(getKebelesByWoreda);

// Create a new location
router.route('/').post(isLoggedIn, createLocation);

// Get all locations
router.route('/').get(getAllLocations);

// Get locations by sub-city
router.route('/sub-city/:sub_city').get(getLocationsBySubCity);

// Get locations by woreda
router.route('/woreda/:woreda').get(getLocationsByWoreda);

// Get location by ID - moved to the bottom to avoid conflicts with other routes
router.route('/:id').get(getLocationById);

module.exports = router;

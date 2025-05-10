const express = require('express');
const router = express.Router();
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/roleMiddleware');

const {
  addPlace,
  getPlaces,
  updatePlace,
  singlePlace,
  singlePlaceById,
  userPlaces,
  searchPlaces,
  updatePropertyStatus,
  deleteProperty,
  getAllProperties,
  getPropertyById
} = require('../controllers/placeController');

router.route('/').get(getPlaces);

// Protected routes (user must be logged in)
router.route('/add-places').post(isAuth, addPlace);
router.route('/user-places').get(isAuth, userPlaces);
router.route('/update-place').put(isAuth, updatePlace);
router.route('/update-status').put(isAuth, updatePropertyStatus);
router.route('/delete/:id').delete(isAuth, deleteProperty);

// Not Protected routes - ORDER MATTERS HERE!
// More specific routes must come before generic ones
router.route('/search/:key').get(searchPlaces);
router.route('/single-place/:id').get(singlePlaceById); // Specific endpoint for property edit page

// This generic route must come last as it will match any /:id pattern
router.route('/:id').get(singlePlace);

// Admin routes
router.get('/admin/properties', isAuth, isAdmin, getAllProperties);
router.delete('/admin/properties/:id', isAuth, isAdmin, deleteProperty);
router.get('/admin/properties/:id', isAuth, isAdmin, getPropertyById);

module.exports = router;

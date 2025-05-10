const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { isLoggedIn } = require('../middleware/auth');

// Route for uploading photos
router.post('/upload', isLoggedIn, uploadController.uploadPhotos);

// Route for uploading photos by link
router.post('/upload-by-link', isLoggedIn, uploadController.uploadByLink);

module.exports = router; 
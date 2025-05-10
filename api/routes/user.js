const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuth } = require('../middleware/isAuth');
const { isAdmin } = require('../middleware/roleMiddleware');

const upload = multer({ dest: '/tmp' });

const {
  register,
  login,
  logout,
  googleLogin,
  uploadPicture,
  updateUserDetails,
  getUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
} = require('../controllers/userController');

// Import the message controller
const messageController = require('../controllers/messageController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/google/login').post(googleLogin);
router.route('/upload-picture').post(upload.single('picture', 1), uploadPicture);
router.route('/update-user').put(updateUserDetails);
router.route('/profile').get(getUserProfile);
router.route('/logout').get(logout);

// Add message endpoint - use the message controller directly
router.route('/message').post(isAuth, messageController.startConversation);

// Add a test endpoint to debug the message creation process
router.route('/message-test').post(isAuth, (req, res) => {
  try {
    // Log the full request details
    console.log('Test endpoint received request:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });
    
    // Return success with the data we received
    res.status(200).json({
      success: true,
      message: 'Test endpoint received data successfully',
      userData: req.user,
      requestBody: req.body
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ message: 'Error in test endpoint', error: error.message });
  }
});

// Admin routes
router.get('/admin/users', isAuth, isAdmin, getAllUsers);
router.delete('/admin/users/:id', isAuth, isAdmin, deleteUser);
router.get('/admin/users/:id', isAuth, isAdmin, getUserById);

module.exports = router;

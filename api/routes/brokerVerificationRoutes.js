const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isLoggedIn } = require('../middleware/authMiddleware');
const { isBroker, isAdmin } = require('../middleware/roleMiddleware');
const brokerVerificationController = require('../controllers/brokerVerificationController');

// Configure multer to use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files and PDFs
    const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and PDF files are allowed'));
    }
  }
});

// Broker Routes

// Get verification status
router.get('/status', isLoggedIn, isBroker, brokerVerificationController.getVerificationStatus);

// Submit verification documents
router.post(
  '/submit',
  isLoggedIn,
  isBroker,
  (req, res, next) => {
    upload.single('document')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: 'File is too large',
              error: 'The maximum file size is 5MB'
            });
          }
          return res.status(400).json({ 
            message: 'File upload error', 
            error: err.message 
          });
        } else {
          // An unknown error occurred
          return res.status(400).json({ 
            message: 'File upload failed',
            error: err.message
          });
        }
      }
      // No error, proceed to the controller
      next();
    });
  },
  brokerVerificationController.submitVerification
);

// Admin Routes

// Get all verification requests
router.get(
  '/admin/requests',
  isLoggedIn,
  isAdmin,
  brokerVerificationController.getVerificationRequests
);

// Approve a verification request
router.put(
  '/admin/approve/:id',
  isLoggedIn,
  isAdmin,
  brokerVerificationController.approveVerification
);

// Reject a verification request
router.put(
  '/admin/reject/:id',
  isLoggedIn,
  isAdmin,
  brokerVerificationController.rejectVerification
);

// Debug Routes - only for development
router.get('/debug/test-broker-creation', async (req, res) => {
  try {
    const Broker = require('../models/Broker');
    const db = require('../config/db');
    
    // Test database connection
    console.log('Testing database connection...');
    await db.authenticate();
    console.log('Database connection successful');
    
    // Check if broker table exists
    console.log('Checking if broker table exists...');
    const [result] = await db.query("SELECT to_regclass('public.broker') as table_exists");
    console.log('Table check result:', result);
    
    // Try to create a test broker record
    const testBroker = await Broker.create({
      user_id: 999999, // Use a high number that doesn't exist
      broker_no: 12345,
      verification_status: 'not_submitted'
    });
    
    console.log('Test broker created:', testBroker.toJSON());
    
    // Remove the test record
    await testBroker.destroy();
    console.log('Test broker removed');
    
    res.json({ 
      success: true, 
      message: 'Database connection and Broker model are working correctly' 
    });
  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing broker creation',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Debug route to check environment variables (sanitized)
router.get('/env', (req, res) => {
  // Only return non-sensitive environment variables
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT,
    CLIENT_URL: process.env.CLIENT_URL,
    DATABASE_CONNECTED: !!db,
    CLOUDINARY_CONFIGURED: !!(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY),
  };
  
  res.json({
    message: 'Environment variables (safe)',
    env: safeEnv
  });
});

// Debug route to check database connection
router.get('/db', async (req, res) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({
        message: 'Database connection successful',
        status: 'connected'
      });
    } else {
      res.status(500).json({
        message: 'Database connection failed',
        status: 'disconnected'
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Debug route to check server status
router.get('/status', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;

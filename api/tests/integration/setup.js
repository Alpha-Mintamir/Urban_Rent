const request = require('supertest');
const express = require('express');

// Configure environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRY = '1h';
process.env.SESSION_SECRET = 'test_session_secret';
process.env.COOKIE_TIME = '1';
process.env.CLIENT_URL = 'http://localhost:3000';

// Create a simple app for basic endpoint tests
const app = express();

// Basic test routes
app.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Test endpoint' });
});

app.post('/test', express.json(), (req, res) => {
  res.status(200).json({ success: true, data: req.body });
});

module.exports = {
  request,
  app
}; 
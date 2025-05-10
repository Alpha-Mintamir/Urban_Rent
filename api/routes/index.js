const express = require('express');
const router = express.Router();

// Import route handlers
const userRoutes = require('./user');
const placeRoutes = require('./place');
const reviewRoutes = require('./reviewRoutes');
const locationRoutes = require('./location');
const messageRoutes = require('./messageRoutes');
const locationDataRoutes = require('./locationDataRoutes');
const savedPropertyRoutes = require('./savedPropertyRoutes');
const brokerVerificationRoutes = require('./brokerVerificationRoutes');
const adminReportRoutes = require('./adminReports');
// const searchRoutes = require('./searchRoutes'); // Commented out due to missing file
const adminStatsRoutes = require('./adminStatsRoutes');
const aiRoutes = require('./aiRoutes'); // Import AI routes

// User routes
router.use('/users', userRoutes);

// Place routes
router.use('/places', placeRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// Location routes
router.use('/locations', locationRoutes);

// Message routes
router.use('/messages', messageRoutes);

// Location Data routes for fetching distinct filter values
router.use('/location-data', locationDataRoutes);

// Saved Property routes
router.use('/saved-properties', savedPropertyRoutes);

// Broker Verification routes
router.use('/broker/verification', brokerVerificationRoutes);

// Admin Reports routes
router.use('/admin/reports', adminReportRoutes);

// Search routes
// router.use('/search', searchRoutes); // Commented out due to missing file

// Admin Stats routes
router.use('/admin/stats', adminStatsRoutes);

// AI routes
router.use('/api/ai', aiRoutes); // Mount AI routes under /api/ai

// Debug routes - only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/places', async (req, res) => {
    try {
      const Place = require('../models/Place');
      const places = await Place.findAll();
      res.json(places);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a debug endpoint for users
  router.get('/debug/users', async (req, res) => {
    try {
      const User = require('../models/User');
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a debug endpoint for getting a user by ID
  router.get('/debug/users/:id', async (req, res) => {
    try {
      const User = require('../models/User');
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a debug endpoint for properties
  router.get('/debug/properties', async (req, res) => {
    try {
      const Place = require('../models/Place');
      const properties = await Place.findAll({
        include: [
          {
            model: require('../models/User'),
            as: 'owner',
            attributes: ['name', 'email']
          },
          {
            model: require('../models/Location'),
            as: 'location',
            required: false
          },
          {
            model: require('../models/Perk'),
            as: 'perks',
            required: false
          },
          {
            model: require('../models/photo'),
            as: 'photos',
            required: false
          }
        ]
      });
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Add a debug endpoint for getting a property by ID
  router.get('/debug/properties/:id', async (req, res) => {
    try {
      const Place = require('../models/Place');
      const property = await Place.findByPk(req.params.id, {
        include: [
          {
            model: require('../models/User'),
            as: 'owner',
            attributes: ['name', 'email']
          },
          {
            model: require('../models/Location'),
            as: 'location',
            required: false
          },
          {
            model: require('../models/Perk'),
            as: 'perks',
            required: false
          },
          {
            model: require('../models/photo'),
            as: 'photos',
            required: false
          }
        ]
      });
      
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = router;

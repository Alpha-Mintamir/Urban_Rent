// Authentication middleware - checks if user is logged in
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAuth = async (req, res, next) => {
  try {
    // Get token from cookies or headers
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists - use the findByPk method for Sequelize
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Authentication failed.'
      });
    }
    
    // Attach user to request
    req.user = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please log in again.'
    });
  }
}; 
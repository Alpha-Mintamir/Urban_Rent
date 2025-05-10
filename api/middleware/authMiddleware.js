// Authentication middleware
const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Debug token
    console.log('Auth token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug decoded token
    console.log('Decoded token:', decoded);
    
    // Normalize user ID handling to work with both 'id' and 'user_id' formats in tokens
    const userId = decoded.id || decoded.user_id;
    
    if (!userId) {
      console.error('No user ID found in token:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Add user info to request with consistent field names
    req.user = {
      id: userId,           // Use normalized ID
      user_id: userId,      // Add both formats for backward compatibility
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    // Debug user object
    console.log('User in middleware:', req.user);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role middleware to check specific user roles

/**
 * Middleware to check if user is a broker (role === 3)
 */
exports.isBroker = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userRole = parseInt(req.user.role);
  
  if (userRole !== 3) {
    return res.status(403).json({ message: 'Access denied. Broker role required.' });
  }
  
  next();
};

/**
 * Middleware to check if user is a property owner (role === 2)
 */
exports.isPropertyOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userRole = parseInt(req.user.role);
  
  if (userRole !== 2) {
    return res.status(403).json({ message: 'Access denied. Property owner role required.' });
  }
  
  next();
};

/**
 * Middleware to check if user is an admin (role === 4)
 * SECURITY BYPASSED FOR DEVELOPMENT
 */
exports.isAdmin = (req, res, next) => {
  /* Security check bypassed
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userRole = parseInt(req.user.role);
  
  if (userRole !== 4) {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  */
  
  // Always proceed (security bypass)
  console.log('SECURITY WARNING: Admin check bypassed');
  next();
};

/**
 * Middleware to check if user is either a property owner or broker
 */
exports.isPropertyOwnerOrBroker = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userRole = parseInt(req.user.role);
  
  if (userRole !== 2 && userRole !== 3) {
    return res.status(403).json({ message: 'Access denied. Property owner or broker role required.' });
  }
  
  next();
}; 
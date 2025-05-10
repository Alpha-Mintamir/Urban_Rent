const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks user is logged in based on passed token and set the user in request
exports.isLoggedIn = async (req, res, next) => {
    // token could be found in request cookies or in reqest headers
    let token;
    
    // Check if token exists in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // Check if token exists in Authorization header
    else if (req.header('Authorization')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Login first to access this page',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('JWT decoded:', decoded); // Log the decoded token
        
        // Find the user by ID
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }
        
        // Set the user object in the request with the correct ID
        req.user = {
            id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        
        console.log('User authenticated:', req.user); // Log the authenticated user
        next();
    } catch (error) {
        // Handle JWT verification error
        console.error('JWT verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

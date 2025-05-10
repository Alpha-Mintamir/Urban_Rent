const jwt = require('jsonwebtoken');

exports.isLoggedIn = async (req, res, next) => {
    try {
        let token;
        
        // Check for token in cookies first
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } 
        // Then check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

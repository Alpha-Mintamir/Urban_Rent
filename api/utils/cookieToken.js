const User = require('../models/User');

// Helper function to parse JWT_EXPIRY string to milliseconds
const getExpiryMilliseconds = (expiryValueInput) => {
    const expiryValue = expiryValueInput || '1h'; // Default to 1h if undefined, matching User.js
    const defaultValue = 60 * 60 * 1000; // Default to 1 hour in milliseconds

    if (typeof expiryValue === 'number') { // If it's already in seconds (as per jwt.sign spec)
        return expiryValue * 1000;
    }

    if (typeof expiryValue !== 'string') {
        return defaultValue;
    }

    const value = parseInt(expiryValue.substring(0, expiryValue.length - 1));
    const unit = expiryValue.charAt(expiryValue.length - 1).toLowerCase();

    if (isNaN(value)) {
         // Check if the whole string is a number (representing seconds)
        if (!isNaN(parseInt(expiryValue))) return parseInt(expiryValue) * 1000;
        return defaultValue;
    }

    switch (unit) {
        case 's': return value * 1000; // seconds
        case 'm': return value * 60 * 1000; // minutes
        case 'h': return value * 60 * 60 * 1000; // hours
        case 'd': return value * 24 * 60 * 60 * 1000; // days
        default:
            return defaultValue; 
    }
};

const cookieToken = (user, res) => {
    const token = user.getJwtToken();
    
    // Use JWT_EXPIRY from environment to set cookie expiration
    const jwtExpiryMs = getExpiryMilliseconds(process.env.JWT_EXPIRY);

    const options = {
        expires: new Date(Date.now() + jwtExpiryMs),
        httpOnly: true, // makes the token available only to backend
        secure: true,   // Only send over HTTPS
        sameSite: 'none' // Allow cross-origin requests
    };


    user.password = undefined;
    res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user
    });
};

module.exports = cookieToken;
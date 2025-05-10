const User = require('../models/User');
const cookieToken = require('../utils/cookieToken');
const bcrypt = require('bcryptjs')
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');


// Register/SignUp user
exports.register = async (req, res) => {
  try {
    const { name, email, password, picture, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // check if user is already registered
    let user = await User.findByEmail(email);

    if (user) {
      return res.status(400).json({
        message: 'User already registered!',
      });
    }

    // Create new user
    user = await User.register({
      name,
      email,
      password,
      picture,
      phone,
      role
    });

    // after creating new user in DB send the token
    cookieToken(user, res);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Internal server Error',
      error: err.message,
    });
  }
};

// Login/SignIn user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required!',
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: 'User does not exist!',
      });
    }

    // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Email or password is incorrect!',
      });
    }

    // Log the user's role for debugging
    console.log(`User ${email} authenticated successfully with role: ${user.role}`);

    // if everything is fine we will send the token
    cookieToken(user, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: 'Internal server Error',
      error: err.message,
    });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // check if user already registered
    let user = await User.findByEmail(email);

    // If the user does not exist, create a new user in the DB  
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      // Default to tenant role (1) for new Google users
      user = await User.register({
        name,
        email,
        password: randomPassword,
        role: 1 // Default to tenant role
      });
    }

    // Log the user's role for debugging
    console.log(`Google user ${email} authenticated with role: ${user.role}`);

    // send the token
    cookieToken(user, res);
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({
      message: 'Internal server Error',
      error: err.message,
    });
  }
}

// Upload picture
exports.uploadPicture = async (req, res) => {
  const { path } = req.file
  try {
    let result = await cloudinary.uploader.upload(path, {
      folder: 'Airbnb/Users',
    });
    res.status(200).json(result.secure_url)
  } catch (error) {
    console.error('Upload picture error:', error);
    res.status(500).json({
      error: error.message,
      message: 'Internal server error',
    });
  }
}

// update user
exports.updateUserDetails = async (req, res) => {
  try {
    const { name, password, email, picture } = req.body

    console.log('Update request received:', { 
      name, 
      email, 
      password: password ? '********' : undefined,
      picture: picture ? 'Picture URL exists' : 'No picture URL'
    });

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Use the updateUser method from the User model
    const updatedUser = await User.updateUser({
      user_id: user.user_id,
      name,
      password: password || undefined, // Only update if provided
      picture: picture || undefined // Only update if provided
    });
    
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update user'
      });
    }
    
    console.log('User updated successfully:', {
      name: updatedUser.name,
      picture: updatedUser.picture ? 'Picture URL exists' : 'No picture URL'
    });
    
    // After updating user, send token
    cookieToken(updatedUser, res);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Login first to access this resource'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,   // Only send over HTTPS
    sameSite: 'none' // Allow cross-origin requests
  });
  res.status(200).json({
    success: true,
    message: 'Logged out',
  });
};

/**
 * Get all users - Admin only
 * @route GET /api/users/admin/users
 * @access Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user by ID - Admin only
 * @route GET /api/users/admin/users/:id
 * @access Private (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete user - Admin only
 * @route DELETE /api/users/admin/users/:id
 * @access Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow admins to delete other admins or themselves
    if (user.role === 4) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

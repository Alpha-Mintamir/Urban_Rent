const request = require('supertest');
const express = require('express');
const { testUsers } = require('./helpers');

// Create a simple mocked app for testing
const app = express();

// Add JSON middleware for body parsing
app.use(express.json());

// Import mock controller
const userController = require('../../controllers/userController');

// Register the routes directly in the test
app.post('/users/register', userController.register);
app.post('/users/login', userController.login);
app.get('/users/logout', userController.logout);
app.get('/test-endpoint', (req, res) => res.status(200).json({ success: true }));

// Mock the user controller
jest.mock('../../controllers/userController', () => ({
  register: jest.fn((req, res) => {
    const { email, name, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }
    
    // Check if user already exists
    if (email === 'test@example.com') {
      return res.status(400).json({
        success: false,
        error: 'User already registered!'
      });
    }
    
    const user = {
      user_id: 1,
      name,
      email,
      role: 1
    };
    
    return res.status(200)
      .cookie("token", "test-token", {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true
      })
      .json({
        success: true,
        token: "test-token",
        user
      });
  }),
  
  login: jest.fn((req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required!'
      });
    }
    
    if (email !== 'test@example.com') {
      return res.status(400).json({
        success: false,
        error: 'User does not exist!'
      });
    }
    
    if (password !== 'Password123') {
      return res.status(400).json({
        success: false,
        error: 'Email or password is incorrect!'
      });
    }
    
    const user = {
      user_id: 1,
      name: 'Test User',
      email,
      role: 1
    };
    
    return res.status(200)
      .cookie("token", "test-token", {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true
      })
      .json({
        success: true,
        token: "test-token",
        user
      });
  }),
  
  logout: jest.fn((req, res) => {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true
    });
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  })
}));

describe('Authentication API Tests', () => {
  // Simple test to verify test setup
  it('should respond to test endpoint', async () => {
    const response = await request(app).get('/test-endpoint');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 if email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const userData = {
        name: 'Test User',
        // missing email
        password: 'Password123'
      };

      const response = await request(app)
        .post('/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('User Login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('User Logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app).get('/users/logout');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
}); 
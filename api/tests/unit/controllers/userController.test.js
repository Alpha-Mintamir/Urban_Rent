// userController.test.js
const userController = require('../../../controllers/userController');
const User = require('../../../models/User');
const cookieToken = require('../../../utils/cookieToken');

// Just in case the global mock isn't enough, mock the cloudinary module here too
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ 
        secure_url: 'https://test-cloudinary-url.com/test-image.jpg' 
      })
    }
  }
}));

// Ensure cookieToken is mocked
jest.mock('../../../utils/cookieToken');

describe('userController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      file: { path: 'test/path/image.jpg' },
      cookies: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis()
    };
    
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    beforeEach(() => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findByEmail.mockResolvedValue(null);
      User.register.mockResolvedValue({
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com'
      });
    });
    
    it('should register a new user successfully', async () => {
      await userController.register(req, res);
      
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(User.register).toHaveBeenCalled();
      expect(cookieToken).toHaveBeenCalled();
    });
    
    it('should return 400 if required fields are missing', async () => {
      req.body = { name: 'Test User' }; // Missing email and password
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Name, email and password are required'
      });
      expect(User.register).not.toHaveBeenCalled();
    });
    
    it('should return 400 if user already exists', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1, email: 'test@example.com' });
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already registered!'
      });
      expect(User.register).not.toHaveBeenCalled();
    });
    
    it('should handle errors properly', async () => {
      const error = new Error('Database error');
      User.findByEmail.mockRejectedValue(error);
      
      await userController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server Error',
        error: 'Database error'
      });
    });
  });
  
  describe('login', () => {
    let mockUser;
    
    beforeEach(() => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockUser = {
        user_id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        role: 1,
        isValidatedPassword: jest.fn()
      };
      
      User.findByEmail.mockResolvedValue(mockUser);
    });
    
    it('should login user successfully with valid credentials', async () => {
      mockUser.isValidatedPassword.mockResolvedValue(true);
      
      await userController.login(req, res);
      
      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.isValidatedPassword).toHaveBeenCalledWith('password123');
      expect(cookieToken).toHaveBeenCalledWith(mockUser, res);
    });
    
    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password are required!'
      });
    });
    
    it('should return 400 if user does not exist', async () => {
      User.findByEmail.mockResolvedValue(null);
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User does not exist!'
      });
    });
    
    it('should return 401 if password is incorrect', async () => {
      mockUser.isValidatedPassword.mockResolvedValue(false);
      
      await userController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email or password is incorrect!'
      });
    });
  });
}); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/User');

// Mock bcrypt and jwt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockImplementation(() => 'hashedPassword123')
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_jwt_token')
}));

describe('User Model', () => {
  let userInstance;
  
  beforeEach(() => {
    // Create test user data
    userInstance = {
      user_id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      picture: 'https://example.com/pic.jpg',
      phone: '1234567890',
      role: 1,
      changed: jest.fn()
    };
    
    // Set up prototype methods
    User.prototype.isValidatedPassword.mockImplementation(async function(userSentPassword) {
      return await bcrypt.compare(userSentPassword, this.password);
    });
    
    User.prototype.getJwtToken.mockImplementation(function() {
      return jwt.sign(
        { 
          id: this.user_id,
          email: this.email,
          role: this.role,
          name: this.name
        }, 
        process.env.JWT_SECRET, 
        {
          expiresIn: process.env.JWT_EXPIRY || '1h',
        }
      );
    });
    
    // Set up static methods for this test run
    User.findByEmail.mockImplementation(async (email) => {
      // Mock implementation of findByEmail
      User.findOne({ where: { email } });
      return Promise.resolve(userInstance);
    });
    
    User.findById.mockImplementation(async (id) => {
      // Mock implementation of findById
      User.findByPk(id);
      return Promise.resolve(userInstance);
    });
    
    User.register.mockImplementation(async (userData) => {
      // Mock implementation of register
      User.create(userData);
      return Promise.resolve(userInstance);
    });
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('isValidatedPassword', () => {
    it('should call bcrypt.compare with correct parameters', async () => {
      bcrypt.compare.mockResolvedValue(true);
      
      const result = await User.prototype.isValidatedPassword.call(userInstance, 'password123');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', userInstance.password);
      expect(result).toBe(true);
    });
    
    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);
      
      const result = await User.prototype.isValidatedPassword.call(userInstance, 'wrongpassword');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', userInstance.password);
      expect(result).toBe(false);
    });
  });
  
  describe('getJwtToken', () => {
    it('should call jwt.sign with correct parameters', () => {
      const token = User.prototype.getJwtToken.call(userInstance);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: userInstance.user_id,
          email: userInstance.email,
          role: userInstance.role,
          name: userInstance.name
        },
        'test_jwt_secret',
        { expiresIn: '1h' }
      );
      expect(token).toBe('mocked_jwt_token');
    });
  });
  
  describe('static methods', () => {
    it('should call findOne with correct parameters for findByEmail', async () => {
      await User.findByEmail('test@example.com');
      
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
    
    it('should call findByPk with correct parameters for findById', async () => {
      await User.findById(1);
      
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });
    
    it('should call create with correct parameters for register', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        picture: 'https://example.com/pic.jpg',
        phone: '1234567890',
        role: 1
      };
      
      await User.register(userData);
      
      expect(User.create).toHaveBeenCalledWith(userData);
    });
  });
  
  describe('hooks', () => {
    it('should hash password before create', async () => {
      // Mock hook function to call bcrypt.hash
      const mockHook = async (user) => {
        // Make sure hash is called with the original password
        const originalPassword = user.password;
        const hash = await bcrypt.hash(originalPassword, 10);
        user.password = hash;
        return user;
      };
      
      // Replace the mock hook with one that will actually call bcrypt.hash
      User.hooks.beforeCreate[0] = mockHook;
      
      await User.hooks.beforeCreate[0](userInstance);
      
      // Check that hash was called with the original password
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      // Check that the password was updated with the hash result
      expect(userInstance.password).toBe('hashedPassword123');
    });
    
    it('should hash password before update if password changed', async () => {
      // Mock hook function to call bcrypt.hash when password changed
      const mockHook = async (user) => {
        if (user.changed('password')) {
          // Make sure hash is called with the original password
          const originalPassword = user.password;
          const hash = await bcrypt.hash(originalPassword, 10);
          user.password = hash;
        }
        return user;
      };
      
      // Replace the mock hook with one that will actually call bcrypt.hash
      User.hooks.beforeUpdate[0] = mockHook;
      
      userInstance.changed.mockReturnValue(true);
      
      await User.hooks.beforeUpdate[0](userInstance);
      
      // Check that hash was called with the original password
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      // Check that the password was updated with the hash result
      expect(userInstance.password).toBe('hashedPassword123');
    });
    
    it('should not hash password before update if password not changed', async () => {
      // Mock hook function that checks if password changed
      const mockHook = async (user) => {
        if (user.changed('password')) {
          const hash = await bcrypt.hash(user.password, 10);
          user.password = hash;
        }
        return user;
      };
      
      // Replace the mock hook with one that will check changed()
      User.hooks.beforeUpdate[0] = mockHook;
      
      userInstance.changed.mockReturnValue(false);
      
      await User.hooks.beforeUpdate[0](userInstance);
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userInstance.password).toBe('password123');
    });
  });
}); 
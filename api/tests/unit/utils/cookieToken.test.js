// cookieToken.test.js
const cookieToken = require('../../../utils/cookieToken');

// Mock User module directly in this test file
jest.mock('../../../models/User', () => ({}));

describe('cookieToken Utility', () => {
  let mockUser, mockRes;
  
  beforeEach(() => {
    // Mock user with getJwtToken method
    mockUser = {
      getJwtToken: jest.fn().mockReturnValue('test_token'),
      password: 'password123'
    };
    
    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  it('should set cookie with correct parameters', () => {
    // Call the cookieToken function
    cookieToken(mockUser, mockRes);
    
    // Check if user's getJwtToken method was called
    expect(mockUser.getJwtToken).toHaveBeenCalled();
    
    // Check if res.status was called with 200
    expect(mockRes.status).toHaveBeenCalledWith(200);
    
    // Check if res.cookie was called with correct parameters
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'token', 
      'test_token', 
      expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
    );
  });
  
  it('should remove password from user object', () => {
    // Call the cookieToken function
    cookieToken(mockUser, mockRes);
    
    // Check if password was removed from user object
    expect(mockUser.password).toBeUndefined();
  });
  
  it('should return JSON response with user and token', () => {
    // Call the cookieToken function
    cookieToken(mockUser, mockRes);
    
    // Check if res.json was called with correct parameters
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      token: 'test_token',
      user: mockUser
    });
  });
  
  it('should use correct expiry time from environment variable', () => {
    // Store original JWT_EXPIRY
    const originalExpiry = process.env.JWT_EXPIRY;
    
    // Set JWT_EXPIRY to 2 hours
    process.env.JWT_EXPIRY = '2h';
    
    // Mock Date.now to return a fixed timestamp
    const fixedDate = new Date('2023-01-01T00:00:00Z').getTime();
    jest.spyOn(Date, 'now').mockImplementation(() => fixedDate);
    
    // Call the cookieToken function
    cookieToken(mockUser, mockRes);
    
    // Expected expiration (2 hours = 7200000 milliseconds)
    const expectedExpiry = new Date(fixedDate + 7200000);
    
    // Check if res.cookie was called with correct expiration
    expect(mockRes.cookie).toHaveBeenCalledWith(
      'token',
      'test_token',
      expect.objectContaining({
        expires: expectedExpiry
      })
    );
    
    // Restore original JWT_EXPIRY
    process.env.JWT_EXPIRY = originalExpiry;
    
    // Restore Date.now
    jest.restoreAllMocks();
  });
}); 
// tests/models/User.test.js
const User = require('../../models/User');
const { sequelize, syncDB, closeDB, bcrypt, jwt } = require('../testHelpers');

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRY = '1h';

describe('User Model', () => {
  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  describe('Model Initialization', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 1
      };

      // Act
      const user = await User.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.phone).toBe(userData.phone);
      expect(user.role).toBe(userData.role);
      // Password should be hashed
      expect(user.password).not.toBe(userData.password);
    });

    it('should fail if required fields are missing', async () => {
      // Arrange
      const invalidUserData = {
        email: 'test@example.com',
        password: 'password123'
        // Missing required name field
      };

      // Act & Assert
      await expect(User.create(invalidUserData)).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Act
      const user = await User.create(userData);

      // Assert
      expect(user.role).toBe(1); // Default role is tenant (1)
      expect(user.picture).toBeDefined(); // Default picture should be set
    });
  });

  describe('Instance Methods', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 1
      });
    });

    it('isValidatedPassword should verify password correctly', async () => {
      // bcrypt.compare is mocked to return true in testHelpers
      const result = await testUser.isValidatedPassword('password123');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', testUser.password);
    });

    it('getJwtToken should generate a JWT token', () => {
      // Act
      const token = testUser.getJwtToken();

      // Assert
      expect(token).toBe('mocked-jwt-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: testUser.user_id,
          email: testUser.email,
          role: testUser.role,
          name: testUser.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );
    });
  });

  describe('Static Methods', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 1
      });
    });

    it('findByEmail should return the correct user', async () => {
      // Act
      const foundUser = await User.findByEmail('test@example.com');

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe('Test User');
      expect(foundUser.email).toBe('test@example.com');
    });

    it('findById should return the correct user', async () => {
      // Act
      const foundUser = await User.findById(testUser.user_id);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe('Test User');
      expect(foundUser.user_id).toBe(testUser.user_id);
    });

    it('register should create a new user', async () => {
      // Arrange
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'newpassword',
        role: 2
      };

      // Act
      const newUser = await User.register(userData);

      // Assert
      expect(newUser).toBeDefined();
      expect(newUser.name).toBe(userData.name);
      expect(newUser.email).toBe(userData.email);
      expect(newUser.role).toBe(userData.role);
    });

    it('updateUser should update user data', async () => {
      // Arrange
      const updateData = {
        user_id: testUser.user_id,
        name: 'Updated Name',
        password: 'newpassword'
      };

      // Act
      const updatedUser = await User.updateUser(updateData);

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser.name).toBe('Updated Name');
      // Password should have been hashed during update
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('updateUser should return null for non-existent user', async () => {
      // Act
      const result = await User.updateUser({ user_id: 999 });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Hooks', () => {
    it('should hash password before create', async () => {
      // Act
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainpassword',
        role: 1
      });

      // Assert
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should hash password before update when password changes', async () => {
      // Arrange
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 1
      });

      // Reset mock to clear previous calls
      bcrypt.hash.mockClear();

      // Act
      user.password = 'newpassword';
      await user.save();

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('should not hash password when password is not changed', async () => {
      // Arrange
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 1
      });

      // Reset mock to clear previous calls
      bcrypt.hash.mockClear();

      // Act - update something other than password
      user.name = 'New Name';
      await user.save();

      // Assert
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });
});

// setup.js
// Set up test environment variables and mocks

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRY = '1h';

// Suppress console logs during test runs to make output cleaner
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Only show console output for failed tests or when explicitly enabled
if (process.env.DEBUG_TESTS !== 'true') {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  global.console.info = jest.fn();
}

// Restore console functions after tests
afterAll(() => {
  global.console.log = originalConsoleLog;
  global.console.error = originalConsoleError;
  global.console.warn = originalConsoleWarn;
  global.console.info = originalConsoleInfo;
});

// Mock db/sequelize
jest.mock('../config/db', () => {
  const mockModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    hasMany: jest.fn(),
    belongsTo: jest.fn()
  };
  
  return {
    authenticate: jest.fn().mockResolvedValue(),
    define: jest.fn().mockReturnValue(mockModel),
    models: {},
    sync: jest.fn().mockResolvedValue(),
    transaction: jest.fn().mockImplementation(() => ({
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    })),
    fn: jest.fn(),
    col: jest.fn(),
    Op: {
      and: jest.fn(),
      or: jest.fn(),
      gt: jest.fn(),
      gte: jest.fn(),
      lt: jest.fn(),
      lte: jest.fn(),
      ne: jest.fn(),
      eq: jest.fn(),
      in: jest.fn(),
      notIn: jest.fn(),
      like: jest.fn()
    }
  };
});

jest.mock('sequelize', () => {
  // Define DataTypes inside the factory function to avoid reference error
  const mockDataTypes = {
    STRING: jest.fn().mockImplementation(() => 'STRING'),
    INTEGER: jest.fn().mockImplementation(() => 'INTEGER'),
    TEXT: jest.fn().mockImplementation(() => 'TEXT'),
    BOOLEAN: jest.fn().mockImplementation(() => 'BOOLEAN'),
    DOUBLE: jest.fn().mockImplementation(() => 'DOUBLE'),
    ENUM: jest.fn().mockImplementation(() => 'ENUM'),
    ARRAY: jest.fn().mockImplementation(() => 'ARRAY'),
    DATE: jest.fn().mockImplementation(() => 'DATE'),
  };
  
  // Mock Model class
  class Model {
    static init(attributes, options) {
      return this;
    }
    
    static hasMany() {
      return this;
    }
    
    static belongsTo() {
      return this;
    }
    
    static beforeCreate(fn) {
      if (!this.hooks) {
        this.hooks = { beforeCreate: [] };
      }
      this.hooks.beforeCreate = this.hooks.beforeCreate || [];
      this.hooks.beforeCreate.push(fn);
      return this;
    }
    
    static beforeUpdate(fn) {
      if (!this.hooks) {
        this.hooks = { beforeUpdate: [] };
      }
      this.hooks.beforeUpdate = this.hooks.beforeUpdate || [];
      this.hooks.beforeUpdate.push(fn);
      return this;
    }
  }
  
  return {
    DataTypes: mockDataTypes,
    Model,
    Op: {
      and: 'AND',
      or: 'OR',
      gt: 'GT',
      gte: 'GTE',
      lt: 'LT',
      lte: 'LTE',
      ne: 'NE',
      eq: 'EQ',
      in: 'IN',
      notIn: 'NOT_IN',
      like: 'LIKE'
    }
  };
});

// Mock User model for authentication tests
jest.mock('../models/User', () => {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    hooks: {
      beforeCreate: [jest.fn()],
      beforeUpdate: [jest.fn()]
    },
    init: jest.fn().mockReturnThis(),
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
    prototype: {
      isValidatedPassword: jest.fn(),
      getJwtToken: jest.fn()
    }
  };
});

// Mock mongoose (for any mongoose-based models like Booking)
jest.mock('mongoose', () => {
  class MockSchema {
    constructor() {
      this.methods = {};
      this.statics = {};
    }
    
    pre() {
      return this;
    }
    
    virtual() {
      return {
        get: jest.fn(),
        set: jest.fn()
      };
    }
  }
  
  return {
    Schema: MockSchema,
    model: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      populate: jest.fn().mockReturnThis(),
    }),
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      once: jest.fn()
    },
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id)
    }
  };
});

// Mock Cloudinary
jest.mock('cloudinary', () => {
  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload: jest.fn().mockImplementation(() => Promise.resolve({ 
          secure_url: 'https://test-cloudinary-url.com/test-image.jpg' 
        }))
      }
    }
  };
});

// Clean up after all tests
afterAll(() => {
  jest.clearAllMocks();
}); 
// tests/testHelpers.js
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Create a mock Sequelize instance for testing with PostgreSQL
// Use a dedicated test database to avoid affecting production data
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.TEST_DB_NAME || 'urbanrent_test',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Mock the database connection
jest.mock('../config/db', () => {
  return sequelize;
});

// Function to sync all models before tests
const syncDB = async () => {
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

// Function to clean up after tests
const closeDB = async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDB,
  closeDB,
  bcrypt,
  jwt,
};

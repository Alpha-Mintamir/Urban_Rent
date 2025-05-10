const request = require('supertest');
const app = require('../../index'); // Your Express app
const db = require('../../config/db');

// Mock the db.testConnection method
// jest.mock runs before all other code in the file, so db.testConnection will be a mock function.
jest.mock('../../config/db', () => ({
  // Mock the named export 'testConnection'
  // The actual db.js exports an instance as default and testConnection as a named export.
  // However, api/index.js requires it as: const db = require("./config/db");
  // and then calls db.testConnection(). This implies that the require cache
  // might be returning the module object itself, and testConnection is a property on it.
  // Let's assume the primary export or the object obtained via require has testConnection.
  __esModule: true, // if db.js uses ES modules or is transpiled
  default: {
    // if the default export is an object with testConnection
    testConnection: jest.fn(), 
  },
  // and also mock it as a direct export if that's how it's structured
  testConnection: jest.fn(), 
}));

describe('GET /health', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    // This is important to ensure that db.testConnection is the mock from jest.mock
    // and to reset its state before each test.
    // If db.testConnection is directly on the module (e.g. module.exports.testConnection)
    if (db.testConnection && db.testConnection.mockClear) {
        db.testConnection.mockClear();
    }
    // If db is an object and testConnection is a method (e.g. class instance)
    // and the default export is that instance:
    if (db.default && db.default.testConnection && db.default.testConnection.mockClear) {
        db.default.testConnection.mockClear();
    }

    // Fallback if the structure is different - this specific path might need adjustment
    // based on exact export structure of db.js and how it's cached/imported.
    // For the db.js provided, `module.exports.testConnection = database.testConnection.bind(database);`
    // so `db.testConnection` should be the function to mock.
  });

  it('should return 200 with healthy status when db connection is successful', async () => {
    // Ensure the mock is correctly targeted. Given the export from db.js:
    // `module.exports.testConnection = database.testConnection.bind(database);`
    // `db.testConnection` should be the mock function.
    db.testConnection.mockResolvedValue(true);

    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'healthy', database: 'connected' });
    expect(db.testConnection).toHaveBeenCalledTimes(1);
  });

  it('should return 500 with unhealthy status when db connection fails', async () => {
    db.testConnection.mockResolvedValue(false);

    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ status: 'unhealthy', database: 'disconnected' });
    expect(db.testConnection).toHaveBeenCalledTimes(1);
  });

  it('should return 500 with unhealthy status when db.testConnection throws an error', async () => {
    const errorMessage = 'Database connection error';
    db.testConnection.mockRejectedValue(new Error(errorMessage));

    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ status: 'unhealthy', error: errorMessage });
    expect(db.testConnection).toHaveBeenCalledTimes(1);
  });
}); 
/**
 * Integration Test Entry Point
 * 
 * This file serves as the main entry point for running all integration tests.
 * Jest will automatically run all files matching the *.test.js pattern.
 * 
 * Integration tests verify that the various components of the application
 * work together correctly. Unlike unit tests that isolate functions,
 * integration tests check how routes, controllers, models, and database
 * interact with each other.
 * 
 * To run only integration tests, use:
 * npm run test:integration
 */

const { app } = require('./setup');

// Simple test to ensure the test suite runs properly
describe('API Integration Tests', () => {
  it('has a properly configured test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(app).toBeDefined();
  });
});

// The other tests are automatically discovered and run by Jest 
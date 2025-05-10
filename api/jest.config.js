// api/jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.js',
    '!index.js', // Exclude main server entry point from direct coverage (tested via endpoints)
    '!jest.config.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!**/tests/**', // Exclude test files
    '!config/db.js', // Exclude DB config for now, can be tested separately if needed
    // Add other files/directories to exclude if necessary
  ],
  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: './tests/setup.js',
  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: './tests/teardown.js',
  // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
  // setupFilesAfterEnv: ['./tests/setupTestDB.js'], // e.g., for per-test DB setup/teardown
}; 
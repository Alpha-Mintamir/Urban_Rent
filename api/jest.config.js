// api/jest.config.js
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'models/**/*.js',
    'controllers/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/config/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!jest.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './tests/integration/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Disable verbose console logging during tests
  silent: false,
  // Use a cleaner reporter with better symbols
  reporters: [
    'default',
    ['jest-summary-reporter', { includeFailureMsg: true }]
  ],
  // Only show console output for failed tests
  verbose: false,
  // Turn off noisy stack traces
  errorOnDeprecated: false, 
  bail: 0,
  // Custom color configuration
  // Colors are enabled by default in interactive terminals
  forceExit: true,
  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: './tests/setup.js',
  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: './tests/teardown.js',
  // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
  // setupFilesAfterEnv: ['./tests/setupTestDB.js'], // e.g., for per-test DB setup/teardown
  testPathIgnorePatterns: [
    "/node_modules/"
  ]
}; 
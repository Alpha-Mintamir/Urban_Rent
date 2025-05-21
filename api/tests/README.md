# Urban Rent API Testing

This directory contains tests for the Urban Rent API. The tests are organized into different categories:

## Directory Structure

```
tests/
├── setup.js                 # Test setup and mock configurations
├── unit/                    # Unit tests
│   ├── models/              # Tests for model methods and behavior
│   ├── controllers/         # Tests for controller logic
│   └── utils/               # Tests for utility functions
└── README.md                # This file
```

## Running Tests

You can run the tests using the following npm commands:

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Test Coverage

The test coverage report will be generated in the `coverage` directory. You can view the report by opening the `coverage/lcov-report/index.html` file in your browser.

## Writing Tests

### Unit Tests

Unit tests focus on individual components (models, controllers, utilities) in isolation. They should:

1. Test each function/method independently
2. Mock external dependencies
3. Verify correct behavior for various inputs
4. Test error handling

### Test File Naming Convention

- Test files should be named with `.test.js` suffix
- Test files should mirror the structure of the source code

For example:
- `models/User.js` -> `tests/unit/models/User.test.js`
- `controllers/userController.js` -> `tests/unit/controllers/userController.test.js`

## Main Functions Covered

### User Model
- `isValidatedPassword`: Password comparison using bcrypt
- `getJwtToken`: JWT token generation
- Static methods for user operations (findByEmail, findById, register)
- Password hashing hooks

### User Controller
- `register`: User registration with validation
- `login`: User authentication with password validation

### cookieToken Utility
- Cookie creation with proper parameters
- Response formatting
- Password removal from response

## Adding More Tests

To add more tests:

1. Create new test files following the naming convention
2. Ensure they use the proper mocks from setup.js
3. Run tests to verify they pass 
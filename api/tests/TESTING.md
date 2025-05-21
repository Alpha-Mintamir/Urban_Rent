# Urban Rent API Testing Strategy

This document outlines the testing approach for the Urban Rent API, focusing on unit testing and integration testing.

## Testing Setup

We've implemented a comprehensive testing framework with Jest, including:

1. Test directory structure:
   ```
   /api/tests/
   ├── setup.js               # Global test setup and mocks for unit tests
   ├── TESTING.md             # This documentation file
   ├── unit/                  # Unit tests
   │   ├── models/            # Model tests
   │   ├── controllers/       # Controller tests
   │   └── utils/             # Utility function tests
   ├── integration/           # Integration tests
   │   ├── setup.js           # Setup for integration tests with real database
   │   ├── helpers.js         # Test data and utilities
   │   ├── auth.test.js       # Authentication API tests
   │   ├── property.test.js   # Property API tests
   │   └── review.test.js     # Review API tests
   ```

2. Configuration:
   - Jest configuration in `jest.config.js`
   - Environment variables and mocks in `setup.js`
   - Test coverage reporting

## Current Test Coverage

We've implemented tests for core components:

1. **User Model Tests**:
   - Password validation (`isValidatedPassword`)
   - JWT token generation (`getJwtToken`)
   - User management methods (`findByEmail`, `findById`, `register`)
   - Password hashing hooks

2. **User Controller Tests**:
   - User registration with validation
   - Login authentication flow
   - Error handling

3. **Utility Tests**:
   - Cookie token generation and response formatting

4. **Location Model Tests**:
   - Creating location records
   - Finding locations by house number and area name

5. **Location Controller Tests**:
   - Retrieving locations by area
   - Adding new locations with validation

6. **Review Model Tests**:
   - Creating review records
   - Finding reviews by property ID and user ID

7. **Review Controller Tests**:
   - Getting reviews for a specific property
   - Calculating average rating for a property
   - Creating new reviews with validation
   - Retrieving reviews for properties owned by a user
   - Counting total reviews for a property owner

8. **Property Model Tests**:
   - Creating property records
   - Finding properties by ID and user ID
   - Finding properties with filtering and pagination

9. **Property Controller Tests**:
   - Adding new properties with validation and authorization
   - Retrieving user-specific properties
   - Filtering and paginating properties
   - Updating properties with location, perks, and photos

10. **Integration Tests**:
    - Authentication API (registration, login, logout)
    - Property API (CRUD operations)
    - Review API (create, read, delete reviews)

## Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Extending Test Coverage

To improve test coverage:

1. **Add Model Tests**:
   - Implement tests for `Booking` and other models
   - Follow the pattern in `User.test.js`

2. **Add Controller Tests**:
   - Implement tests for `bookingController`, etc.
   - Follow the pattern in `userController.test.js`

3. **Integration Tests**:
   - We've implemented integration tests in the `integration` directory
   - Tests use supertest for HTTP request testing
   - Integration tests verify end-to-end API behavior with real database interactions

## Testing Strategies

### Unit Testing

Our unit tests use Jest's mocking capabilities:

1. **Database Mocking**:
   - Sequelize is mocked to prevent actual database connections
   - Models are mocked with Jest mock functions

2. **External Service Mocking**:
   - JWT generation is mocked
   - Bcrypt password hashing is mocked
   - Cloudinary file upload is mocked

### Integration Testing

Integration tests work with real components:

1. **Database Integration**:
   - Tests connect to a test database (cleared between tests)
   - Database operations are performed with real models

2. **API Testing**:
   - Tests make HTTP requests to API endpoints
   - Response status, headers, and body are verified
   - Authentication flows are tested end-to-end

3. **Test Data**:
   - Helper functions create test data for each test case
   - Data is isolated between tests to ensure independence

## Best Practices

When adding new tests:

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Mock Dependencies**: For unit tests, use mocks to isolate the unit being tested
3. **Test Edge Cases**: Include tests for error conditions and edge cases
4. **Descriptive Names**: Use clear, descriptive test names
5. **Setup/Teardown**: Use `beforeEach` and `afterEach` for proper test isolation

## Coverage Goals

The project aims for:
- 60% statement coverage
- 60% branch coverage
- 60% function coverage
- 60% line coverage

We're making good progress with unit and integration tests, but there are still areas to cover.

## Next Steps

Priority areas for adding tests:

1. ~~Place-related functionality (creation, searching, updating)~~ DONE
2. Booking flow
3. ~~Location and search features~~ DONE
4. Authentication middleware
5. Error handling across controllers
6. ~~Review functionality~~ DONE
7. ~~Integration tests for API endpoints~~ DONE
8. ~~Property updating functionality~~ DONE
9. Property deletion functionality
10. More comprehensive integration test flows
11. Add tests for message functionality

 
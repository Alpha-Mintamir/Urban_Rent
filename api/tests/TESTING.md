# Urban Rent API Testing Strategy

This document outlines the testing approach for the Urban Rent API, focusing on unit testing.

## Testing Setup

We've implemented a unit testing framework with Jest, including:

1. Test directory structure:
   ```
   /api/tests/
   ├── setup.js               # Global test setup and mocks
   ├── TESTING.md             # This documentation file
   ├── unit/                  # Unit tests
   │   ├── models/            # Model tests
   │   ├── controllers/       # Controller tests
   │   └── utils/             # Utility function tests
   ```

2. Configuration:
   - Jest configuration in `jest.config.js`
   - Environment variables and mocks in `setup.js`
   - Test coverage reporting

## Current Test Coverage

We've started with unit tests for core components:

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

## Running Tests

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Extending Test Coverage

To improve test coverage:

1. **Add Model Tests**:
   - Implement tests for `Booking` and other models
   - Follow the pattern in `User.test.js`

2. **Add Controller Tests**:
   - Implement tests for `bookingController`, etc.
   - Follow the pattern in `userController.test.js`

3. **Add Integration Tests**:
   - Create an `integration` directory to test API endpoints
   - Use supertest for HTTP request testing

## Mocking Strategy

Our tests use Jest's mocking capabilities:

1. **Database Mocking**:
   - Sequelize is mocked to prevent actual database connections
   - Models are mocked with Jest mock functions

2. **External Service Mocking**:
   - JWT generation is mocked
   - Bcrypt password hashing is mocked
   - Cloudinary file upload is mocked

## Best Practices

When adding new tests:

1. **Isolate Tests**: Each test should be independent and not rely on other tests
2. **Mock Dependencies**: Use mocks to isolate the unit being tested
3. **Test Edge Cases**: Include tests for error conditions and edge cases
4. **Descriptive Names**: Use clear, descriptive test names
5. **Setup/Teardown**: Use `beforeEach` and `afterEach` for proper test isolation

## Coverage Goals

The project aims for:
- 60% statement coverage
- 60% branch coverage
- 60% function coverage
- 60% line coverage

Current coverage is lower because we've just started implementing tests. As more tests are added, coverage will increase.

## Next Steps

Priority areas for adding tests:

1. ~~Place-related functionality (creation, searching, updating)~~ DONE
2. Booking flow
3. ~~Location and search features~~ DONE
4. Authentication middleware
5. Error handling across controllers
6. ~~Review functionality~~ DONE
7. Integration tests for API endpoints
8. ~~Property updating functionality~~ DONE
9. Property deletion functionality

## Additional Notes

- The original code block mentioned "Review functionality" as a priority area for adding tests. However, this functionality is already covered by the existing review model and controller tests.
- The original code block mentioned "Property updating and deletion functionality" as a priority area for adding tests. However, this functionality is not mentioned in the current test coverage or next steps.
- The original code block mentioned "Place-related functionality" as a priority area for adding tests, but this functionality is already covered by the existing place model and controller tests.
- The original code block mentioned "Location and search features" as a priority area for adding tests, but this functionality is already covered by the existing location model and controller tests.

Therefore, the next steps section has been updated to reflect the current test coverage and the additional functionality that needs to be tested. 
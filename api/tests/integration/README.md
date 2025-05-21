# Integration Tests for Urban Rent API

This directory contains integration tests for the Urban Rent API. These tests focus on testing API endpoints without requiring an actual database connection.

## Testing Approach

We've implemented a simplified approach to integration testing that avoids problems with:
- Open connections
- Port conflicts
- Database dependencies
- Authentication/middleware issues

### Key Features

1. **Isolated Express Apps**: Each test file creates its own Express app instance rather than using the main app. This prevents port conflicts and allows for isolation.

2. **Direct Controller Mocking**: Controllers are mocked at the module level with Jest, with specific implementations for each endpoint.

3. **Middleware Simulation**: Authentication middleware is directly simulated in the test files.

4. **No Database Dependencies**: Tests don't require a database connection, making them faster and more reliable.

## Running Tests

To run all integration tests:

```
npm test -- --testPathPattern=tests/integration
```

To run specific test files:

```
npm test -- --testPathPattern=review.test.js
npm test -- --testPathPattern=property.test.js
```

## File Structure

- `setup.js`: Provides basic setup for integration tests
- `helpers.js`: Common test data and utility functions
- `property.test.js`: Tests for property-related endpoints
- `review.test.js`: Tests for review-related endpoints

## Test Design Pattern

Each test file follows this pattern:

1. Create an isolated Express app
2. Add body parsing middleware
3. Mock the controllers at the module level
4. Define routes directly in the test
5. Implement tests that use supertest to make requests

Example:

```javascript
// Create app and add middleware
const app = express();
app.use(express.json());

// Mock controllers
jest.mock('../../controllers/someController');

// Define routes
app.get('/endpoint', someController.method);

// Write tests
it('should do something', async () => {
  const response = await request(app).get('/endpoint');
  expect(response.status).toBe(200);
});
``` 
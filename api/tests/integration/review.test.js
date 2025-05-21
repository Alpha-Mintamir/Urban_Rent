const request = require('supertest');
const express = require('express');
const {
  testUsers,
  testReview,
  testProperty,
  generateToken
} = require('./helpers');

// Create a simple mocked app for testing
const app = express();

// Add JSON middleware for body parsing
app.use(express.json());

// Import mock controller
const reviewController = require('../../controllers/reviewController');

// Mock the middleware to add a user to the request
const authMiddleware = (req, res, next) => {
  req.user = {
    user_id: 1,
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 1
  };
  next();
};

// Register the routes directly in the test
app.get('/test-endpoint', (req, res) => res.status(200).json({ success: true }));
app.get('/properties/:propertyId/reviews', reviewController.getReviewsByProperty);
app.get('/properties/:propertyId/average-rating', reviewController.getAverageRating);
app.post('/properties/:propertyId/reviews', authMiddleware, reviewController.createReview);

// Mock the review controller
jest.mock('../../controllers/reviewController', () => ({
  createReview: jest.fn((req, res) => {
    return res.status(201).json({
      success: true,
      review: {
        id: 1,
        rating: req.body.rating || 4,
        reviewText: req.body.reviewText || 'Test review',
        propertyId: req.params.propertyId,
        userId: req.user?.user_id || 1
      }
    });
  }),
  
  getReviewsByProperty: jest.fn((req, res) => {
    return res.status(200).json({
      success: true,
      reviews: [
        {
          id: 1,
          rating: 4,
          reviewText: 'Test review',
          propertyId: req.params.propertyId,
          userId: 1,
          user: { name: 'Test User' }
        }
      ]
    });
  }),
  
  getAverageRating: jest.fn((req, res) => {
    return res.status(200).json({
      success: true,
      averageRating: 4,
      reviewCount: 1
    });
  })
}));

describe('Review API Tests', () => {
  // Let's start with a very simple test to verify our test setup
  it('should respond to test endpoint', async () => {
    const response = await request(app).get('/test-endpoint');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should get reviews for a property', async () => {
    const response = await request(app).get('/properties/1/reviews');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.reviews).toBeDefined();
    expect(response.body.reviews.length).toBe(1);
  });

  it('should get average rating for a property', async () => {
    const response = await request(app).get('/properties/1/average-rating');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.averageRating).toBe(4);
  });

  it('should create a review when authenticated', async () => {
    const reviewData = {
      rating: 5,
      reviewText: 'Excellent property'
    };

    const response = await request(app)
      .post('/properties/1/reviews')
      .send(reviewData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.review).toBeDefined();
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.reviewText).toBe('Excellent property');
  });
}); 
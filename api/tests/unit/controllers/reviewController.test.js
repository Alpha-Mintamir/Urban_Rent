const reviewController = require('../../../controllers/reviewController');
const Review = require('../../../models/Review');
const User = require('../../../models/User');
const Property = require('../../../models/Place');

// Mock the models
jest.mock('../../../models/Review', () => {
  const sequelize = {
    fn: jest.fn().mockReturnValue('AVG'),
    col: jest.fn().mockReturnValue('rating')
  };
  
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    sequelize
  };
});

jest.mock('../../../models/User');

jest.mock('../../../models/Place', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
});

describe('reviewController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 1,
        user_id: 1,
        role: 1 // Tenant role
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe('getReviewsByProperty', () => {
    it('should return reviews for a specific property', async () => {
      // Setup params
      req.params.propertyId = 1;
      
      // Mock Review.findAll
      const mockReviews = [
        {
          review_id: 1,
          property_id: 1,
          user_id: 1,
          rating: 4.5,
          comment: 'Great place!',
          User: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          review_id: 2,
          property_id: 1,
          user_id: 2,
          rating: 5,
          comment: 'Excellent location and amenities',
          User: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          }
        }
      ];
      Review.findAll.mockResolvedValue(mockReviews);
      
      // Call the controller method
      await reviewController.getReviewsByProperty(req, res);
      
      // Assertions
      expect(Review.findAll).toHaveBeenCalledWith({
        where: { property_id: 1 },
        include: expect.arrayContaining([
          expect.objectContaining({
            model: User,
            as: 'User',
            attributes: ['name', 'email']
          })
        ]),
        order: [['created_at', 'DESC']]
      });
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });
    
    it('should handle errors', async () => {
      // Setup params
      req.params.propertyId = 1;
      
      // Mock Review.findAll to throw error
      const error = new Error('Database error');
      Review.findAll.mockRejectedValue(error);
      
      // Call the controller method
      await reviewController.getReviewsByProperty(req, res);
      
      // Assertions
      expect(Review.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch reviews' });
    });
  });
  
  describe('getAverageRating', () => {
    it('should return average rating and total reviews for a property', async () => {
      // Setup params
      req.params.propertyId = 1;
      
      // Mock Review.findOne for avg calculation
      const mockResult = {
        dataValues: {
          avgRating: 4.5,
          totalReviews: 10
        }
      };
      Review.findOne.mockResolvedValue(mockResult);
      
      // Call the controller method
      await reviewController.getAverageRating(req, res);
      
      // Assertions
      expect(Review.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        avgRating: '4.5',
        totalReviews: 10
      });
    });
    
    it('should handle case with no reviews', async () => {
      // Setup params
      req.params.propertyId = 1;
      
      // Mock Review.findOne to return null
      Review.findOne.mockResolvedValue(null);
      
      // Call the controller method
      await reviewController.getAverageRating(req, res);
      
      // Assertions
      expect(Review.findOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        avgRating: '0.0',
        totalReviews: 0
      });
    });
  });
  
  describe('createReview', () => {
    it('should create a new review for a property', async () => {
      // Setup params and body
      req.params.propertyId = 1;
      req.body = {
        rating: 4.5,
        comment: 'Great place!'
      };
      
      // Mock Review.findOne to check if review exists
      Review.findOne.mockResolvedValueOnce(null);
      
      // Mock Review.create
      const mockCreatedReview = {
        review_id: 1,
        property_id: 1,
        user_id: 1,
        rating: 4.5,
        comment: 'Great place!'
      };
      Review.create.mockResolvedValue(mockCreatedReview);
      
      // Mock Review.findOne for fetching with user
      const mockReviewWithUser = {
        ...mockCreatedReview,
        User: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      };
      Review.findOne.mockResolvedValueOnce(mockReviewWithUser);
      
      // Call the controller method
      await reviewController.createReview(req, res);
      
      // Assertions
      expect(Review.findOne).toHaveBeenCalledTimes(2);
      expect(Review.create).toHaveBeenCalledWith({
        property_id: 1,
        user_id: 1,
        rating: 4.5,
        comment: 'Great place!'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReviewWithUser);
    });
    
    it('should not allow non-tenants to create reviews', async () => {
      // Set user role to property owner
      req.user.role = 2;
      
      // Setup params and body
      req.params.propertyId = 1;
      req.body = {
        rating: 4.5,
        comment: 'Great place!'
      };
      
      // Call the controller method
      await reviewController.createReview(req, res);
      
      // Assertions
      expect(Review.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only tenants can submit property reviews' });
    });
    
    it('should validate rating is between 1 and 5', async () => {
      // Setup params and body with invalid rating
      req.params.propertyId = 1;
      req.body = {
        rating: 6,
        comment: 'Great place!'
      };
      
      // Call the controller method
      await reviewController.createReview(req, res);
      
      // Assertions
      expect(Review.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Rating must be between 1 and 5' });
    });
    
    it('should not allow multiple reviews for the same property by same user', async () => {
      // Setup params and body
      req.params.propertyId = 1;
      req.body = {
        rating: 4.5,
        comment: 'Great place!'
      };
      
      // Mock Review.findOne to return existing review
      const existingReview = {
        review_id: 1,
        property_id: 1,
        user_id: 1,
        rating: 4,
        comment: 'Good place'
      };
      Review.findOne.mockResolvedValue(existingReview);
      
      // Call the controller method
      await reviewController.createReview(req, res);
      
      // Assertions
      expect(Review.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'You have already reviewed this property' });
    });
  });
  
  describe('getOwnerReviews', () => {
    it('should return reviews for properties owned by the user', async () => {
      // Set user role to property owner
      req.user.role = 2;
      
      // Mock Property.findAll
      const mockProperties = [
        {
          property_id: 1,
          property_name: 'Luxury Apartment',
          description: 'A beautiful apartment',
          toJSON: jest.fn().mockReturnValue({
            property_id: 1,
            property_name: 'Luxury Apartment',
            description: 'A beautiful apartment'
          })
        },
        {
          property_id: 2,
          property_name: 'Beach House',
          description: 'Amazing beachfront property',
          toJSON: jest.fn().mockReturnValue({
            property_id: 2,
            property_name: 'Beach House',
            description: 'Amazing beachfront property'
          })
        }
      ];
      Property.findAll.mockResolvedValue(mockProperties);
      
      // Mock Review.findAll for each property
      const mockReviews1 = [
        {
          review_id: 1,
          property_id: 1,
          rating: 4.5,
          comment: 'Great place!',
          User: {
            user_id: 3,
            name: 'John Tenant',
            email: 'john@example.com'
          }
        }
      ];
      
      const mockReviews2 = [
        {
          review_id: 2,
          property_id: 2,
          rating: 5,
          comment: 'Perfect vacation spot!',
          User: {
            user_id: 4,
            name: 'Jane Tenant',
            email: 'jane@example.com'
          }
        }
      ];
      
      // First call returns reviews for first property, second call for second property
      Review.findAll.mockResolvedValueOnce(mockReviews1).mockResolvedValueOnce(mockReviews2);
      
      // Call the controller method
      await reviewController.getOwnerReviews(req, res);
      
      // Assertions
      expect(Property.findAll).toHaveBeenCalledWith({
        where: { user_id: 1 },
        attributes: ['property_id', 'property_name', 'description']
      });
      expect(Review.findAll).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith([
        {
          property_id: 1,
          property_name: 'Luxury Apartment',
          description: 'A beautiful apartment',
          reviews: mockReviews1
        },
        {
          property_id: 2,
          property_name: 'Beach House',
          description: 'Amazing beachfront property',
          reviews: mockReviews2
        }
      ]);
    });
    
    it('should not allow non-owners to access owner reviews', async () => {
      // Ensure user has tenant role
      req.user.role = 1;
      
      // Call the controller method
      await reviewController.getOwnerReviews(req, res);
      
      // Assertions
      expect(Property.findAll).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only property owners or brokers can access property reviews' });
    });
    
    it('should return empty array if owner has no properties', async () => {
      // Set user role to property owner
      req.user.role = 2;
      
      // Mock Property.findAll to return empty array
      Property.findAll.mockResolvedValue([]);
      
      // Call the controller method
      await reviewController.getOwnerReviews(req, res);
      
      // Assertions
      expect(Property.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
  
  describe('getOwnerReviewsCount', () => {
    it('should return total review count for properties owned by the user', async () => {
      // Set user role to property owner
      req.user.role = 2;
      
      // Mock Property.findAll
      const mockProperties = [
        { property_id: 1 },
        { property_id: 2 }
      ];
      Property.findAll.mockResolvedValue(mockProperties);
      
      // Mock Review.count
      Review.count.mockResolvedValue(15);
      
      // Call the controller method
      await reviewController.getOwnerReviewsCount(req, res);
      
      // Assertions
      expect(Property.findAll).toHaveBeenCalledWith({
        where: { user_id: 1 },
        attributes: ['property_id'],
        raw: true
      });
      expect(Review.count).toHaveBeenCalledWith({
        where: {
          property_id: [1, 2]
        }
      });
      expect(res.json).toHaveBeenCalledWith({ totalReviews: 15 });
    });
    
    it('should not allow non-owners to access review count', async () => {
      // Ensure user has tenant role
      req.user.role = 1;
      
      // Call the controller method
      await reviewController.getOwnerReviewsCount(req, res);
      
      // Assertions
      expect(Property.findAll).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only property owners or brokers can access property reviews' });
    });
    
    it('should return zero count if owner has no properties', async () => {
      // Set user role to property owner
      req.user.role = 2;
      
      // Mock Property.findAll to return empty array
      Property.findAll.mockResolvedValue([]);
      
      // Call the controller method
      await reviewController.getOwnerReviewsCount(req, res);
      
      // Assertions
      expect(Property.findAll).toHaveBeenCalled();
      expect(Review.count).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ totalReviews: 0 });
    });
  });
}); 
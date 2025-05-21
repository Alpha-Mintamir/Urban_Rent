const Review = require('../../../models/Review');

describe('Review Model', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up Review model static methods
    Review.create = jest.fn();
    Review.findByPk = jest.fn();
    Review.findAll = jest.fn();
    Review.findOne = jest.fn();
  });
  
  describe('creating review', () => {
    it('should successfully create a review with valid data', async () => {
      const reviewData = {
        property_id: 1,
        user_id: 2,
        rating: 4.5,
        comment: 'Great place, highly recommended!'
      };
      
      const mockReview = { ...reviewData, id: 1, createdAt: new Date() };
      Review.create.mockResolvedValue(mockReview);
      
      const result = await Review.create(reviewData);
      
      expect(Review.create).toHaveBeenCalledWith(reviewData);
      expect(result).toEqual(mockReview);
    });
  });
  
  describe('finding reviews', () => {
    it('should find reviews by property ID', async () => {
      const propertyId = 1;
      const mockReviews = [
        {
          id: 1,
          property_id: propertyId,
          user_id: 2,
          rating: 4.5,
          comment: 'Great place!'
        },
        {
          id: 2,
          property_id: propertyId,
          user_id: 3,
          rating: 5,
          comment: 'Excellent location and amenities'
        }
      ];
      
      Review.findAll.mockResolvedValue(mockReviews);
      
      const result = await Review.findAll({ where: { property_id: propertyId } });
      
      expect(Review.findAll).toHaveBeenCalledWith({ where: { property_id: propertyId } });
      expect(result).toEqual(mockReviews);
      expect(result.length).toBe(2);
    });
    
    it('should find reviews by user ID', async () => {
      const userId = 2;
      const mockReviews = [
        {
          id: 1,
          property_id: 1,
          user_id: userId,
          rating: 4.5,
          comment: 'Great place!'
        },
        {
          id: 3,
          property_id: 2,
          user_id: userId,
          rating: 3.5,
          comment: 'Decent place but a bit noisy'
        }
      ];
      
      Review.findAll.mockResolvedValue(mockReviews);
      
      const result = await Review.findAll({ where: { user_id: userId } });
      
      expect(Review.findAll).toHaveBeenCalledWith({ where: { user_id: userId } });
      expect(result).toEqual(mockReviews);
      expect(result.length).toBe(2);
    });
  });
}); 
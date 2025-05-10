const Review = require('../models/Review');
const User = require('../models/User');
const Property = require('../models/Place');

// Get all reviews for a property
exports.getReviewsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.findAll({
      where: { property_id: propertyId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get average rating for a property
exports.getAverageRating = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const result = await Review.findOne({
      where: { property_id: propertyId },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('review_id')), 'totalReviews']
      ]
    });

    res.json({
      avgRating: Number(result?.dataValues.avgRating || 0).toFixed(1),
      totalReviews: Number(result?.dataValues.totalReviews || 0)
    });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ message: 'Failed to calculate average rating' });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    // Fix: Support both id and user_id formats in the auth token
    const userId = req.user.id || req.user.user_id;
    
    console.log('User attempting to create review:', req.user);
    console.log('User ID used for review:', userId);
    
    // Ensure we have a valid user ID
    if (!userId) {
      console.error('Missing user ID in auth token', req.user);
      return res.status(400).json({ message: 'Invalid user information' });
    }
    
    // Check if user is a tenant (role === 1)
    if (req.user.role !== 1) {
      return res.status(403).json({ message: 'Only tenants can submit property reviews' });
    }

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this property
    const existingReview = await Review.findOne({
      where: {
        property_id: propertyId,
        user_id: userId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    // Create the review
    const review = await Review.create({
      property_id: propertyId,
      user_id: userId,
      rating,
      comment: comment || null // Make comment optional
    });

    // Fetch the created review with user details
    const reviewWithUser = await Review.findOne({
      where: { review_id: review.review_id },
      include: [{
        model: User,
        as: 'User',
        attributes: ['name', 'email']
      }]
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
};

// Get all reviews for properties owned by the logged-in user
exports.getOwnerReviews = async (req, res) => {
  try {
    // Check if user is a property owner (role 2) or broker (role 3)
    if (req.user.role !== 2 && req.user.role !== 3) {
      return res.status(403).json({ message: 'Only property owners or brokers can access property reviews' });
    }
    
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Fetch all properties owned by the user
    const properties = await Property.findAll({
      where: { user_id: userId },
      attributes: ['property_id', 'property_name', 'description'], // Add any other property details you want
    });

    if (!properties || properties.length === 0) {
      return res.json([]); // No properties found for this owner
    }

    // Fetch reviews for each property
    const propertiesWithReviews = await Promise.all(
      properties.map(async (property) => {
        const reviews = await Review.findAll({
          where: { property_id: property.property_id },
          include: [{
            model: User,
            as: 'User',
            attributes: ['user_id', 'name', 'email'] // Specify user attributes you need for the reviewer
          }],
          order: [['created_at', 'DESC']]
        });
        return {
          ...property.toJSON(), // Spread property attributes
          reviews
        };
      })
    );

    res.json(propertiesWithReviews);

  } catch (error) {
    console.error('Error fetching owner reviews:', error);
    res.status(500).json({ message: 'Failed to fetch owner reviews' });
  }
};

// Get total review count for properties owned by the logged-in user
exports.getOwnerReviewsCount = async (req, res) => {
  try {
    // Check if user is a property owner (role 2) or broker (role 3)
    if (req.user.role !== 2 && req.user.role !== 3) {
      return res.status(403).json({ message: 'Only property owners or brokers can access property reviews' });
    }
    
    const userId = req.user.id || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Fetch all properties owned by the user to get their IDs
    const properties = await Property.findAll({
      where: { user_id: userId },
      attributes: ['property_id'], // Only need property_id
      raw: true // Get plain objects
    });

    if (!properties || properties.length === 0) {
      return res.json({ totalReviews: 0 }); // No properties, so no reviews
    }

    const propertyIds = properties.map(p => p.property_id);

    // Count reviews for these property IDs
    const totalReviews = await Review.count({
      where: {
        property_id: propertyIds // Sequelize will use IN (id1, id2, ...)
      }
    });

    res.json({ totalReviews });

  } catch (error) {
    console.error('Error fetching owner reviews count:', error);
    res.status(500).json({ message: 'Failed to fetch owner reviews count' });
  }
};

const { SavedProperty, Property, User, Location, Photo } = require('../models');
const asyncHandler = require('../middleware/asyncHandler'); // Assuming you have an asyncHandler utility

// @desc    Save or Unsave a property for a user (toggle)
// @route   POST /api/saved-properties
// @access  Private (Tenant)
exports.saveOrUnsaveProperty = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.body;
  const userId = req.user.id; // Assuming auth middleware sets req.user

  if (!propertyId) {
    return res.status(400).json({ success: false, message: 'Property ID is required' });
  }

  // Check if the property exists
  const property = await Property.findByPk(propertyId);
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const existingSavedProperty = await SavedProperty.findOne({
    where: { userId, propertyId },
  });

  if (existingSavedProperty) {
    // Property is already saved, so unsave it
    await existingSavedProperty.destroy();
    res.status(200).json({ success: true, message: 'Property unsaved successfully', saved: false });
  } else {
    // Property is not saved, so save it
    await SavedProperty.create({ userId, propertyId });
    res.status(201).json({ success: true, message: 'Property saved successfully', saved: true });
  }
});

// @desc    Get all saved properties for the current user
// @route   GET /api/saved-properties
// @access  Private (Tenant)
exports.getSavedProperties = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const savedEntries = await SavedProperty.findAll({
    where: { userId },
    include: [
      {
        model: Property,
        include: [ // Nested include for Property's associations
          {
            model: Location, // Assuming Location model is imported
            as: 'location' // This alias must match the one in Property.belongsTo(Location, { as: 'location' })
          },
          {
            model: Photo,    // Assuming Photo model is imported
            as: 'photos'  // This alias must match the one in Property.hasMany(Photo, { as: 'photos' })
          }
        ]
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Extract just the property details from the saved entries
  // Accessing entry.Property (capitalized) assumes 'Property' is the target model's name
  const savedProperties = savedEntries.map(entry => entry.Property).filter(p => p != null); 

  res.status(200).json({
    success: true,
    count: savedProperties.length,
    data: savedProperties,
  });
});

// @desc    Check if a property is saved by the current user
// @route   GET /api/saved-properties/:propertyId/status
// @access  Private (Tenant)
exports.getSavedPropertyStatus = asyncHandler(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user.id;

  const savedProperty = await SavedProperty.findOne({
    where: { userId, propertyId },
  });

  if (savedProperty) {
    res.status(200).json({ success: true, saved: true });
  } else {
    res.status(200).json({ success: true, saved: false });
  }
}); 
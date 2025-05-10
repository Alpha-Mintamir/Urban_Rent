const Place = require('../models/Place');
const Location = require('../models/Location');
const Perk = require('../models/Perk');
const Photo = require('../models/photo');
const { Op } = require('sequelize');

// Adds a place in the DB
exports.addPlace = async (req, res) => {
  try {
    // Get user data from the request or from the request body
    let user_id;
    
    // First check if user_id is provided in the request body (from client)
    if (req.body.user_id) {
      user_id = parseInt(req.body.user_id);
      console.log('Using user_id from request body:', user_id);
    } 
    // If not, try to get it from the authenticated user in the request
    else if (req.user && req.user.id) {
      user_id = parseInt(req.user.id);
      console.log('Using user_id from authenticated user:', user_id);
    } 
    // If still no user_id, return an error
    else {
      console.error('User ID missing from both request body and authentication');
      return res.status(401).json({
        message: 'User authentication failed. Please log in again.'
      });
    }
    
    // Check if the user exists in the users table
    const User = require('../models/User');
    
    // Verify the user exists
    const user = await User.findByPk(user_id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'The specified user does not exist'
      });
    }
    
    // Check if the user has role 2 (property owner) or role 3 (broker)
    if (user.role !== 2 && user.role !== 3) {
      return res.status(403).json({
        message: 'User is not authorized to create properties',
        error: 'Only property owners or brokers can create properties'
      });
    }
    
    // Check if the user exists in the propertyowner table
    const PropertyOwner = require('../models/PropertyOwner');
    let propertyOwner = await PropertyOwner.findByPk(user_id);
    
    // If the user doesn't exist in the propertyowner table, create an entry
    if (!propertyOwner) {
      try {
        propertyOwner = await PropertyOwner.create({
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          password: user.password, // This should be hashed already
          picture: user.picture,
          phone: user.phone,
          role: user.role
        });
        console.log(`Created property owner entry for user ${user_id}`);
      } catch (error) {
        console.error('Error creating property owner entry:', error);
        return res.status(500).json({
          message: 'Failed to create property owner entry',
          error: error.message
        });
      }
    }
    
    console.log(`Verified user ${user_id} exists and has property owner role`);
    
    const {
      property_name,
      description,
      extra_info,
      max_guests,
      price,
      perks,
      photos,
      location,
      property_type,
      bedrooms,
      bathrooms
    } = req.body;
    
    console.log('Received property data:', {
      ...req.body,
      user_id // Include the resolved user_id
    });
    
    // First, create the location if provided
    let locationId = null;
    if (location) {
      try {
        const Location = require('../models/Location');
        
        // Generate a unique house_no by combining user_id and timestamp
        const uniqueHouseNo = `${user_id}_${Date.now()}`;
        
        // Map the frontend location field names to the database field names
        const locationData = {
          sub_city: location.kifleKetema || location.sub_city,
          woreda: location.wereda || location.wereda,
          kebele: location.kebele,
          house_no: uniqueHouseNo,
          area_name: location.areaName || location.area_name
        };
        
        console.log('Creating location with data:', locationData);
        
        // Create a new location entry for the property
        const newLocation = await Location.create(locationData);
        
        console.log('Location created successfully:', newLocation.toJSON());
        locationId = uniqueHouseNo;  // Use the house_no as the locationId
      } catch (locationError) {
        console.error('Error creating location:', locationError);
        return res.status(500).json({
          message: 'Failed to create location',
          error: locationError.message
        });
      }
    } else {
      return res.status(400).json({
        message: 'Location data is required',
        error: 'No location data provided'
      });
    }
    
    // Create the property with explicit values for all required fields
    const propertyData = {
      user_id: parseInt(user_id), // Ensure it's an integer
      property_name: req.body.property_name,
      property_type: req.body.property_type || null,
      description: req.body.description,
      extra_info: req.body.extra_info,
      max_guests: req.body.max_guests ? parseInt(req.body.max_guests) : 1,
      bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : null,
      bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : null,
      price: req.body.price ? parseFloat(req.body.price) : 0,
      location_id: locationId,
      is_broker_listing: user.role === 3, // Set to true if the user is a broker
    };
    
    console.log('Creating property with data:', propertyData);
    
    // Create the place with the correct field names
    try {
      const place = await Place.create(propertyData);
      console.log('Place created successfully:', place.toJSON());
      
      // Handle perks if provided
      if (perks && perks.length > 0) {
        const Perk = require('../models/Perk');
        await Perk.addPerks(place.property_id, perks);
        console.log('Perks added successfully');
      }
      
      // Handle photos if provided
      if (photos && photos.length > 0) {
        console.log('Processing photos:', photos.length);
        const Photo = require('../models/photo');
        await Photo.addPhotos(place.property_id, photos);
        console.log('Photos added successfully');
      }
      
      res.status(200).json({
        place: place.toJSON(),
        message: 'Property added successfully'
      });
    } catch (createError) {
      console.error('Error creating property:', createError);
      
      // Check if it's a foreign key constraint error
      if (createError.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
          message: 'Failed to create property: Invalid user ID or location ID',
          error: 'Foreign key constraint violation'
        });
      }
      
      throw createError; // Re-throw for the outer catch block
    }
    
    // Response is now handled in the inner try-catch block
  } catch (err) {
    console.error('Error adding place:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Returns user specific places
exports.userPlaces = async (req, res) => {
  try {
    // Get user data from the request
    const userData = req.user;
    
    if (!userData || !userData.id) {
      console.error('User not authenticated or missing ID');
      return res.status(401).json({
        message: 'User authentication required',
        error: 'No authenticated user found'
      });
    }
    
    const id = userData.id;
    console.log('Fetching places for user ID:', id);
    
    // Log the user object for debugging
    console.log('User object:', JSON.stringify(userData, null, 2));
    
    // Use Sequelize syntax instead of MongoDB syntax
    const places = await Place.findAll({
      where: { user_id: id },
      include: [
        {
          model: require('../models/Location'),
          as: 'location',
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ]
    });
    
    console.log(`Found ${places.length} places for user ID ${id}`);
    
    // Log each property for debugging
    places.forEach((place, index) => {
      console.log(`Property ${index + 1}:`, place.property_id, place.property_name, 'user_id:', place.user_id);
    });
    
    res.status(200).json(places);
  } catch (err) {
    console.error('Error fetching user places:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Updates a place
exports.updatePlace = async (req, res) => {
  try {
    const {
      id,
      property_name,
      property_type,
      description,
      extra_info,
      max_guests,
      bedrooms,
      bathrooms,
      price,
      perks,
      photos,
      location: locationDataInput
    } = req.body;

    console.log(`Update request for property ID: ${id} with data:`, req.body);

    const place = await Place.findByPk(id);

    if (!place) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Authorization: Check if the logged-in user owns the property or is an admin/broker
    // This depends on how your req.user is structured and your authorization rules
    // For example: if (req.user.id !== place.user_id && req.user.role !== 'admin') { ... }

    // Update direct fields
    place.property_name = req.body.property_name ?? place.property_name;
    place.property_type = req.body.property_type ?? place.property_type;
    place.description = req.body.description ?? place.description;
    place.extra_info = req.body.extra_info ?? place.extra_info;
    place.max_guests = req.body.max_guests ? parseInt(req.body.max_guests) : place.max_guests;
    place.bedrooms = req.body.bedrooms ? parseInt(req.body.bedrooms) : place.bedrooms;
    place.bathrooms = req.body.bathrooms ? parseInt(req.body.bathrooms) : place.bathrooms;
    place.price = req.body.price ? parseFloat(req.body.price) : place.price;

    // Update location if provided, otherwise keep existing location
    if (locationDataInput && place.location_id) {
      const Location = require('../models/Location');
      const existingLocation = await Location.findOne({ where: { house_no: place.location_id } });
      if (existingLocation) {
        existingLocation.sub_city = locationDataInput.kifleKetema || locationDataInput.sub_city || existingLocation.sub_city;
        existingLocation.woreda = locationDataInput.wereda || locationDataInput.woreda || existingLocation.woreda;
        existingLocation.kebele = locationDataInput.kebele || existingLocation.kebele;
        existingLocation.area_name = locationDataInput.areaName || locationDataInput.area_name || existingLocation.area_name;
        // Note: house_no is the PK and likely shouldn't be updated directly here unless it's a new system.
        // If house_no needs to change, it might imply a new location record.
        await existingLocation.save();
        console.log('Location updated successfully for house_no:', place.location_id);
      } else {
        console.warn(`Location record not found for house_no (location_id): ${place.location_id}. Cannot update location.`);
        // Optionally, create a new location if it's missing, though this might indicate data inconsistency.
      }
    } else if (locationDataInput && !place.location_id) {
      // Handle creating a new location if one wasn't associated before
      console.warn(`Property ID ${id} has no existing location_id. Consider creating a new location entry.`);
      // Code to create new location would be similar to addPlace
    } else {
      // No location data provided - this is a property-only update
      console.log(`Update for property ID ${id} does not include location changes.`);
    }

    await place.save();
    console.log('Property fields updated successfully:', place.toJSON());

    // Handle perks update (e.g., clear existing and add new)
    if (perks !== undefined) { // Check if perks array is provided (can be empty)
      const Perk = require('../models/Perk');
      await Perk.deletePerksByPropertyId(id); // Assuming such a method exists or needs to be created
      if (perks.length > 0) {
        await Perk.addPerks(id, perks);
      }
      console.log('Perks updated successfully');
    }

    // Handle photos update
    if (photos && Array.isArray(photos)) {
      const Photo = require('../models/photo');
      // Simple approach: Delete old photos and add new ones.
      // More complex logic might be needed for partial updates (add some, remove some).
      await Photo.deletePhotosByPropertyId(id); // Assuming such a method exists
      if (photos.length > 0) {
        await Photo.addPhotos(id, photos); // Assuming this handles an array of URLs or new photo data
      }
      console.log('Photos updated successfully');
    }

    res.status(200).json({
      place: place.toJSON(),
      message: 'Property updated successfully'
    });
  } catch (err) {
    console.error('Error updating place:', err);
    res.status(500).json({
      message: 'Internal server error during update',
      error: err.message || 'Unknown error'
    });
  }
};

// Get all places with filtering, sorting, and pagination
exports.getPlaces = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'property_id',
      sortOrder = 'DESC',
      priceMin,
      priceMax,
      propertyType,
      bedrooms,
      bathrooms,
      maxGuests,
      isBrokerListing,
      amenities,
      subCity,
      woreda,
      kebele,
      searchTerm,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [];

    // Basic Filters
    if (priceMin) whereClause.price = { ...whereClause.price, [Op.gte]: parseFloat(priceMin) };
    if (priceMax) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(priceMax) };
    if (propertyType) whereClause.property_type = propertyType;
    if (bedrooms) whereClause.bedrooms = parseInt(bedrooms);
    if (bathrooms) whereClause.bathrooms = parseInt(bathrooms);
    if (maxGuests) whereClause.max_guests = { [Op.gte]: parseInt(maxGuests) };
    if (isBrokerListing !== undefined) whereClause.is_broker_listing = (isBrokerListing === 'true');
    if (status) whereClause.status = status; // Filter by status (available, rented, maintenance)

    // Location based filtering
    const locationWhereClause = {};
    if (subCity) locationWhereClause.sub_city = subCity;
    if (woreda) locationWhereClause.woreda = woreda;
    if (kebele) locationWhereClause.kebele = kebele;

    if (Object.keys(locationWhereClause).length > 0) {
      includeClause.push({
        model: Location,
        as: 'location',
        where: locationWhereClause,
        required: true // Makes it an INNER JOIN for location filters
      });
    } else {
      includeClause.push({
        model: Location,
        as: 'location',
        required: false // LEFT JOIN if no specific location filters
      });
    }
    
    // Search Term Filter (on property_name, description, extra_info)
    if (searchTerm) {
      whereClause[Op.or] = [
        { property_name: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { extra_info: { [Op.like]: `%${searchTerm}%` } }
        // If you want to search in location fields directly on Property (if denormalized)
        // or if you want to add a more complex search across related tables,
        // this part might need adjustment or a separate search strategy.
      ];
    }

    // Base include for perks and photos (always include them)
    includeClause.push({ model: Perk, as: 'perks', attributes: ['perk'], required: false });
    includeClause.push({ model: Photo, as: 'photos', attributes: ['photo_url'], required: false });


    let placesResult;
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim()).filter(a => a);
      if (amenitiesArray.length > 0) {
        // Step 1: Find properties that have AT LEAST ONE of the selected perks (for DB efficiency)
        const propertiesWithAnyPerk = await Place.findAll({
          where: whereClause, // Apply other filters
          include: [
            ...includeClause.filter(inc => inc.as !== 'perks'), // Include other associations
            {
              model: Perk,
              as: 'perks',
              where: { perk: { [Op.in]: amenitiesArray } },
              attributes: ['perk'],
              required: true // INNER JOIN to get only properties with at least one of the perks
            }
          ],
          order: [[sortBy, sortOrder]],
          // Pagination will be applied after in-code filtering for "all perks"
        });

        // Step 2: In-code filtering to ensure properties have ALL selected perks
        const filteredPlaces = propertiesWithAnyPerk.filter(place => {
          const placePerks = place.perks ? place.perks.map(p => p.perk) : [];
          return amenitiesArray.every(requiredPerk => placePerks.includes(requiredPerk));
        });
        
        // Apply pagination to the in-code filtered results
        const paginatedPlaces = filteredPlaces.slice(offset, offset + parseInt(limit));
        placesResult = {
          count: filteredPlaces.length, // Total count matching all criteria
          rows: paginatedPlaces
        };

      } else { // No amenities specified, proceed with normal DB query
        placesResult = await Place.findAndCountAll({
          where: whereClause,
          include: includeClause,
          order: [[sortBy, sortOrder]],
          limit: parseInt(limit),
          offset: parseInt(offset),
          distinct: true // Added to help with count accuracy when using includes
        });
      }
    } else { // No amenities query param, fetch without perk-specific logic
      placesResult = await Place.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true // Added to help with count accuracy when using includes
      });
    }

    // console.log(`Returning ${placesResult.rows.length} places out of ${placesResult.count} total.`);
    
    return res.status(200).json({
      success: true,
      message: 'Properties fetched successfully',
      data: placesResult.rows,
      pagination: {
        totalItems: placesResult.count,
        totalPages: Math.ceil(placesResult.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });

  } catch (err) {
    console.error('Error fetching all places:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Returns single place, based on passed place id
exports.singlePlace = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching place with ID:', id);
    
    // Use Sequelize syntax instead of MongoDB syntax
    const place = await Place.findByPk(id, {
      include: [
        {
          model: require('../models/Location'),
          as: 'location',
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ]
    });
    
    if (!place) {
      console.log(`Place with ID ${id} not found`);
      return res.status(404).json({
        message: 'Place not found',
      });
    }
    
    console.log(`Found place with ID ${id}`);
    res.status(200).json(place);
  } catch (err) {
    console.error('Error fetching single place:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Returns single place by property_id for edit page
exports.singlePlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching place for edit with property_id:', id);
    
    // Use Sequelize syntax with property_id
    const place = await Place.findOne({
      where: { property_id: id },
      include: [
        {
          model: require('../models/Location'),
          as: 'location',
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ]
    });
    
    if (!place) {
      console.log(`Place with property_id ${id} not found`);
      return res.status(404).json({
        message: 'Place not found',
      });
    }
    
    console.log(`Found place with property_id ${id}`);
    res.status(200).json(place);
  } catch (err) {
    console.error('Error fetching single place by id:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Search Places in the DB
exports.searchPlaces = async (req, res) => {
  try {
    const searchword = req.params.key;
    console.log('Searching places with keyword:', searchword);
    
    const { Op } = require('sequelize');
    
    if (searchword === '') {
      // Return all places if no search term
      const allPlaces = await Place.findAll({
        include: [
          {
            model: require('../models/Location'),
            as: 'location',
            required: false
          },
          {
            model: require('../models/Perk'),
            as: 'perks',
            required: false
          },
          {
            model: require('../models/photo'),
            as: 'photos',
            required: false
          }
        ]
      });
      return res.status(200).json(allPlaces);
    }
    
    // Search in property_name, description, and location fields
    const searchMatches = await Place.findAll({
      where: {
        [Op.or]: [
          { property_name: { [Op.iLike]: `%${searchword}%` } },
          { description: { [Op.iLike]: `%${searchword}%` } }
        ]
      },
      include: [
        {
          model: require('../models/Location'),
          as: 'location',
          where: {
            [Op.or]: [
              { sub_city: { [Op.iLike]: `%${searchword}%` } },
              { area_name: { [Op.iLike]: `%${searchword}%` } }
            ]
          },
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ]
    });
    
    console.log(`Found ${searchMatches.length} matches for search term '${searchword}'`);
    res.status(200).json(searchMatches);
  } catch (err) {
    console.error('Error searching places:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
}

// Update property status (available/rented)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    if (!status || !['available', 'rented', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (available, rented, or maintenance)' });
    }
    
    const place = await Place.findByPk(id);
    
    if (!place) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Optional: Check if the user owns this property
    // if (req.user.id !== place.user_id) {
    //   return res.status(403).json({ message: 'Not authorized to update this property' });
    // }
    
    place.status = status;
    await place.save();
    
    res.status(200).json({
      success: true,
      message: `Property marked as ${status}`,
      place: place.toJSON()
    });
  } catch (err) {
    console.error('Error updating property status:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

// Delete a property permanently
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    const place = await Place.findByPk(id);
    
    if (!place) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Optional: Check if the user owns this property
    // if (req.user.id !== place.user_id) {
    //   return res.status(403).json({ message: 'Not authorized to delete this property' });
    // }
    
    // Delete associated perks
    await Perk.deletePerksByPropertyId(id);
    
    // Delete associated photos
    await Photo.deletePhotosByPropertyId(id);
    
    // Delete the property itself
    await place.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message || 'Unknown error'
    });
  }
};

/**
 * Get all properties - Admin only
 * @route GET /api/places/admin/properties
 * @access Private (Admin only)
 */
exports.getAllProperties = async (req, res) => {
  try {
    console.log('Getting all properties for admin...');
    const properties = await Place.findAll({
      include: [
        {
          model: require('../models/User'),
          as: 'owner',
          attributes: ['name', 'email']
        },
        {
          model: require('../models/Location'),
          as: 'location',
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${properties.length} properties`);
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      fullError: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Get property by ID - Admin only
 * @route GET /api/places/admin/properties/:id
 * @access Private (Admin only)
 */
exports.getPropertyById = async (req, res) => {
  try {
    console.log(`Getting property details for ID: ${req.params.id}`);
    const property = await Place.findByPk(req.params.id, {
      include: [
        {
          model: require('../models/User'),
          as: 'owner',
          attributes: ['name', 'email']
        },
        {
          model: require('../models/Location'),
          as: 'location',
          required: false
        },
        {
          model: require('../models/Perk'),
          as: 'perks',
          required: false
        },
        {
          model: require('../models/photo'),
          as: 'photos',
          required: false
        }
      ]
    });
    
    if (!property) {
      console.log(`Property not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Property not found' });
    }
    
    console.log(`Property found: ${property.property_name}`);
    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      fullError: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Delete property - Admin only
 * @route DELETE /api/places/admin/properties/:id
 * @access Private (Admin only)
 */
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Place.findByPk(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Delete associated perks
    await Perk.destroy({ where: { property_id: req.params.id } });
    
    // Delete associated photos
    await Photo.destroy({ where: { property_id: req.params.id } });
    
    // Delete the property itself
    await property.destroy();
    
    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
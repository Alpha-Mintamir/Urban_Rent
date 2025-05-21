const placeController = require('../../../controllers/placeController');
const Place = require('../../../models/Place');
const Location = require('../../../models/Location');
const Perk = require('../../../models/Perk');
const Photo = require('../../../models/photo');
const User = require('../../../models/User');
const PropertyOwner = require('../../../models/PropertyOwner');

// Mock the models properly with explicit function implementations
jest.mock('../../../models/Place', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
});

jest.mock('../../../models/Location', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
});

jest.mock('../../../models/Perk', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    addPerks: jest.fn(),
    deletePerksByPropertyId: jest.fn()
  };
});

jest.mock('../../../models/photo', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    addPhotos: jest.fn(),
    deletePhotosByPropertyId: jest.fn()
  };
});

jest.mock('../../../models/User', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
});

jest.mock('../../../models/PropertyOwner', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
});

describe('placeController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: {
        id: 1,
        role: 2 // Property owner role
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe('addPlace', () => {
    it('should successfully add a new property', async () => {
      // Setup request data
      req.body = {
        user_id: 1,
        property_name: 'Luxury Apartment',
        description: 'A beautiful apartment',
        property_type: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        extra_info: 'Near city center',
        max_guests: 4,
        price: 1500,
        perks: ['wifi', 'parking'],
        photos: ['photo1.jpg', 'photo2.jpg'],
        location: {
          kifleKetema: 'Bole',
          wereda: '05',
          kebele: '07',
          areaName: 'Gerji'
        }
      };
      
      // Mock User.findByPk
      const mockUser = {
        user_id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 2
      };
      User.findByPk.mockResolvedValue(mockUser);
      
      // Mock PropertyOwner.findByPk
      PropertyOwner.findByPk.mockResolvedValue({
        user_id: 1,
        name: 'John Doe'
      });
      
      // Mock Location.create
      const mockLocation = {
        sub_city: 'Bole',
        woreda: '05',
        kebele: '07',
        house_no: '1_timestamp',
        area_name: 'Gerji',
        toJSON: jest.fn().mockReturnValue({})
      };
      Location.create.mockResolvedValue(mockLocation);
      
      // Mock Place.create
      const mockPlace = {
        property_id: 1,
        user_id: 1,
        property_name: 'Luxury Apartment',
        price: 1500,
        location_id: '1_timestamp',
        toJSON: jest.fn().mockReturnValue({})
      };
      Place.create.mockResolvedValue(mockPlace);
      
      // Call the controller method
      await placeController.addPlace(req, res);
      
      // Assertions
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Remove user from req
      delete req.user;
      
      await placeController.addPlace(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User authentication failed. Please log in again.'
      }));
    });
    
    it('should return 403 if user is not authorized to create properties', async () => {
      // Set user role to non-property owner
      const mockUser = {
        user_id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 1 // Regular user role
      };
      User.findByPk.mockResolvedValue(mockUser);
      
      await placeController.addPlace(req, res);
      
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User is not authorized to create properties'
      }));
    });
  });
  
  describe('userPlaces', () => {
    it('should return places for authenticated user', async () => {
      // Set user data
      req.user = {
        id: 1,
        role: 2
      };
      
      // Mock Place.findAll
      const mockPlaces = [
        {
          property_id: 1,
          user_id: 1,
          property_name: 'Luxury Apartment',
          price: 1500
        },
        {
          property_id: 2,
          user_id: 1,
          property_name: 'Beach House',
          price: 2500
        }
      ];
      Place.findAll.mockResolvedValue(mockPlaces);
      
      await placeController.userPlaces(req, res);
      
      expect(Place.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Remove user from req
      delete req.user;
      
      await placeController.userPlaces(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User authentication required'
      }));
    });
  });
  
  describe('getPlaces', () => {
    it('should return paginated places with filters', async () => {
      // Setup query parameters
      req.query = {
        page: 1,
        limit: 10,
        priceMin: 1000,
        priceMax: 2000,
        propertyType: 'Apartment',
        sortBy: 'price',
        sortOrder: 'ASC'
      };
      
      // Mock Place.findAndCountAll
      const mockPlacesResult = {
        count: 2,
        rows: [
          {
            property_id: 1,
            property_name: 'Apartment 1',
            price: 1200,
            property_type: 'Apartment'
          },
          {
            property_id: 2,
            property_name: 'Apartment 2',
            price: 1800,
            property_type: 'Apartment'
          }
        ]
      };
      Place.findAndCountAll.mockResolvedValue(mockPlacesResult);
      
      await placeController.getPlaces(req, res);
      
      expect(Place.findAndCountAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('updatePlace', () => {
    it('should successfully update an existing property', async () => {
      // Setup request data
      req.body = {
        id: 1,
        property_name: 'Updated Apartment',
        description: 'An updated beautiful apartment',
        property_type: 'Luxury Apartment',
        bedrooms: 3,
        bathrooms: 2,
        price: 2000
      };
      
      // Mock Place.findByPk
      const mockPlace = {
        property_id: 1,
        user_id: 1,
        property_name: 'Luxury Apartment',
        description: 'A beautiful apartment',
        property_type: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        price: 1500,
        location_id: '1_timestamp',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          property_id: 1,
          user_id: 1,
          property_name: 'Updated Apartment',
          description: 'An updated beautiful apartment',
          property_type: 'Luxury Apartment',
          bedrooms: 3,
          bathrooms: 2,
          price: 2000,
          location_id: '1_timestamp'
        })
      };
      Place.findByPk.mockResolvedValue(mockPlace);
      
      await placeController.updatePlace(req, res);
      
      expect(Place.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if property is not found', async () => {
      // Setup request data
      req.body = {
        id: 999,
        property_name: 'Updated Apartment'
      };
      
      // Mock Place.findByPk to return null
      Place.findByPk.mockResolvedValue(null);
      
      await placeController.updatePlace(req, res);
      
      expect(Place.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Property not found'
      });
    });
    
    it('should handle errors properly', async () => {
      // Setup request data
      req.body = {
        id: 1,
        property_name: 'Updated Apartment'
      };
      
      // Mock Place.findByPk to throw an error
      const error = new Error('Database error');
      Place.findByPk.mockRejectedValue(error);
      
      await placeController.updatePlace(req, res);
      
      expect(Place.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
}); 
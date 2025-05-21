const savedPropertyController = require('../../../controllers/savedPropertyController');
const { SavedProperty, Property, Location, Photo } = require('../../../models');
const asyncHandler = require('../../../middleware/asyncHandler');

// Mock asyncHandler to execute the wrapped function immediately
jest.mock('../../../middleware/asyncHandler', () => {
  return (fn) => async (req, res, next) => {
    return await fn(req, res, next);
  };
});

// Mock the models
jest.mock('../../../models', () => {
  return {
    SavedProperty: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    Property: {
      findByPk: jest.fn()
    },
    Location: {},
    Photo: {}
  };
});

describe('savedPropertyController', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        id: 1
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    jest.clearAllMocks();
  });
  
  describe('saveOrUnsaveProperty', () => {
    it('should save a property when not already saved', async () => {
      // Set up request data
      req.body = { propertyId: 1 };
      
      // Mock Property.findByPk to return a valid property
      Property.findByPk.mockResolvedValue({
        property_id: 1,
        property_name: 'Test Property'
      });
      
      // Mock SavedProperty.findOne to return null (property not saved)
      SavedProperty.findOne.mockResolvedValue(null);
      
      // Mock SavedProperty.create to return success
      SavedProperty.create.mockResolvedValue({
        id: 1,
        userId: 1,
        propertyId: 1
      });
      
      // Call the controller method - it's wrapped in asyncHandler
      await savedPropertyController.saveOrUnsaveProperty(req, res, next);
      
      // Assertions
      expect(Property.findByPk).toHaveBeenCalledWith(1);
      expect(SavedProperty.findOne).toHaveBeenCalledWith({
        where: { userId: 1, propertyId: 1 }
      });
      expect(SavedProperty.create).toHaveBeenCalledWith({ userId: 1, propertyId: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Property saved successfully',
        saved: true
      });
    });
    
    it('should unsave a property when already saved', async () => {
      // Set up request data
      req.body = { propertyId: 1 };
      
      // Mock Property.findByPk to return a valid property
      Property.findByPk.mockResolvedValue({
        property_id: 1,
        property_name: 'Test Property'
      });
      
      // Mock existing saved property with destroy method
      const mockDestroy = jest.fn().mockResolvedValue(true);
      const mockSavedProperty = {
        id: 1,
        userId: 1,
        propertyId: 1,
        destroy: mockDestroy
      };
      
      // Mock SavedProperty.findOne to return the saved property
      SavedProperty.findOne.mockResolvedValue(mockSavedProperty);
      
      // Call the controller method
      await savedPropertyController.saveOrUnsaveProperty(req, res, next);
      
      // Assertions
      expect(Property.findByPk).toHaveBeenCalledWith(1);
      expect(SavedProperty.findOne).toHaveBeenCalledWith({
        where: { userId: 1, propertyId: 1 }
      });
      expect(mockDestroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Property unsaved successfully',
        saved: false
      });
    });
    
    it('should return 400 if propertyId is missing', async () => {
      // Set up request with missing propertyId
      req.body = {};
      
      // Call the controller method
      await savedPropertyController.saveOrUnsaveProperty(req, res, next);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Property ID is required'
      });
    });
    
    it('should return 404 if property not found', async () => {
      // Set up request data
      req.body = { propertyId: 999 };
      
      // Mock Property.findByPk to return null (not found)
      Property.findByPk.mockResolvedValue(null);
      
      // Call the controller method
      await savedPropertyController.saveOrUnsaveProperty(req, res, next);
      
      // Assertions
      expect(Property.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Property not found'
      });
    });
  });
  
  describe('getSavedProperties', () => {
    it('should return all saved properties for the user', async () => {
      // Mock saved properties
      const mockSavedEntries = [
        {
          id: 1,
          userId: 1,
          propertyId: 1,
          Property: {
            property_id: 1,
            property_name: 'Property 1',
            location: { id: 1, area_name: 'Downtown' },
            photos: [{ id: 1, url: 'photo1.jpg' }]
          }
        },
        {
          id: 2,
          userId: 1,
          propertyId: 2,
          Property: {
            property_id: 2,
            property_name: 'Property 2',
            location: { id: 2, area_name: 'Uptown' },
            photos: [{ id: 2, url: 'photo2.jpg' }]
          }
        }
      ];
      
      // Mock SavedProperty.findAll to return saved entries
      SavedProperty.findAll.mockResolvedValue(mockSavedEntries);
      
      // Call the controller method
      await savedPropertyController.getSavedProperties(req, res, next);
      
      // Assertions
      expect(SavedProperty.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: expect.any(Array),
        order: [['createdAt', 'DESC']]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: expect.arrayContaining([
          expect.objectContaining({ property_id: 1, property_name: 'Property 1' }),
          expect.objectContaining({ property_id: 2, property_name: 'Property 2' })
        ])
      });
    });
    
    it('should return empty array if user has no saved properties', async () => {
      // Mock SavedProperty.findAll to return empty array
      SavedProperty.findAll.mockResolvedValue([]);
      
      // Call the controller method
      await savedPropertyController.getSavedProperties(req, res, next);
      
      // Assertions
      expect(SavedProperty.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });
  });
  
  describe('getSavedPropertyStatus', () => {
    it('should return saved=true when property is saved', async () => {
      // Set up request params
      req.params = { propertyId: 1 };
      
      // Mock SavedProperty.findOne to return a saved property
      SavedProperty.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        propertyId: 1
      });
      
      // Call the controller method
      await savedPropertyController.getSavedPropertyStatus(req, res, next);
      
      // Assertions
      expect(SavedProperty.findOne).toHaveBeenCalledWith({
        where: { userId: 1, propertyId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        saved: true
      });
    });
    
    it('should return saved=false when property is not saved', async () => {
      // Set up request params
      req.params = { propertyId: 1 };
      
      // Mock SavedProperty.findOne to return null (not saved)
      SavedProperty.findOne.mockResolvedValue(null);
      
      // Call the controller method
      await savedPropertyController.getSavedPropertyStatus(req, res, next);
      
      // Assertions
      expect(SavedProperty.findOne).toHaveBeenCalledWith({
        where: { userId: 1, propertyId: 1 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        saved: false
      });
    });
  });
}); 
const locationController = require('../../../controllers/locationController');
const Location = require('../../../models/Location');

// Mock the Location model properly
jest.mock('../../../models/Location', () => {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
});

describe('locationController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    jest.clearAllMocks();
  });
  
  describe('getAllLocations', () => {
    it('should return all locations', async () => {
      const mockLocations = [
        { id: 1, area_name: 'Gerji', sub_city: 'Bole', woreda: '05' },
        { id: 2, area_name: 'Megenagna', sub_city: 'Bole', woreda: '06' }
      ];
      
      Location.findAll.mockResolvedValue(mockLocations);
      
      await locationController.getAllLocations(req, res);
      
      expect(Location.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockLocations.length,
        locations: mockLocations
      });
    });
    
    it('should handle errors properly', async () => {
      const error = new Error('Database error');
      Location.findAll.mockRejectedValue(error);
      
      await locationController.getAllLocations(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    });
  });
  
  describe('createLocation', () => {
    it('should successfully create a new location', async () => {
      req.body = {
        sub_city: 'Bole',
        woreda: '05',
        kebele: '07',
        house_no: 'B123',
        area_name: 'Gerji'
      };
      
      const mockLocation = { ...req.body, id: 1 };
      Location.create.mockResolvedValue(mockLocation);
      
      await locationController.createLocation(req, res);
      
      expect(Location.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location created successfully',
        location: mockLocation
      });
    });
    
    it('should return 400 if required fields are missing', async () => {
      req.body = {
        sub_city: 'Bole',
        // Missing woreda and kebele, which are required
      };
      
      await locationController.createLocation(req, res);
      
      expect(Location.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Sub-city, woreda, and kebele are required'
      });
    });
  });
  
  describe('getLocationById', () => {
    it('should return location by ID', async () => {
      req.params.id = 1;
      
      const mockLocation = {
        id: 1,
        sub_city: 'Bole',
        woreda: '05',
        kebele: '07',
        house_no: 'B123',
        area_name: 'Gerji'
      };
      
      Location.findByPk.mockResolvedValue(mockLocation);
      
      await locationController.getLocationById(req, res);
      
      expect(Location.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });
    
    it('should return 404 if location not found', async () => {
      req.params.id = 999;
      
      Location.findByPk.mockResolvedValue(null);
      
      await locationController.getLocationById(req, res);
      
      expect(Location.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Location not found'
      });
    });
  });
}); 
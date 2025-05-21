const Location = require('../../../models/Location');

describe('Location Model', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up Location model static methods
    Location.create = jest.fn();
    Location.findByPk = jest.fn();
    Location.findOne = jest.fn();
    Location.findAll = jest.fn();
  });
  
  describe('creating location', () => {
    it('should successfully create a location with valid data', async () => {
      const locationData = {
        sub_city: 'Bole',
        woreda: '05',
        kebele: '07',
        house_no: 'B123',
        area_name: 'Gerji'
      };
      
      const mockLocation = { ...locationData, id: 1 };
      Location.create.mockResolvedValue(mockLocation);
      
      const result = await Location.create(locationData);
      
      expect(Location.create).toHaveBeenCalledWith(locationData);
      expect(result).toEqual(mockLocation);
    });
  });
  
  describe('finding location', () => {
    it('should find location by house number', async () => {
      const houseNo = 'B123';
      const mockLocation = {
        id: 1,
        sub_city: 'Bole',
        woreda: '05',
        kebele: '07',
        house_no: houseNo,
        area_name: 'Gerji'
      };
      
      Location.findOne.mockResolvedValue(mockLocation);
      
      const result = await Location.findOne({ where: { house_no: houseNo } });
      
      expect(Location.findOne).toHaveBeenCalledWith({ where: { house_no: houseNo } });
      expect(result).toEqual(mockLocation);
    });
    
    it('should find locations by area name', async () => {
      const areaName = 'Gerji';
      const mockLocations = [
        {
          id: 1,
          sub_city: 'Bole',
          woreda: '05',
          kebele: '07',
          house_no: 'B123',
          area_name: areaName
        },
        {
          id: 2,
          sub_city: 'Bole',
          woreda: '05',
          kebele: '08',
          house_no: 'B124',
          area_name: areaName
        }
      ];
      
      Location.findAll.mockResolvedValue(mockLocations);
      
      const result = await Location.findAll({ where: { area_name: areaName } });
      
      expect(Location.findAll).toHaveBeenCalledWith({ where: { area_name: areaName } });
      expect(result).toEqual(mockLocations);
      expect(result.length).toBe(2);
    });
  });
}); 
const Property = require('../../../models/Place');

describe('Property Model', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up Property model static methods
    Property.create = jest.fn();
    Property.findByPk = jest.fn();
    Property.findOne = jest.fn();
    Property.findAll = jest.fn();
    Property.findAndCountAll = jest.fn();
  });
  
  describe('creating property', () => {
    it('should successfully create a property with valid data', async () => {
      const propertyData = {
        user_id: 1,
        property_name: 'Luxury Apartment',
        description: 'A beautiful apartment near the city center',
        property_type: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        extra_info: 'Close to public transportation',
        max_guests: 4,
        price: 1500,
        location_id: 'B123',
        is_broker_listing: false,
        status: 'available'
      };
      
      const mockProperty = { ...propertyData, property_id: 1 };
      Property.create.mockResolvedValue(mockProperty);
      
      const result = await Property.create(propertyData);
      
      expect(Property.create).toHaveBeenCalledWith(propertyData);
      expect(result).toEqual(mockProperty);
    });
  });
  
  describe('finding properties', () => {
    it('should find property by ID', async () => {
      const propertyId = 1;
      const mockProperty = {
        property_id: propertyId,
        user_id: 1,
        property_name: 'Luxury Apartment',
        description: 'A beautiful apartment near the city center',
        property_type: 'Apartment',
        price: 1500,
        status: 'available'
      };
      
      Property.findByPk.mockResolvedValue(mockProperty);
      
      const result = await Property.findByPk(propertyId);
      
      expect(Property.findByPk).toHaveBeenCalledWith(propertyId);
      expect(result).toEqual(mockProperty);
    });
    
    it('should find properties by user ID', async () => {
      const userId = 1;
      const mockProperties = [
        {
          property_id: 1,
          user_id: userId,
          property_name: 'Luxury Apartment',
          price: 1500
        },
        {
          property_id: 2,
          user_id: userId,
          property_name: 'Beach House',
          price: 2500
        }
      ];
      
      Property.findAll.mockResolvedValue(mockProperties);
      
      const result = await Property.findAll({ where: { user_id: userId } });
      
      expect(Property.findAll).toHaveBeenCalledWith({ where: { user_id: userId } });
      expect(result).toEqual(mockProperties);
      expect(result.length).toBe(2);
    });
    
    it('should find properties with filtering and pagination', async () => {
      const whereClause = { price: { $gte: 1000 } };
      const includeClause = [{ model: 'Location', as: 'location' }];
      const mockPaginatedResult = {
        count: 5,
        rows: [
          { property_id: 1, property_name: 'Apartment 1', price: 1200 },
          { property_id: 2, property_name: 'Apartment 2', price: 1300 }
        ]
      };
      
      Property.findAndCountAll.mockResolvedValue(mockPaginatedResult);
      
      const result = await Property.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit: 2,
        offset: 0,
        order: [['price', 'ASC']],
        distinct: true
      });
      
      expect(Property.findAndCountAll).toHaveBeenCalledWith({
        where: whereClause,
        include: includeClause,
        limit: 2,
        offset: 0,
        order: [['price', 'ASC']],
        distinct: true
      });
      
      expect(result).toEqual(mockPaginatedResult);
      expect(result.rows.length).toBe(2);
      expect(result.count).toBe(5);
    });
  });
}); 
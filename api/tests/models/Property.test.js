// tests/models/Property.test.js
const Property = require('../../models/Place');
const User = require('../../models/User');
const Location = require('../../models/Location');
const Perk = require('../../models/Perk');
const Photo = require('../../models/photo');
const { sequelize, syncDB, closeDB } = require('../testHelpers');

describe('Property Model', () => {
  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await Property.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    await Location.destroy({ where: {}, truncate: true, cascade: true });
    await Perk.destroy({ where: {}, truncate: true, cascade: true });
    await Photo.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('Model Initialization', () => {
    let testUser;
    let testLocation;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Property Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 3 // Assuming 3 is property owner role
      });

      testLocation = await Location.create({
        house_no: 'LOC123',
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipcode: '12345'
      });
    });

    it('should create a new property successfully', async () => {
      // Arrange
      const propertyData = {
        user_id: testUser.user_id,
        property_name: 'Test Property',
        description: 'A beautiful test property',
        price: 1000,
        bedrooms: 2,
        bathrooms: 1,
        max_guests: 4,
        property_type: 'Apartment',
        location_id: testLocation.house_no
      };

      // Act
      const property = await Property.create(propertyData);

      // Assert
      expect(property).toBeDefined();
      expect(property.property_name).toBe(propertyData.property_name);
      expect(property.price).toBe(propertyData.price);
      expect(property.bedrooms).toBe(propertyData.bedrooms);
      expect(property.user_id).toBe(testUser.user_id);
      expect(property.location_id).toBe(testLocation.house_no);
      expect(property.status).toBe('available'); // Default status
      expect(property.is_broker_listing).toBe(false); // Default value
    });

    it('should fail if required fields are missing', async () => {
      // Arrange
      const invalidPropertyData = {
        user_id: testUser.user_id,
        // Missing required property_name and price
        bedrooms: 2,
        bathrooms: 1
      };

      // Act & Assert
      await expect(Property.create(invalidPropertyData)).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      // Arrange
      const minimalPropertyData = {
        user_id: testUser.user_id,
        property_name: 'Minimal Property',
        price: 500,
        location_id: testLocation.house_no
      };

      // Act
      const property = await Property.create(minimalPropertyData);

      // Assert
      expect(property.status).toBe('available');
      expect(property.is_broker_listing).toBe(false);
    });
  });

  describe('Associations', () => {
    let testUser;
    let testLocation;
    let testProperty;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Property Owner',
        email: 'owner@example.com',
        password: 'password123',
        role: 3 
      });

      testLocation = await Location.create({
        house_no: 'LOC123',
        street: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipcode: '12345'
      });

      testProperty = await Property.create({
        user_id: testUser.user_id,
        property_name: 'Association Test Property',
        description: 'Property for testing associations',
        price: 1200,
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        property_type: 'House',
        location_id: testLocation.house_no
      });
    });

    it('should be associated with User model', async () => {
      // Check that the association is defined
      expect(Property.associations).toHaveProperty('owner');
      
      // Test the association by including the owner in a query
      const propertyWithOwner = await Property.findByPk(testProperty.property_id, {
        include: ['owner']
      });
      
      expect(propertyWithOwner).toBeDefined();
      expect(propertyWithOwner.owner).toBeDefined();
      expect(propertyWithOwner.owner.user_id).toBe(testUser.user_id);
      expect(propertyWithOwner.owner.name).toBe(testUser.name);
    });

    it('should be associated with Location model', async () => {
      // Check that the association is defined
      expect(Property.associations).toHaveProperty('location');
      
      // Test the association by including the location in a query
      const propertyWithLocation = await Property.findByPk(testProperty.property_id, {
        include: ['location']
      });
      
      expect(propertyWithLocation).toBeDefined();
      expect(propertyWithLocation.location).toBeDefined();
      expect(propertyWithLocation.location.house_no).toBe(testLocation.house_no);
      expect(propertyWithLocation.location.city).toBe(testLocation.city);
    });

    it('should create and associate perks', async () => {
      // Act: Create perk records associated with the property
      await Perk.bulkCreate([
        { property_id: testProperty.property_id, name: 'WiFi' },
        { property_id: testProperty.property_id, name: 'Parking' }
      ]);
      
      // Test the association by including perks in a query
      const propertyWithPerks = await Property.findByPk(testProperty.property_id, {
        include: ['perks']
      });
      
      expect(propertyWithPerks).toBeDefined();
      expect(propertyWithPerks.perks).toBeDefined();
      expect(propertyWithPerks.perks.length).toBe(2);
      expect(propertyWithPerks.perks[0].name).toBe('WiFi');
      expect(propertyWithPerks.perks[1].name).toBe('Parking');
    });

    it('should create and associate photos', async () => {
      // Act: Create photo records associated with the property
      await Photo.bulkCreate([
        { property_id: testProperty.property_id, url: 'https://example.com/photo1.jpg' },
        { property_id: testProperty.property_id, url: 'https://example.com/photo2.jpg' }
      ]);
      
      // Test the association by including photos in a query
      const propertyWithPhotos = await Property.findByPk(testProperty.property_id, {
        include: ['photos']
      });
      
      expect(propertyWithPhotos).toBeDefined();
      expect(propertyWithPhotos.photos).toBeDefined();
      expect(propertyWithPhotos.photos.length).toBe(2);
      expect(propertyWithPhotos.photos[0].url).toBe('https://example.com/photo1.jpg');
      expect(propertyWithPhotos.photos[1].url).toBe('https://example.com/photo2.jpg');
    });
  });

  describe('Property Status Management', () => {
    let testProperty;

    beforeEach(async () => {
      const testUser = await User.create({
        name: 'Status Test Owner',
        email: 'status@example.com',
        password: 'password123',
        role: 3 
      });

      const testLocation = await Location.create({
        house_no: 'STATUS123',
        street: 'Status Street',
        city: 'Status City',
        state: 'Status State',
        country: 'Status Country',
        zipcode: '54321'
      });

      testProperty = await Property.create({
        user_id: testUser.user_id,
        property_name: 'Status Test Property',
        description: 'Property for testing status changes',
        price: 1000,
        location_id: testLocation.house_no
      });
    });

    it('should start with "available" status by default', () => {
      expect(testProperty.status).toBe('available');
    });

    it('should update to "rented" status', async () => {
      // Act
      testProperty.status = 'rented';
      await testProperty.save();

      // Assert
      const updatedProperty = await Property.findByPk(testProperty.property_id);
      expect(updatedProperty.status).toBe('rented');
    });

    it('should update to "maintenance" status', async () => {
      // Act
      testProperty.status = 'maintenance';
      await testProperty.save();

      // Assert
      const updatedProperty = await Property.findByPk(testProperty.property_id);
      expect(updatedProperty.status).toBe('maintenance');
    });

    it('should reject invalid status values', async () => {
      // Act & Assert
      testProperty.status = 'invalid_status';
      await expect(testProperty.save()).rejects.toThrow();
    });
  });
});

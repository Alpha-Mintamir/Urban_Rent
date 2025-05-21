const jwt = require('jsonwebtoken');

// Import models
const User = require('../../models/User');
const Property = require('../../models/Place');
const Location = require('../../models/Location');
const Review = require('../../models/Review');

// Test data generators
const testUsers = {
  regular: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
    role: 1 // Regular user
  },
  admin: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123',
    role: 3 // Admin
  },
  broker: {
    name: 'Broker User',
    email: 'broker@example.com',
    password: 'Broker123',
    role: 2 // Broker
  }
};

const testLocation = {
  houseNumber: '123',
  street: 'Test Street',
  locality: 'Test Locality',
  landmark: 'Test Landmark',
  areaName: 'Test Area',
  city: 'Test City',
  state: 'Test State',
  zipCode: '123456',
  country: 'Test Country',
  coordinates: {
    latitude: 12.3456,
    longitude: 78.9101
  }
};

const testProperty = {
  title: 'Test Property',
  description: 'A test property for integration testing',
  address: '123 Test Street',
  photos: ['https://example.com/photo1.jpg'],
  perks: ['Wifi', 'Kitchen'],
  extraInfo: 'Extra information about the property',
  checkIn: '14:00',
  checkOut: '11:00',
  maxGuests: 4,
  price: 100,
  propertyType: 'apartment',
  bedroomCount: 2,
  bedCount: 2,
  bathroomCount: 1,
  area: 800
};

const testReview = {
  rating: 4,
  reviewText: 'This is a test review'
};

// Helper functions - we're mostly relying on the mocks we set up
const createTestUser = async (userData = testUsers.regular) => {
  return await User.create(userData);
};

const createTestLocation = async (locationData = testLocation) => {
  return await Location.create(locationData);
};

const createTestProperty = async (userId, locationId, propertyData = testProperty) => {
  return await Property.create({
    ...propertyData,
    userId,
    locationId
  });
};

const createTestReview = async (userId, propertyId, reviewData = testReview) => {
  return await Review.create({
    ...reviewData,
    userId,
    propertyId
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};

module.exports = {
  testUsers,
  testLocation,
  testProperty,
  testReview,
  createTestUser,
  createTestLocation,
  createTestProperty,
  createTestReview,
  generateToken
}; 
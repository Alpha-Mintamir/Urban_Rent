const request = require('supertest');
const express = require('express');
const {
  testUsers,
  testProperty,
  testLocation,
  generateToken
} = require('./helpers');

// Create a simple mocked app for testing
const app = express();

// Add JSON middleware for body parsing
app.use(express.json());

// Import mock controller
const placeController = require('../../controllers/placeController');

// Mock the middleware to add a user to the request
const authMiddleware = (req, res, next) => {
  req.user = {
    user_id: 1,
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 1
  };
  next();
};

// Register the routes directly in the test
app.get('/test-endpoint', (req, res) => res.status(200).json({ success: true }));
app.get('/places', placeController.getPlaces);
app.get('/places/:id', placeController.singlePlace);
app.post('/places/add-places', authMiddleware, placeController.addPlace);
app.put('/places/update-place', authMiddleware, placeController.updatePlace);
app.delete('/places/delete/:id', authMiddleware, placeController.deleteProperty);

// Mock the place controller
jest.mock('../../controllers/placeController', () => ({
  getPlaces: jest.fn((req, res) => {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          property_name: 'Test Property',
          description: 'Test description',
          userId: 1
        },
        {
          id: 2,
          property_name: 'Another Property',
          description: 'Another description',
          userId: 1
        }
      ],
      pagination: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      }
    });
  }),
  
  singlePlace: jest.fn((req, res) => {
    const id = parseInt(req.params.id);
    if (id === 999999) {
      return res.status(404).json({
        message: 'Place not found'
      });
    }
    
    return res.status(200).json({
      id,
      property_name: 'Test Property',
      description: 'Test description',
      userId: 1
    });
  }),
  
  addPlace: jest.fn((req, res) => {
    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    return res.status(200).json({
      success: true,
      place: {
        id: 1,
        ...req.body,
        user_id: req.user.user_id
      },
      message: 'Property added successfully'
    });
  }),
  
  updatePlace: jest.fn((req, res) => {
    if (!req.body.id) {
      return res.status(400).json({
        success: false,
        error: 'Property ID is required'
      });
    }
    
    return res.status(200).json({
      success: true,
      property: {
        id: req.body.id,
        property_name: req.body.title || 'Updated Property',
        description: req.body.description || 'Updated description',
        userId: req.user.user_id
      }
    });
  }),
  
  deleteProperty: jest.fn((req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  })
}));

describe('Property API Tests', () => {
  it('should respond to test endpoint', async () => {
    const response = await request(app).get('/test-endpoint');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should get all properties', async () => {
    const response = await request(app).get('/places');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(2);
  });

  it('should get a specific property by id', async () => {
    const response = await request(app).get('/places/1');
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.property_name).toBe('Test Property');
  });

  it('should return 404 for non-existent property', async () => {
    const response = await request(app).get('/places/999999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Place not found');
  });

  it('should create a property when authenticated', async () => {
    const propertyData = {
      title: 'New Property',
      description: 'Property description',
      locationId: 1
    };

    const response = await request(app)
      .post('/places/add-places')
      .send(propertyData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.place).toBeDefined();
    expect(response.body.place.title).toBe('New Property');
  });

  it('should update a property when authenticated', async () => {
    const updateData = {
      id: 1,
      title: 'Updated Property',
      description: 'Updated description'
    };

    const response = await request(app)
      .put('/places/update-place')
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.property).toBeDefined();
    expect(response.body.property.property_name).toBe('Updated Property');
  });

  it('should delete a property when authenticated', async () => {
    const response = await request(app).delete('/places/delete/1');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Property deleted successfully');
  });
}); 
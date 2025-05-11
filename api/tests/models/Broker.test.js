// tests/models/Broker.test.js
const Broker = require('../../models/Broker');
const User = require('../../models/User');
const { sequelize, syncDB, closeDB } = require('../testHelpers');

describe('Broker Model', () => {
  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await Broker.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
  });

  describe('Model Initialization', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Broker',
        email: 'broker@example.com',
        password: 'password123',
        role: 2 // Assuming 2 is broker role
      });
    });

    it('should create a new broker successfully', async () => {
      // Arrange
      const brokerData = {
        user_id: testUser.user_id,
        broker_no: 12345
      };

      // Act
      const broker = await Broker.create(brokerData);

      // Assert
      expect(broker).toBeDefined();
      expect(broker.user_id).toBe(testUser.user_id);
      expect(broker.broker_no).toBe(brokerData.broker_no);
      // Default status should be 'not_submitted'
      expect(broker.verification_status).toBe('not_submitted');
    });

    it('should fail if required fields are missing', async () => {
      // Arrange
      const invalidBrokerData = {
        user_id: testUser.user_id
        // Missing required broker_no field
      };

      // Act & Assert
      await expect(Broker.create(invalidBrokerData)).rejects.toThrow();
    });

    it('should allow setting verification status to "verified"', async () => {
      // Arrange
      const brokerData = {
        user_id: testUser.user_id,
        broker_no: 12345,
        verification_status: 'verified',
        verified_at: new Date()
      };

      // Act
      const broker = await Broker.create(brokerData);

      // Assert
      expect(broker.verification_status).toBe('verified');
    });

    it('should validate acceptable verification status values', async () => {
      // Arrange
      const invalidBrokerData = {
        user_id: testUser.user_id,
        broker_no: 12345,
        verification_status: 'approved' // 'approved' is not a valid status
      };

      // Act & Assert
      // This should fail because 'approved' is not in the allowed list of values
      await expect(Broker.create(invalidBrokerData)).rejects.toThrow();
    });

    it('should accept "verified" status (not "approved") - confirming business logic', async () => {
      // Arrange
      const brokerData = {
        user_id: testUser.user_id,
        broker_no: 12345,
        verification_status: 'verified'
      };
      
      // Act
      const broker = await Broker.create(brokerData);
      
      // Assert
      // This test is critical because of the known issue where frontend was checking for 'approved'
      // but backend uses 'verified' - as noted in the memory
      expect(broker.verification_status).toBe('verified');
      expect(broker.verification_status).not.toBe('approved');
    });
  });

  describe('Broker Status Workflow', () => {
    let testUser;
    let broker;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test Broker',
        email: 'broker@example.com',
        password: 'password123',
        role: 2
      });

      broker = await Broker.create({
        user_id: testUser.user_id,
        broker_no: 12345
      });
    });

    it('should start with "not_submitted" status', () => {
      expect(broker.verification_status).toBe('not_submitted');
    });

    it('should update to "pending" status when documents are submitted', async () => {
      // Act
      broker.verification_status = 'pending';
      broker.document_url = 'https://example.com/document.pdf';
      broker.issuing_authority = 'Real Estate Board';
      broker.document_number = 'BRK-12345';
      broker.issue_date = new Date();
      broker.submitted_at = new Date();
      await broker.save();

      // Assert
      const updatedBroker = await Broker.findByPk(testUser.user_id);
      expect(updatedBroker.verification_status).toBe('pending');
    });

    it('should update to "verified" status when approved', async () => {
      // Act
      broker.verification_status = 'verified';
      broker.verified_at = new Date();
      await broker.save();

      // Assert
      const updatedBroker = await Broker.findByPk(testUser.user_id);
      expect(updatedBroker.verification_status).toBe('verified');
    });

    it('should update to "rejected" status with reason', async () => {
      // Act
      broker.verification_status = 'rejected';
      broker.rejection_reason = 'Invalid documentation';
      broker.rejected_at = new Date();
      await broker.save();

      // Assert
      const updatedBroker = await Broker.findByPk(testUser.user_id);
      expect(updatedBroker.verification_status).toBe('rejected');
      expect(updatedBroker.rejection_reason).toBe('Invalid documentation');
    });
  });

  describe('Associations', () => {
    it('should be associated with User model', async () => {
      // Check that the association is defined
      expect(Broker.associations).toHaveProperty('User');
    });
  });
});

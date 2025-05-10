const { User, Property, Broker } = require('../models');

// Get total number of users
const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.count();
    res.json({ success: true, data: totalUsers });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch total users' });
  }
};

// Get total number of properties
const getTotalProperties = async (req, res) => {
  try {
    const totalProperties = await Property.count();
    res.json({ success: true, data: totalProperties });
  } catch (error) {
    console.error('Error fetching total properties:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch total properties' });
  }
};

// Get count of pending broker verifications
const getPendingVerificationsCount = async (req, res) => {
  try {
    const pendingCount = await Broker.count({ where: { verification_status: 'pending' } });
    res.json({ success: true, data: pendingCount });
  } catch (error) {
    console.error('Error fetching pending verifications count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending verifications count' });
  }
};


module.exports = {
  getTotalUsers,
  getTotalProperties,
  getPendingVerificationsCount,
}; 
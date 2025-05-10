const User = require('../models/User');
const sequelize = require('../config/db'); // For Sequelize.fn, .col, .literal if needed
const { Property, Location } = require('../models'); // Assuming Property is the alias for Place model
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * @desc    Get User Insights Summary
 * @route   GET /api/admin/reports/users-summary
 * @access  Private (Admin)
 */
exports.getUsersSummary = async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.count();

    // 2. User Role Distribution
    // Mapping role numbers to meaningful names for the report
    const userRoles = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('role')), 'count']
      ],
      group: ['role'],
      raw: true,
    });

    const roleMapping = {
      1: 'Tenant',
      2: 'Property Owner',
      3: 'Broker',
      4: 'Admin',
    };

    const userRoleDistribution = userRoles.map(role => ({
      name: roleMapping[role.role] || `Role ${role.role}`,
      count: role.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        userRoleDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching user insights summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user insights',
      error: error.message
    });
  }
};

/**
 * @desc    Get Properties Summary
 * @route   GET /api/admin/reports/properties-summary
 * @access  Private (Admin)
 */
exports.getPropertiesSummary = async (req, res) => {
  try {
    // 1. Total Properties
    const totalProperties = await Property.count();

    // 2. Property Type Distribution
    const propertyTypes = await Property.findAll({
      attributes: [
        'property_type',
        [sequelize.fn('COUNT', sequelize.col('property_type')), 'count']
      ],
      group: ['property_type'],
      where: { property_type: { [Op.ne]: null } }, // Exclude null types if any
      raw: true,
    });
    const propertyTypeDistribution = propertyTypes.map(pt => ({
      name: pt.property_type || 'Unspecified',
      count: parseInt(pt.count, 10)
    }));

    // 3. Property Status Distribution
    const propertyStatuses = await Property.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      where: { status: { [Op.ne]: null } },
      raw: true,
    });
    const propertyStatusDistribution = propertyStatuses.map(ps => ({
      name: ps.status || 'Unspecified',
      count: parseInt(ps.count, 10)
    }));
    
    // 4. Average Price
    const averagePriceResult = await Property.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('price')), 'averagePrice']
      ],
      raw: true,
    });
    const averagePrice = averagePriceResult ? parseFloat(averagePriceResult.averagePrice).toFixed(2) : 0;

    // 5. Properties By Sub-City
    const propertiesBySubCityRaw = await Property.findAll({
      attributes: [
        [sequelize.col('location.sub_city'), 'sub_city'],
        [sequelize.fn('COUNT', sequelize.col('Property.property_id')), 'count']
      ],
      include: [{
        model: Location,
        as: 'location',
        attributes: []
      }],
      group: [sequelize.col('location.sub_city')],
      where: { '$location.sub_city$': { [Op.ne]: null } },
      raw: true,
    });
     const propertiesBySubCity = propertiesBySubCityRaw.map(item => ({
      name: item.sub_city || 'Unspecified',
      count: parseInt(item.count, 10)
    }));

    // 6. Recently Added Count (e.g., last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const recentlyAddedCount = await Property.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalProperties,
        propertyTypeDistribution,
        propertyStatusDistribution,
        averagePrice: parseFloat(averagePrice), // Ensure it's a number
        propertiesBySubCity,
        recentlyAddedCount
      }
    });

  } catch (error) {
    console.error('Error fetching properties summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch properties summary.', error: error.message });
  }
}; 
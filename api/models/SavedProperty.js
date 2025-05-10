const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Property = require('./Place'); // Assuming Place.js exports the Property model

class SavedProperty extends Model {}

SavedProperty.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
    onDelete: 'CASCADE', 
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Property, 
      key: 'property_id',
    },
    onDelete: 'CASCADE',
  },
}, {
  sequelize,
  modelName: 'SavedProperty',
  tableName: 'saved_properties', // Explicitly defining table name
  timestamps: true, // Will add createdAt and updatedAt
});

module.exports = SavedProperty; 
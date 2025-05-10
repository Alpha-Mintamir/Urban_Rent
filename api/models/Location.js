const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Location extends Model {}

Location.init({
  house_no: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  sub_city: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  woreda: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  kebele: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  area_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Location',
  tableName: 'locations',
  timestamps: false
});

module.exports = Location;

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Location = require('./Location');
const Perk = require('./Perk');
const Photo = require('./photo');

class Property extends Model {}

Property.init({
  property_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  property_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  property_type: {
    type: DataTypes.STRING(100)
  },
  bedrooms: {
    type: DataTypes.INTEGER
  },
  bathrooms: {
    type: DataTypes.INTEGER
  },
  extra_info: {
    type: DataTypes.TEXT
  },
  max_guests: {
    type: DataTypes.INTEGER
  },
  location_id: {
    type: DataTypes.STRING(255),
    references: {
      model: Location,
      key: 'house_no'
    }
  },
  is_broker_listing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('available', 'rented', 'maintenance'),
    defaultValue: 'available'
  }
}, {
  sequelize,
  modelName: 'Property',
  tableName: 'properties',
  timestamps: true
});

// Define Association
Property.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'owner'
});

Property.belongsTo(Location, {
  foreignKey: 'location_id', // The foreign key in the Property table
  targetKey: 'house_no',    // The target key in the Location table
  as: 'location'         // The alias used in includes
});

// Re-add associations for Perk and Photo
Property.hasMany(Perk, {
  foreignKey: 'property_id',
  as: 'perks'
});
Perk.belongsTo(Property, {
  foreignKey: 'property_id' 
});
Property.hasMany(Photo, {
  foreignKey: 'property_id',
  as: 'photos'
});
Photo.belongsTo(Property, {
  foreignKey: 'property_id' 
});

// It's also good practice for the other side of the association, though maybe not strictly needed for the include to work this way
// Location.hasMany(Property, { foreignKey: 'location_id', sourceKey: 'house_no' });

module.exports = Property;

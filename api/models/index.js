// models/index.js
const sequelize = require('../config/db');
const User = require('./User');
const Location = require('./Location');
const Property = require('./Place');
const Perk = require('./Perk');
const Photo = require('./photo');
const Review = require('./Review');
const Message = require('./Message');
const SavedProperty = require('./SavedProperty');
const Broker = require('./Broker');

// Define model associations here
User.hasMany(Property, { foreignKey: 'user_id' });
Property.belongsTo(User, { foreignKey: 'user_id' });

// Broker association
User.hasOne(Broker, { foreignKey: 'user_id' });
Broker.belongsTo(User, { foreignKey: 'user_id' });

// Add review associations
Property.hasMany(Review, { foreignKey: 'property_id', as: 'reviews' });
Review.belongsTo(Property, { foreignKey: 'property_id' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// Associations for SavedProperty
User.belongsToMany(Property, { 
  through: SavedProperty, 
  foreignKey: 'userId', 
  otherKey: 'propertyId',
  as: 'savedProperties' 
});
Property.belongsToMany(User, { 
  through: SavedProperty, 
  foreignKey: 'propertyId', 
  otherKey: 'userId',
  as: 'savedByUsers' 
});

// Direct associations with the join table if needed for more granular control
User.hasMany(SavedProperty, { foreignKey: 'userId', as: 'userSavedEntries' });
SavedProperty.belongsTo(User, { foreignKey: 'userId' });

Property.hasMany(SavedProperty, { foreignKey: 'propertyId', as: 'propertySavedEntries' });
SavedProperty.belongsTo(Property, { foreignKey: 'propertyId' });

// Add association between Property and Location
// Property.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Location.hasMany(Property, { foreignKey: 'location_id', targetKey: 'house_no' });

// Message associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Property.hasMany(Message, { foreignKey: 'property_id', as: 'messages' });

// Sync all models with the database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
};

// Run the sync function
syncModels();

module.exports = {
  sequelize,
  User,
  Location,
  Property,
  Perk,
  Photo,
  Review,
  Message,
  SavedProperty,
  Broker
};

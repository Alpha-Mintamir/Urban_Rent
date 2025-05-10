const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Perk extends Model {}

Perk.init({
  perk_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  perk: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Perk',
  tableName: 'property_perks',
  timestamps: false
});

// Static method to add perks to a property
Perk.addPerks = async function(propertyId, perkNames) {
  try {
    // First, remove any existing perks for this property
    await Perk.destroy({
      where: {
        property_id: propertyId
      }
    });
    
    // Then add the new perks
    const perksToCreate = perkNames.map(perkName => ({
      property_id: propertyId,
      perk: perkName
    }));
    
    return await Perk.bulkCreate(perksToCreate);
  } catch (error) {
    console.error('Error adding perks:', error);
    throw error;
  }
};

// Static method to delete perks for a property
Perk.deletePerksByPropertyId = async function(propertyId) {
  try {
    return await Perk.destroy({
      where: {
        property_id: propertyId
      }
    });
  } catch (error) {
    console.error('Error deleting perks:', error);
    throw error;
  }
};

module.exports = Perk;
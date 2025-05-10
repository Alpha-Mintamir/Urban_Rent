const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Photo extends Model {}

Photo.init({
  photo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Define both possible column names for URL
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: true  // Allow null to prevent sync issues
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true  // Allow null to prevent sync issues
  }
}, {
  sequelize,
  modelName: 'Photo',
  tableName: 'property_photos',
  timestamps: false
});

// Static method to add photos to a property
Photo.addPhotos = async function(propertyId, photoUrls) {
  try {
    // First, remove any existing photos for this property
    await Photo.destroy({
      where: {
        property_id: propertyId
      }
    });
    
    // Then add the new photos
    const photosToCreate = photoUrls.map(url => {
      // Create an object with property_id and both possible URL field names
      const photoObj = {
        property_id: propertyId
      };
      
      // Try to set both possible URL fields
      photoObj.photo_url = url;
      photoObj.url = url;
      
      return photoObj;
    });
    
    return await Photo.bulkCreate(photosToCreate);
  } catch (error) {
    console.error('Error adding photos:', error);
    throw error;
  }
};

// Static method to delete photos for a property
Photo.deletePhotosByPropertyId = async function(propertyId) {
  try {
    return await Photo.destroy({
      where: {
        property_id: propertyId
      }
    });
  } catch (error) {
    console.error('Error deleting photos:', error);
    throw error;
  }
};

module.exports = Photo;
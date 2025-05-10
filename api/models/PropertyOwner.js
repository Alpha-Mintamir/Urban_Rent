const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class PropertyOwner extends Model {}

PropertyOwner.init({
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  picture: {
    type: DataTypes.STRING(255),
    defaultValue: 'https://res.cloudinary.com/rahul4019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pngwing.com_zi4cre.png'
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  role: {
    type: DataTypes.INTEGER,
    defaultValue: 2 // Assuming 2 is for property owner
  }
}, {
  sequelize,
  modelName: 'PropertyOwner',
  tableName: 'propertyowner',
  timestamps: false
});

module.exports = PropertyOwner;

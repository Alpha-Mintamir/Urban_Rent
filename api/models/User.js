// user.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const DEFAULT_PICTURE_URL =
  'https://res.cloudinary.com/rahul4019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pngwing.com_zi4cre.png';

class User extends Model {
  // Compare passwords
  async isValidatedPassword(userSentPassword) {
    return await bcrypt.compare(userSentPassword, this.password);
  }

  // Generate JWT
  getJwtToken() {
    return jwt.sign(
      { 
        id: this.user_id,
        email: this.email,
        role: this.role,
        name: this.name
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: process.env.JWT_EXPIRY || '1h',
      }
    );
  }
}

User.init({
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
    defaultValue: DEFAULT_PICTURE_URL
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  role: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // Default to tenant (1)
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: false
});

// Hooks for password hashing
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Static methods
User.findByEmail = async function(email) {
  return await User.findOne({ where: { email } });
};

User.findById = async function(id) {
  return await User.findByPk(id);
};

User.register = async function({ name, email, password, picture, phone, role }) {
  const user = await User.create({ name, email, password, picture, phone, role });
  return user;
};

User.updateUser = async function({ user_id, name, password, picture }) {
  const user = await User.findByPk(user_id);
  if (!user) {
    return null;
  }

  if (name) {
    user.name = name;
  }

  if (password) {
    user.password = password;
  }

  if (picture) {
    user.picture = picture;
  }

  await user.save();
  return user;
};

module.exports = User;

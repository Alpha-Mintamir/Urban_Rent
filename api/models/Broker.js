const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Broker = sequelize.define('Broker', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  broker_no: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verification_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'not_submitted',
    validate: {
      isIn: [['not_submitted', 'pending', 'verified', 'rejected']]
    }
  },
  document_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuing_authority: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  additional_info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'broker',
  timestamps: false
});

// Define association
Broker.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Broker; 
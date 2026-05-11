const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Family = sequelize.define('Family', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '家庭名称',
  },
  inviteCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '邀请码',
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建者ID',
  },
}, {
  tableName: 'families',
  timestamps: true,
  comment: '家庭表',
});

module.exports = Family;

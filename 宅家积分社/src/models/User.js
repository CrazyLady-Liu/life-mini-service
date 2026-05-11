const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: true,
    unique: true,
    comment: '手机号',
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: '用户名/账号',
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '密码(加密)',
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '昵称',
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL',
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '微信openid',
  },
  unionid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信unionid',
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总积分',
  },
  role: {
    type: DataTypes.ENUM('member', 'admin'),
    defaultValue: 'member',
    comment: '角色',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态',
  },
}, {
  tableName: 'users',
  timestamps: true,
  comment: '用户表',
});

module.exports = User;

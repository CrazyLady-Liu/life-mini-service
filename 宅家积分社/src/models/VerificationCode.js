const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificationCode = sequelize.define('VerificationCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    comment: '手机号',
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    comment: '验证码',
  },
  type: {
    type: DataTypes.ENUM('login', 'register', 'bind', 'reset'),
    defaultValue: 'login',
    comment: '验证码类型',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '过期时间',
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已使用',
  },
}, {
  tableName: 'verification_codes',
  timestamps: true,
  comment: '验证码表',
});

module.exports = VerificationCode;

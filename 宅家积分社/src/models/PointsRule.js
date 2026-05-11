const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsRule = sequelize.define('PointsRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '规则名称',
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '规则类型',
  },
  basePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '基础积分',
  },
  multiplier: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.00,
    comment: '倍率',
  },
  condition: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '条件配置',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态',
  },
}, {
  tableName: 'points_rules',
  timestamps: true,
  comment: '积分规则表',
});

module.exports = PointsRule;

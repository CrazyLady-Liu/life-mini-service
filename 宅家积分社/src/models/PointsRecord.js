const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsRecord = sequelize.define('PointsRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID',
  },
  familyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '家庭ID',
  },
  type: {
    type: DataTypes.ENUM('earn', 'spend', 'adjust'),
    defaultValue: 'earn',
    comment: '类型：earn-获得，spend-消费，adjust-调整',
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '积分数量（正数为增加，负数为减少）',
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '变动后余额',
  },
  sourceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '来源类型',
  },
  sourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '来源ID',
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '描述',
  },
}, {
  tableName: 'points_records',
  timestamps: true,
  comment: '积分记录表',
});

module.exports = PointsRecord;

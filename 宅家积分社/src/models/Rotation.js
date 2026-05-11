const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rotation = sequelize.define('Rotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  familyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '家庭ID',
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '任务ID',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '负责人ID',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始日期',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束日期',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    comment: '状态',
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '分配人ID',
  },
  assignmentType: {
    type: DataTypes.ENUM('auto', 'manual'),
    defaultValue: 'manual',
    comment: '分配类型',
  },
}, {
  tableName: 'rotations',
  timestamps: true,
  comment: '轮值分配表',
});

module.exports = Rotation;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HouseworkTask = sequelize.define('HouseworkTask', {
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
  taskTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '任务类型ID',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '任务名称',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '任务描述',
  },
  cycleType: {
    type: DataTypes.ENUM('once', 'daily', 'weekly', 'biweekly', 'monthly'),
    defaultValue: 'once',
    comment: '周期类型：一次性/每日/每周/隔周/每月',
  },
  cycleValue: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '周期值（周几、几号等），多个用逗号分隔',
  },
  cycleConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '周期配置详情',
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: '积分',
  },
  weight: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '权重，影响轮值分配概率',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard', 'very_hard'),
    defaultValue: 'medium',
    comment: '难度等级：简单/中等/困难/非常困难',
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签数组',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '预计时长（分钟）',
  },
  standard: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '完成标准',
  },
  requirement: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '完成要求',
  },
  reminderTime: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '提醒时间，格式HH:mm',
  },
  reminderEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否启用提醒',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态',
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建者ID',
  },
}, {
  tableName: 'housework_tasks',
  timestamps: true,
  comment: '家务任务表',
});

module.exports = HouseworkTask;

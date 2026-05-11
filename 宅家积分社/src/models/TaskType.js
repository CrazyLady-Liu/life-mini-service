const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskType = sequelize.define('TaskType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '类型名称',
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '图标URL',
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '颜色',
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态',
  },
}, {
  tableName: 'task_types',
  timestamps: true,
  comment: '任务类型表',
});

module.exports = TaskType;

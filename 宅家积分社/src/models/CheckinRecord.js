const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CheckinRecord = sequelize.define('CheckinRecord', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '打卡人ID',
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '任务ID',
  },
  rotationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '轮值记录ID',
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '打卡图片',
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注',
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '获得积分',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    comment: '状态',
  },
  checkedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '审核人ID',
  },
  checkedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间',
  },
}, {
  tableName: 'checkin_records',
  timestamps: true,
  comment: '打卡记录表',
});

module.exports = CheckinRecord;

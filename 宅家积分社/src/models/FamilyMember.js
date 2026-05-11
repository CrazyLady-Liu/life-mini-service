const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FamilyMember = sequelize.define('FamilyMember', {
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
    comment: '用户ID',
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    comment: '家庭内角色',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'pending',
    comment: '状态',
  },
}, {
  tableName: 'family_members',
  timestamps: true,
  comment: '家庭成员关联表',
});

module.exports = FamilyMember;

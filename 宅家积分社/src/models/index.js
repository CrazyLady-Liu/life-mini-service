const sequelize = require('../config/database');
const User = require('./User');
const Family = require('./Family');
const FamilyMember = require('./FamilyMember');
const HouseworkTask = require('./HouseworkTask');
const TaskType = require('./TaskType');
const Rotation = require('./Rotation');
const CheckinRecord = require('./CheckinRecord');
const PointsRecord = require('./PointsRecord');
const PointsRule = require('./PointsRule');

Family.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Family.hasMany(FamilyMember, { foreignKey: 'familyId' });
Family.hasMany(HouseworkTask, { foreignKey: 'familyId' });
Family.hasMany(Rotation, { foreignKey: 'familyId' });
Family.hasMany(CheckinRecord, { foreignKey: 'familyId' });
Family.hasMany(PointsRecord, { foreignKey: 'familyId' });

User.hasMany(FamilyMember, { foreignKey: 'userId' });
User.hasMany(HouseworkTask, { as: 'createdTasks', foreignKey: 'creatorId' });
User.hasMany(Rotation, { foreignKey: 'userId' });
User.hasMany(CheckinRecord, { foreignKey: 'userId' });
User.hasMany(PointsRecord, { foreignKey: 'userId' });

FamilyMember.belongsTo(Family, { foreignKey: 'familyId' });
FamilyMember.belongsTo(User, { foreignKey: 'userId' });

HouseworkTask.belongsTo(Family, { foreignKey: 'familyId' });
HouseworkTask.belongsTo(TaskType, { foreignKey: 'taskTypeId' });
HouseworkTask.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
HouseworkTask.hasMany(Rotation, { foreignKey: 'taskId' });
HouseworkTask.hasMany(CheckinRecord, { foreignKey: 'taskId' });

TaskType.hasMany(HouseworkTask, { foreignKey: 'taskTypeId' });

Rotation.belongsTo(Family, { foreignKey: 'familyId' });
Rotation.belongsTo(HouseworkTask, { foreignKey: 'taskId' });
Rotation.belongsTo(User, { foreignKey: 'userId' });
Rotation.belongsTo(User, { as: 'assigner', foreignKey: 'assignedBy' });
Rotation.hasMany(CheckinRecord, { foreignKey: 'rotationId' });

CheckinRecord.belongsTo(Family, { foreignKey: 'familyId' });
CheckinRecord.belongsTo(User, { foreignKey: 'userId' });
CheckinRecord.belongsTo(HouseworkTask, { foreignKey: 'taskId' });
CheckinRecord.belongsTo(Rotation, { foreignKey: 'rotationId' });
CheckinRecord.belongsTo(User, { as: 'checker', foreignKey: 'checkedBy' });

PointsRecord.belongsTo(User, { foreignKey: 'userId' });
PointsRecord.belongsTo(Family, { foreignKey: 'familyId' });

const bcrypt = require('bcryptjs');

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }
    console.log('数据库同步完成');
    
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        nickname: '管理员',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active',
        totalPoints: 0,
      }
    });
    
    if (created) {
      console.log('测试账号已创建: admin/admin123');
    }
    
    await TaskType.findOrCreate({
      where: { name: '扫地' },
      defaults: { icon: '🧹', sort: 1 }
    });
    await TaskType.findOrCreate({
      where: { name: '洗碗' },
      defaults: { icon: '🍽️', sort: 2 }
    });
    await TaskType.findOrCreate({
      where: { name: '擦桌子' },
      defaults: { icon: '🧽', sort: 3 }
    });
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

module.exports = {
  sequelize,
  initDB,
  User,
  Family,
  FamilyMember,
  HouseworkTask,
  TaskType,
  Rotation,
  CheckinRecord,
  PointsRecord,
  PointsRule,
};

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const { CheckinRecord, HouseworkTask, Rotation, User, FamilyMember, PointsRecord } = require('../models');

router.post('/', auth, [
  body('taskId').isInt(),
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { taskId, rotationId, images, remark } = req.body;

    const task = await HouseworkTask.findOne({
      where: { id: taskId, familyId: myMember.familyId, status: 'active' },
    });

    if (!task) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    const checkin = await CheckinRecord.create({
      familyId: myMember.familyId,
      userId: req.user.id,
      taskId,
      rotationId: rotationId || null,
      images,
      remark,
      points: task.points,
      status: 'pending',
    }, { transaction });

    await transaction.commit();

    res.json({ success: true, data: checkin });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: '打卡失败' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { status, userId, page = 1, pageSize = 20 } = req.query;
    const where = { familyId: myMember.familyId };
    
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await CheckinRecord.findAndCountAll({
      where,
      include: [
        { model: HouseworkTask },
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
        { model: User, as: 'checker', attributes: ['id', 'nickname', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset,
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { status, page = 1, pageSize = 20 } = req.query;
    const where = { familyId: myMember.familyId, userId: req.user.id };
    
    if (status) where.status = status;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await CheckinRecord.findAndCountAll({
      where,
      include: [{ model: HouseworkTask, include: [{ model: require('../models').TaskType }] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset,
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.post('/:id/approve', auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const checkin = await CheckinRecord.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!checkin) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: '打卡记录不存在' });
    }

    if (checkin.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: '记录已处理' });
    }

    await checkin.update({
      status: 'approved',
      checkedBy: req.user.id,
      checkedAt: new Date(),
    }, { transaction });

    const user = await User.findOne({ where: { id: checkin.userId } });
    const newBalance = user.totalPoints + checkin.points;
    
    await user.update({ totalPoints: newBalance }, { transaction });

    await PointsRecord.create({
      userId: checkin.userId,
      familyId: myMember.familyId,
      type: 'earn',
      amount: checkin.points,
      balance: newBalance,
      sourceType: 'checkin',
      sourceId: checkin.id,
      description: '完成家务打卡',
    }, { transaction });

    await transaction.commit();

    res.json({ success: true, data: checkin });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: '审核失败' });
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const checkin = await CheckinRecord.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!checkin) {
      return res.status(404).json({ success: false, message: '打卡记录不存在' });
    }

    if (checkin.status !== 'pending') {
      return res.status(400).json({ success: false, message: '记录已处理' });
    }

    await checkin.update({
      status: 'rejected',
      checkedBy: req.user.id,
      checkedAt: new Date(),
    });

    res.json({ success: true, data: checkin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '审核失败' });
  }
});

module.exports = router;

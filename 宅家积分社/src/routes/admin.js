const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const { TaskType, PointsRule, FamilyMember, User, PointsRecord } = require('../models');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const [memberCount, taskTypes, pointsRules] = await Promise.all([
      FamilyMember.count({ where: { familyId: myMember.familyId, status: 'active' } }),
      TaskType.findAll({ where: { status: 'active' }, order: [['sort', 'ASC']] }),
      PointsRule.findAll({ where: { status: 'active' } }),
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          memberCount,
          taskTypeCount: taskTypes.length,
          pointsRuleCount: pointsRules.length,
        },
        taskTypes,
        pointsRules,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.post('/task-types', auth, [
  body('name').isLength({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { name, icon, color, sort } = req.body;
    const taskType = await TaskType.create({
      name,
      icon,
      color,
      sort: sort || 0,
      status: 'active',
    });

    res.json({ success: true, data: taskType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

router.put('/task-types/:id', auth, [
  body('name').optional().isLength({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const taskType = await TaskType.findByPk(req.params.id);
    if (!taskType) {
      return res.status(404).json({ success: false, message: '任务类型不存在' });
    }

    const { name, icon, color, sort, status } = req.body;
    await taskType.update({ name, icon, color, sort, status });

    res.json({ success: true, data: taskType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.delete('/task-types/:id', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const taskType = await TaskType.findByPk(req.params.id);
    if (!taskType) {
      return res.status(404).json({ success: false, message: '任务类型不存在' });
    }

    await taskType.update({ status: 'inactive' });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

router.post('/points-rules', auth, [
  body('name').isLength({ min: 1, max: 100 }),
  body('type').isLength({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { name, type, basePoints, multiplier, condition } = req.body;
    const pointsRule = await PointsRule.create({
      name,
      type,
      basePoints: basePoints || 0,
      multiplier: multiplier || 1.0,
      condition,
      status: 'active',
    });

    res.json({ success: true, data: pointsRule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

router.put('/points-rules/:id', auth, [
  body('name').optional().isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const pointsRule = await PointsRule.findByPk(req.params.id);
    if (!pointsRule) {
      return res.status(404).json({ success: false, message: '积分规则不存在' });
    }

    const { name, type, basePoints, multiplier, condition, status } = req.body;
    await pointsRule.update({ name, type, basePoints, multiplier, condition, status });

    res.json({ success: true, data: pointsRule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.delete('/points-rules/:id', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const pointsRule = await PointsRule.findByPk(req.params.id);
    if (!pointsRule) {
      return res.status(404).json({ success: false, message: '积分规则不存在' });
    }

    await pointsRule.update({ status: 'inactive' });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

router.put('/members/:userId/role', auth, [
  body('role').isIn(['admin', 'member']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const member = await FamilyMember.findOne({
      where: { userId: req.params.userId, familyId: myMember.familyId, status: 'active' },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: '成员不存在' });
    }

    await member.update({ role: req.body.role });

    res.json({ success: true, data: member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.post('/adjust-points', auth, [
  body('userId').isInt(),
  body('amount').isInt(),
  body('description').isLength({ max: 255 }),
], async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { userId, amount, description } = req.body;

    const targetMember = await FamilyMember.findOne({
      where: { userId, familyId: myMember.familyId, status: 'active' },
    });

    if (!targetMember) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: '成员不存在' });
    }

    const user = await User.findByPk(userId);
    const newBalance = user.totalPoints + amount;
    
    await user.update({ totalPoints: newBalance }, { transaction });

    const pointsRecord = await PointsRecord.create({
      userId,
      familyId: myMember.familyId,
      type: 'adjust',
      amount,
      balance: newBalance,
      sourceType: 'admin',
      sourceId: req.user.id,
      description: description || '管理员调整积分',
    }, { transaction });

    await transaction.commit();

    res.json({ success: true, data: pointsRecord });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: '调整失败' });
  }
});

module.exports = router;

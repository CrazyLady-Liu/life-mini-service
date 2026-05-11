const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const auth = require('../middleware/auth');
const { Rotation, HouseworkTask, User, FamilyMember } = require('../models');

router.post('/', auth, [
  body('taskId').isInt(),
  body('userId').isInt(),
  body('startDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { taskId, userId, startDate, endDate } = req.body;

    const task = await HouseworkTask.findOne({
      where: { id: taskId, familyId: myMember.familyId, status: 'active' },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    const targetMember = await FamilyMember.findOne({
      where: { userId, familyId: myMember.familyId, status: 'active' },
    });

    if (!targetMember) {
      return res.status(400).json({ success: false, message: '用户不在当前家庭' });
    }

    const rotation = await Rotation.create({
      familyId: myMember.familyId,
      taskId,
      userId,
      startDate: dayjs(startDate).toDate(),
      endDate: endDate ? dayjs(endDate).toDate() : null,
      assignedBy: req.user.id,
      assignmentType: 'manual',
      status: 'pending',
    });

    res.json({ success: true, data: rotation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '分配失败' });
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

    const { status, userId, startDate } = req.query;
    const where = { familyId: myMember.familyId };
    
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate) {
      where.startDate = { [require('sequelize').Op.gte]: dayjs(startDate).toDate() };
    }

    const rotations = await Rotation.findAll({
      where,
      include: [
        { model: HouseworkTask },
        { model: User, attributes: ['id', 'nickname', 'avatar'] },
      ],
      order: [['startDate', 'DESC']],
    });

    res.json({ success: true, data: rotations });
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

    const { status } = req.query;
    const where = { familyId: myMember.familyId, userId: req.user.id };
    
    if (status) where.status = status;

    const rotations = await Rotation.findAll({
      where,
      include: [{ model: HouseworkTask, include: [{ model: require('../models').TaskType }] }],
      order: [['startDate', 'DESC']],
    });

    res.json({ success: true, data: rotations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const rotation = await Rotation.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!rotation) {
      return res.status(404).json({ success: false, message: '轮值记录不存在' });
    }

    if (rotation.userId !== req.user.id && myMember.role !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    await rotation.update({ status: req.body.status });

    res.json({ success: true, data: rotation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const rotation = await Rotation.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!rotation) {
      return res.status(404).json({ success: false, message: '轮值记录不存在' });
    }

    await rotation.destroy();

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

router.post('/auto-generate', auth, [
  body('taskId').isInt(),
  body('startDate').isISO8601(),
  body('cycle').isIn(['daily', 'weekly']),
  body('duration').isInt({ min: 1 }),
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

    const { taskId, startDate, cycle, duration } = req.body;

    const task = await HouseworkTask.findOne({
      where: { id: taskId, familyId: myMember.familyId, status: 'active' },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    const members = await FamilyMember.findAll({
      where: { familyId: myMember.familyId, status: 'active' },
      attributes: ['userId'],
    });

    const userIds = members.map(m => m.userId);
    if (userIds.length === 0) {
      return res.status(400).json({ success: false, message: '家庭没有成员' });
    }

    const rotations = [];
    let currentDate = dayjs(startDate);
    
    for (let i = 0; i < duration; i++) {
      const userId = userIds[i % userIds.length];
      const start = currentDate.toDate();
      let end = null;

      if (cycle === 'daily') {
        end = currentDate.endOf('day').toDate();
        currentDate = currentDate.add(1, 'day');
      } else if (cycle === 'weekly') {
        end = currentDate.endOf('week').toDate();
        currentDate = currentDate.add(1, 'week');
      }

      const rotation = await Rotation.create({
        familyId: myMember.familyId,
        taskId,
        userId,
        startDate: start,
        endDate: end,
        assignedBy: req.user.id,
        assignmentType: 'auto',
        status: 'pending',
      });

      rotations.push(rotation);
    }

    res.json({ success: true, data: rotations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '自动分配失败' });
  }
});

module.exports = router;

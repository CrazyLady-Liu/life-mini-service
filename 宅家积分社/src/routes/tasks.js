const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const { HouseworkTask, TaskType, FamilyMember } = require('../models');

router.post('/types', auth, [
  body('name').isLength({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { name, icon, color, sort } = req.body;

    const taskType = await TaskType.create({
      name,
      icon,
      color,
      sort: sort || 0,
    });

    res.json({ success: true, data: taskType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

router.get('/types', auth, async (req, res) => {
  try {
    const taskTypes = await TaskType.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC']],
    });

    res.json({ success: true, data: taskTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.post('/', auth, [
  body('name').isLength({ min: 1, max: 100 }),
  body('taskTypeId').isInt(),
  body('cycleType').isIn(['once', 'daily', 'weekly', 'biweekly', 'monthly']),
  body('points').isInt({ min: 0 }),
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

    const {
      name, taskTypeId, description, cycleType, cycleValue, cycleConfig,
      points, weight, difficulty, tags, duration, standard, requirement,
      reminderTime, reminderEnabled
    } = req.body;

    const task = await HouseworkTask.create({
      familyId: myMember.familyId,
      taskTypeId,
      name,
      description,
      cycleType,
      cycleValue,
      cycleConfig,
      points,
      weight: weight || 1,
      difficulty: difficulty || 'medium',
      tags,
      duration,
      standard,
      requirement,
      reminderTime,
      reminderEnabled: reminderEnabled || false,
      creatorId: req.user.id,
    });

    const createdTask = await HouseworkTask.findByPk(task.id, {
      include: [{ model: TaskType }]
    });

    res.json({ success: true, data: createdTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

router.post('/batch', auth, [
  body('tasks').isArray({ min: 1 }),
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

    const { tasks } = req.body;
    const createdTasks = [];

    for (const taskData of tasks) {
      const {
        name, taskTypeId, description, cycleType, cycleValue, cycleConfig,
        points, weight, difficulty, tags, duration, standard, requirement,
        reminderTime, reminderEnabled
      } = taskData;

      const task = await HouseworkTask.create({
        familyId: myMember.familyId,
        taskTypeId,
        name,
        description,
        cycleType,
        cycleValue,
        cycleConfig,
        points,
        weight: weight || 1,
        difficulty: difficulty || 'medium',
        tags,
        duration,
        standard,
        requirement,
        reminderTime,
        reminderEnabled: reminderEnabled || false,
        creatorId: req.user.id,
      }, { transaction });

      createdTasks.push(task);
    }

    await transaction.commit();

    const tasksWithType = await HouseworkTask.findAll({
      where: { id: createdTasks.map(t => t.id) },
      include: [{ model: TaskType }]
    });

    res.json({ success: true, data: tasksWithType });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: '批量创建失败' });
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

    const { taskTypeId, difficulty, cycleType, status } = req.query;
    const where = { familyId: myMember.familyId };
    
    if (status) where.status = status;
    if (taskTypeId) where.taskTypeId = taskTypeId;
    if (difficulty) where.difficulty = difficulty;
    if (cycleType) where.cycleType = cycleType;

    const tasks = await HouseworkTask.findAll({
      where,
      include: [{ model: TaskType }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const task = await HouseworkTask.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
      include: [{ model: TaskType }],
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.put('/:id', auth, [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('points').optional().isInt({ min: 0 }),
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

    const task = await HouseworkTask.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    const {
      name, taskTypeId, description, cycleType, cycleValue, cycleConfig,
      points, weight, difficulty, tags, duration, standard, requirement,
      reminderTime, reminderEnabled, status
    } = req.body;

    await task.update({
      name, taskTypeId, description, cycleType, cycleValue, cycleConfig,
      points, weight, difficulty, tags, duration, standard, requirement,
      reminderTime, reminderEnabled, status
    });

    const updatedTask = await HouseworkTask.findByPk(task.id, {
      include: [{ model: TaskType }]
    });

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const task = await HouseworkTask.findOne({
      where: { id: req.params.id, familyId: myMember.familyId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    await task.update({ status: 'inactive' });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

module.exports = router;

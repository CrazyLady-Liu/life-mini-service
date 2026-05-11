const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const auth = require('../middleware/auth');
const { CheckinRecord, HouseworkTask, FamilyMember, PointsRecord } = require('../models');

router.get('/statistics', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const today = dayjs().startOf('day');
    const thisWeek = dayjs().startOf('week');
    const thisMonth = dayjs().startOf('month');

    const [todayCount, weekCount, monthCount, totalPoints] = await Promise.all([
      CheckinRecord.count({
        where: {
          userId: req.user.id,
          familyId: myMember.familyId,
          status: 'approved',
          createdAt: { [Op.gte]: today.toDate() },
        },
      }),
      CheckinRecord.count({
        where: {
          userId: req.user.id,
          familyId: myMember.familyId,
          status: 'approved',
          createdAt: { [Op.gte]: thisWeek.toDate() },
        },
      }),
      CheckinRecord.count({
        where: {
          userId: req.user.id,
          familyId: myMember.familyId,
          status: 'approved',
          createdAt: { [Op.gte]: thisMonth.toDate() },
        },
      }),
      CheckinRecord.sum('points', {
        where: {
          userId: req.user.id,
          familyId: myMember.familyId,
          status: 'approved',
        },
      }),
    ]);

    const recentCheckins = await CheckinRecord.findAll({
      where: {
        userId: req.user.id,
        familyId: myMember.familyId,
      },
      include: [{ model: HouseworkTask }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        statistics: {
          today: todayCount,
          week: weekCount,
          month: monthCount,
          totalPoints: totalPoints || 0,
        },
        recentCheckins,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.get('/checkin-history', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { startDate, endDate, status, page = 1, pageSize = 20 } = req.query;
    const where = { userId: req.user.id, familyId: myMember.familyId };
    
    if (status) where.status = status;
    if (startDate) where.createdAt = { [Op.gte]: dayjs(startDate).toDate() };
    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: dayjs(endDate).endOf('day').toDate(),
      };
    }

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

router.get('/points-history', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { type, page = 1, pageSize = 20 } = req.query;
    const where = { userId: req.user.id, familyId: myMember.familyId };
    
    if (type) where.type = type;

    const offset = (page - 1) * pageSize;
    const { count, rows } = await PointsRecord.findAndCountAll({
      where,
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

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PointsRecord, User, FamilyMember } = require('../models');

router.get('/ranking', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const familyMembers = await FamilyMember.findAll({
      where: { familyId: myMember.familyId, status: 'active' },
      include: [{ model: User, attributes: ['id', 'nickname', 'avatar', 'totalPoints'] }],
    });

    const ranking = familyMembers
      .map(m => m.User)
      .filter(u => u)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
      }));

    res.json({ success: true, data: ranking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.get('/records', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (!myMember) {
      return res.status(400).json({ success: false, message: '请先加入家庭' });
    }

    const { type, page = 1, pageSize = 20 } = req.query;
    const where = { familyId: myMember.familyId, userId: req.user.id };
    
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

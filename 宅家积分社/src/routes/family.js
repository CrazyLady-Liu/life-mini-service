const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { Family, FamilyMember, User } = require('../models');

const generateInviteCode = () => {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
};

router.post('/create', auth, [
  body('name').isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { name } = req.body;

    const existingMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: '您已加入其他家庭' });
    }

    const family = await Family.create({
      name,
      creatorId: req.user.id,
      inviteCode: generateInviteCode(),
    });

    await FamilyMember.create({
      familyId: family.id,
      userId: req.user.id,
      role: 'admin',
      status: 'active',
    });

    res.json({ success: true, data: family });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

router.post('/join', auth, [
  body('inviteCode').isLength({ min: 6, max: 20 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { inviteCode } = req.body;

    const family = await Family.findOne({ where: { inviteCode } });
    if (!family) {
      return res.status(400).json({ success: false, message: '邀请码无效' });
    }

    const existingMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: ['active', 'pending'] },
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: '您已加入或申请加入其他家庭' });
    }

    await FamilyMember.create({
      familyId: family.id,
      userId: req.user.id,
      role: 'member',
      status: 'pending',
    });

    res.json({ success: true, message: '申请已提交，请等待审核' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '加入失败' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active' },
      include: [
        { model: Family, as: 'family' },
      ],
    });

    if (!member) {
      return res.json({ success: true, data: null });
    }

    const familyMembers = await FamilyMember.findAll({
      where: { familyId: member.familyId, status: 'active' },
      include: [{ model: User, attributes: ['id', 'nickname', 'avatar', 'totalPoints'] }],
    });

    res.json({
      success: true,
      data: {
        family: member.family,
        myRole: member.role,
        members: familyMembers.map(m => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          user: m.user,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.get('/pending', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const pendingMembers = await FamilyMember.findAll({
      where: { familyId: myMember.familyId, status: 'pending' },
      include: [{ model: User, attributes: ['id', 'nickname', 'avatar', 'phone'] }],
    });

    res.json({
      success: true,
      data: pendingMembers.map(m => ({
        id: m.id,
        userId: m.userId,
        user: m.user,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.post('/approve/:memberId', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const member = await FamilyMember.findOne({
      where: { id: req.params.memberId, familyId: myMember.familyId, status: 'pending' },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: '申请不存在' });
    }

    await member.update({ status: 'active' });

    res.json({ success: true, message: '已通过申请' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

router.post('/reject/:memberId', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const member = await FamilyMember.findOne({
      where: { id: req.params.memberId, familyId: myMember.familyId, status: 'pending' },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: '申请不存在' });
    }

    await member.update({ status: 'inactive' });

    res.json({ success: true, message: '已拒绝申请' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

router.put('/refresh-code', auth, async (req, res) => {
  try {
    const myMember = await FamilyMember.findOne({
      where: { userId: req.user.id, status: 'active', role: 'admin' },
      include: [{ model: Family, as: 'family' }],
    });

    if (!myMember) {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    await myMember.family.update({ inviteCode: generateInviteCode() });

    res.json({ success: true, data: { inviteCode: myMember.family.inviteCode } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '刷新失败' });
  }
});

module.exports = router;

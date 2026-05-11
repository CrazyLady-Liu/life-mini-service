const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { User, VerificationCode } = require('../models');

const generateCode = () => {
  return Math.random().toString().slice(2, 8);
};

router.post('/send-code', [
  body('phone').isMobilePhone('zh-CN'),
  body('type').isIn(['login', 'register']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { phone, type } = req.body;

    const code = generateCode();
    const expiresAt = dayjs().add(5, 'minute').toDate();

    await VerificationCode.create({
      phone,
      code,
      type,
      expiresAt,
    });

    console.log(`发送验证码到 ${phone}: ${code}`);

    res.json({ success: true, message: '验证码已发送', code: process.env.NODE_ENV === 'development' ? code : undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '发送失败' });
  }
});

router.post('/login', [
  body('loginType').isIn(['phone', 'username']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { loginType, phone, code, username, password } = req.body;
    let user;

    if (loginType === 'phone') {
      if (!phone || !code) {
        return res.status(400).json({ success: false, message: '请提供手机号和验证码' });
      }

      const verificationCode = await VerificationCode.findOne({
        where: {
          phone,
          code,
          type: 'login',
          used: false,
        },
      });

      if (!verificationCode || dayjs(verificationCode.expiresAt).isBefore(dayjs())) {
        return res.status(400).json({ success: false, message: '验证码无效或已过期' });
      }

      await verificationCode.update({ used: true });

      user = await User.findOne({ where: { phone } });
      
      if (!user) {
        user = await User.create({
          phone,
          nickname: `用户${phone.slice(-4)}`,
        });
      }
    } else if (loginType === 'username') {
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '请提供用户名和密码' });
      }

      user = await User.findOne({ 
        where: { 
          [require('sequelize').Op.or]: [
            { username },
            { phone: username }
          ]
        }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' });
      }

      if (!user.password) {
        return res.status(400).json({ success: false, message: '该账号未设置密码，请使用验证码登录' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, message: '密码错误' });
      }
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
});

router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }),
  body('password').isLength({ min: 6, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { username, password, phone, nickname } = req.body;

    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { phone }
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名或手机号已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      phone,
      nickname: nickname || username,
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '注册失败' });
  }
});

router.put('/password', auth, [
  body('oldPassword').optional(),
  body('newPassword').isLength({ min: 6, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    if (req.user.password) {
      const isValid = await bcrypt.compare(oldPassword, req.user.password);
      if (!isValid) {
        return res.status(400).json({ success: false, message: '原密码错误' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await req.user.update({ password: hashedPassword });

    res.json({ success: true, message: '密码设置成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '密码设置失败' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        phone: req.user.phone,
        username: req.user.username,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        totalPoints: req.user.totalPoints,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

router.put('/profile', auth, [
  body('nickname').optional().isLength({ max: 50 }),
  body('avatar').optional().isURL(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: '参数错误', errors: errors.array() });
    }

    const { nickname, avatar } = req.body;
    await req.user.update({ nickname, avatar });

    res.json({
      success: true,
      data: {
        id: req.user.id,
        phone: req.user.phone,
        username: req.user.username,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        totalPoints: req.user.totalPoints,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

module.exports = router;

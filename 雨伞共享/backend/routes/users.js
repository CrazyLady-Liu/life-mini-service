const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const DEPOSIT_AMOUNT = 99;

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    const wechatRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = wechatRes.data;
    
    let user = await User.findOne({ openid });
    if (!user) {
      user = new User({ openid });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { userId, nickname, avatar, phone } = req.body;
    const user = await User.findByIdAndUpdate(userId, { nickname, avatar, phone }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deposit', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    user.deposit += DEPOSIT_AMOUNT;
    await user.save();
    res.json({ message: '押金充值成功', deposit: user.deposit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refund', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (user.currentOrder) {
      return res.status(400).json({ error: '有进行中的订单，无法退还押金' });
    }
    const refundAmount = user.deposit;
    user.deposit = 0;
    await user.save();
    res.json({ message: '押金退还成功', amount: refundAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

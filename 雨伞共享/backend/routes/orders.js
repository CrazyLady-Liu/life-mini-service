const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Umbrella = require('../models/Umbrella');
const Station = require('../models/Station');

const HOURLY_RATE = 2;
const DEPOSIT_AMOUNT = 99;

router.post('/borrow', async (req, res) => {
  try {
    const { userId, umbrellaCode, stationId } = req.body;
    
    const user = await User.findById(userId);
    if (user.currentOrder) {
      return res.status(400).json({ error: '您有进行中的订单' });
    }
    if (!user.isFreeDeposit && user.deposit < DEPOSIT_AMOUNT) {
      return res.status(400).json({ error: '押金不足，请先充值押金' });
    }

    const umbrella = await Umbrella.findOne({ code: umbrellaCode });
    if (!umbrella || umbrella.status !== 'available') {
      return res.status(400).json({ error: '雨伞不可用' });
    }

    const order = new Order({
      user: userId,
      umbrella: umbrella._id,
      borrowStation: stationId,
      deposit: user.isFreeDeposit ? 0 : DEPOSIT_AMOUNT
    });
    await order.save();

    umbrella.status = 'in_use';
    umbrella.station = null;
    await umbrella.save();

    await Station.findByIdAndUpdate(stationId, { $inc: { availableCount: -1 } });

    user.currentOrder = order._id;
    await user.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/return', async (req, res) => {
  try {
    const { userId, umbrellaCode, stationId } = req.body;
    
    const user = await User.findById(userId);
    if (!user.currentOrder) {
      return res.status(400).json({ error: '没有进行中的订单' });
    }

    const order = await Order.findById(user.currentOrder).populate('umbrella');
    if (order.umbrella.code !== umbrellaCode) {
      return res.status(400).json({ error: '雨伞不匹配' });
    }

    const returnTime = new Date();
    const duration = Math.ceil((returnTime - order.borrowTime) / (1000 * 60 * 60));
    const cost = duration * HOURLY_RATE;

    order.returnTime = returnTime;
    order.returnStation = stationId;
    order.duration = duration;
    order.cost = cost;
    order.status = 'completed';
    await order.save();

    const umbrella = await Umbrella.findById(order.umbrella._id);
    umbrella.status = 'available';
    umbrella.station = stationId;
    umbrella.usageCount += 1;
    await umbrella.save();

    await Station.findByIdAndUpdate(stationId, { $inc: { availableCount: 1 } });

    user.currentOrder = null;
    await user.save();

    res.json({ order, cost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const query = { user: userId };
    if (status) query.status = status;
    const orders = await Order.find(query)
      .populate('umbrella borrowStation returnStation')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/current/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user.currentOrder) {
      return res.json(null);
    }
    const order = await Order.findById(user.currentOrder)
      .populate('umbrella borrowStation');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const orders = await Order.find(query)
      .populate('user umbrella borrowStation returnStation')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/exception', async (req, res) => {
  try {
    const { exceptionReason } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'exception', exceptionReason },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

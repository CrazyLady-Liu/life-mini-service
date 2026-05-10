const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Station = require('../models/Station');
const Umbrella = require('../models/Umbrella');
const User = require('../models/User');

router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStations = await Station.countDocuments({ status: 'active' });
    const totalUmbrellas = await Umbrella.countDocuments();
    const availableUmbrellas = await Umbrella.countDocuments({ status: 'available' });
    const inUseUmbrellas = await Umbrella.countDocuments({ status: 'in_use' });
    const totalOrders = await Order.countDocuments();
    const ongoingOrders = await Order.countDocuments({ status: 'ongoing' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.cost || 0), 0);

    res.json({
      totalUsers,
      totalStations,
      totalUmbrellas,
      availableUmbrellas,
      inUseUmbrellas,
      totalOrders,
      ongoingOrders,
      todayOrders: todayOrders.length,
      todayRevenue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const orders = await Order.find({ 
      createdAt: { $gte: startDate },
      status: 'completed'
    });
    
    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      dailyStats[date].revenue += order.cost || 0;
    });

    const data = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const stations = await Station.find().populate({
      path: 'umbrellas',
      match: { status: 'in_use' }
    });

    const stationStats = stations.map(station => ({
      id: station._id,
      name: station.name,
      capacity: station.capacity,
      available: station.availableCount,
      usageRate: station.capacity > 0 
        ? ((station.capacity - station.availableCount) / station.capacity * 100).toFixed(1) 
        : 0
    }));

    res.json(stationStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

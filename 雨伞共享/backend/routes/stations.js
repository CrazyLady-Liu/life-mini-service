const express = require('express');
const router = express.Router();
const Station = require('../models/Station');

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 3000 } = req.query;
    const stations = await Station.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      },
      status: 'active'
    });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const stations = await Station.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, address, lng, lat, capacity } = req.body;
    const station = new Station({
      name,
      address,
      location: { type: 'Point', coordinates: [lng, lat] },
      capacity
    });
    await station.save();
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, address, lng, lat, capacity, status } = req.body;
    const updateData = { name, address, capacity, status };
    if (lng && lat) {
      updateData.location = { type: 'Point', coordinates: [lng, lat] };
    }
    const station = await Station.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(station);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

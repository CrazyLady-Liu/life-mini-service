const express = require('express');
const router = express.Router();
const Umbrella = require('../models/Umbrella');
const Station = require('../models/Station');

router.get('/', async (req, res) => {
  try {
    const { station, status } = req.query;
    const query = {};
    if (station) query.station = station;
    if (status) query.status = status;
    const umbrellas = await Umbrella.find(query).populate('station');
    res.json(umbrellas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/code/:code', async (req, res) => {
  try {
    const umbrella = await Umbrella.findOne({ code: req.params.code }).populate('station');
    if (!umbrella) {
      return res.status(404).json({ error: '雨伞不存在' });
    }
    res.json(umbrella);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { code, station } = req.body;
    const umbrella = new Umbrella({ code, station });
    await umbrella.save();
    
    if (station) {
      await Station.findByIdAndUpdate(station, { $inc: { availableCount: 1 } });
    }
    
    res.json(umbrella);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, station, battery } = req.body;
    const umbrella = await Umbrella.findByIdAndUpdate(
      req.params.id,
      { status, station, battery },
      { new: true }
    );
    res.json(umbrella);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const umbrella = await Umbrella.findById(req.params.id);
    if (umbrella.station && umbrella.status === 'available') {
      await Station.findByIdAndUpdate(umbrella.station, { $inc: { availableCount: -1 } });
    }
    await Umbrella.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

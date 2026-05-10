const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.post('/', (req, res) => {
  try {
    const id = Transaction.create(req.body);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', (req, res) => {
  try {
    const filters = {};
    if (req.query.month) filters.month = req.query.month;
    if (req.query.type) filters.type = req.query.type;
    if (req.query.category) filters.category = req.query.category;
    
    const transactions = Transaction.findAll(filters);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const transaction = Transaction.findById(req.params.id);
    if (transaction) {
      res.json({ success: true, data: transaction });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = Transaction.update(req.params.id, req.body);
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = Transaction.delete(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats/monthly/:month', (req, res) => {
  try {
    const stats = Transaction.getMonthlyStats(req.params.month);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats/category/:month/:type', (req, res) => {
  try {
    const stats = Transaction.getCategoryStats(req.params.month, req.params.type);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

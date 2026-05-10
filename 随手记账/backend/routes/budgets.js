const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

router.post('/', (req, res) => {
  try {
    const id = Budget.create(req.body);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:month', (req, res) => {
  try {
    const budgets = Budget.findAll(req.params.month);
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status/:month', (req, res) => {
  try {
    const status = Budget.getBudgetStatus(req.params.month);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/detail/:id', (req, res) => {
  try {
    const budget = Budget.findById(req.params.id);
    if (budget) {
      res.json({ success: true, data: budget });
    } else {
      res.status(404).json({ success: false, error: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = Budget.update(req.params.id, req.body);
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = Budget.delete(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Budget not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

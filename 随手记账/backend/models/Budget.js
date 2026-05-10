const db = require('../utils/database');

class Budget {
  static create(budget) {
    const stmt = db.prepare(`
      INSERT INTO budgets (category, amount, month)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(budget.category, budget.amount, budget.month);
    return result.lastInsertRowid;
  }

  static findAll(month) {
    const stmt = db.prepare('SELECT * FROM budgets WHERE month = ?');
    return stmt.all(month);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM budgets WHERE id = ?');
    return stmt.get(id);
  }

  static findByCategoryAndMonth(category, month) {
    const stmt = db.prepare('SELECT * FROM budgets WHERE category = ? AND month = ?');
    return stmt.get(category, month);
  }

  static update(id, budget) {
    const stmt = db.prepare(`
      UPDATE budgets
      SET category = ?, amount = ?, month = ?
      WHERE id = ?
    `);
    const result = stmt.run(budget.category, budget.amount, budget.month, id);
    return result.changes > 0;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM budgets WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getBudgetStatus(month) {
    const budgets = this.findAll(month);
    const Transaction = require('./Transaction');
    const expenses = Transaction.getCategoryStats(month, 'expense');
    
    const expenseMap = {};
    expenses.forEach(exp => {
      expenseMap[exp.category] = exp.total;
    });

    return budgets.map(budget => ({
      ...budget,
      spent: expenseMap[budget.category] || 0,
      remaining: budget.amount - (expenseMap[budget.category] || 0)
    }));
  }
}

module.exports = Budget;

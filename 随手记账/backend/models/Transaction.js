const db = require('../utils/database');

class Transaction {
  static create(transaction) {
    const stmt = db.prepare(`
      INSERT INTO transactions (type, category, amount, description, date)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      transaction.type,
      transaction.category,
      transaction.amount,
      transaction.description,
      transaction.date
    );
    return result.lastInsertRowid;
  }

  static findAll(filters = {}) {
    let query = 'SELECT * FROM transactions';
    const params = [];
    const conditions = [];

    if (filters.month) {
      conditions.push('date LIKE ?');
      params.push(`${filters.month}%`);
    }
    if (filters.type) {
      conditions.push('type = ?');
      params.push(filters.type);
    }
    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    return stmt.get(id);
  }

  static update(id, transaction) {
    const stmt = db.prepare(`
      UPDATE transactions
      SET type = ?, category = ?, amount = ?, description = ?, date = ?
      WHERE id = ?
    `);
    const result = stmt.run(
      transaction.type,
      transaction.category,
      transaction.amount,
      transaction.description,
      transaction.date,
      id
    );
    return result.changes > 0;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getMonthlyStats(month) {
    const stmt = db.prepare(`
      SELECT 
        type,
        SUM(amount) as total
      FROM transactions
      WHERE date LIKE ?
      GROUP BY type
    `);
    return stmt.all(`${month}%`);
  }

  static getCategoryStats(month, type) {
    const stmt = db.prepare(`
      SELECT 
        category,
        SUM(amount) as total
      FROM transactions
      WHERE date LIKE ? AND type = ?
      GROUP BY category
    `);
    return stmt.all(`${month}%`, type);
  }
}

module.exports = Transaction;

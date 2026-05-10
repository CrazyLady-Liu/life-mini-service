const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const dataDir = path.join(__dirname, 'data')
const dataFile = path.join(dataDir, 'expense.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

function readData() {
  if (!fs.existsSync(dataFile)) {
    return { transactions: [], budgets: [], nextId: 1 }
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'))
  } catch {
    return { transactions: [], budgets: [], nextId: 1 }
  }
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
}

app.get('/api/transactions', (req, res) => {
  const { month, type, category } = req.query
  const data = readData()
  let transactions = data.transactions

  if (month) {
    transactions = transactions.filter(t => t.date.startsWith(month))
  }
  if (type) {
    transactions = transactions.filter(t => t.type === type)
  }
  if (category) {
    transactions = transactions.filter(t => t.category === category)
  }

  transactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json({ success: true, data: transactions })
})

app.post('/api/transactions', (req, res) => {
  const data = readData()
  const transaction = {
    id: data.nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  }
  data.transactions.push(transaction)
  writeData(data)
  res.json({ success: true, id: transaction.id })
})

app.put('/api/transactions/:id', (req, res) => {
  const data = readData()
  const index = data.transactions.findIndex(t => t.id === parseInt(req.params.id))
  if (index > -1) {
    data.transactions[index] = { ...data.transactions[index], ...req.body }
    writeData(data)
    res.json({ success: true })
  } else {
    res.status(404).json({ success: false, error: 'Record not found' })
  }
})

app.delete('/api/transactions/:id', (req, res) => {
  const data = readData()
  const initialLength = data.transactions.length
  data.transactions = data.transactions.filter(t => t.id !== parseInt(req.params.id))
  if (data.transactions.length < initialLength) {
    writeData(data)
    res.json({ success: true })
  } else {
    res.status(404).json({ success: false, error: 'Record not found' })
  }
})

app.get('/api/transactions/stats/monthly/:month', (req, res) => {
  const data = readData()
  const month = req.params.month
  const transactions = data.transactions.filter(t => t.date.startsWith(month))

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  res.json({
    success: true,
    data: [
      { type: 'income', total: income },
      { type: 'expense', total: expense }
    ]
  })
})

app.get('/api/transactions/stats/category/:month/:type', (req, res) => {
  const data = readData()
  const { month, type } = req.params
  const transactions = data.transactions.filter(t => t.date.startsWith(month) && t.type === type)

  const categoryMap = {}
  transactions.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
  })

  const result = Object.entries(categoryMap).map(([category, total]) => ({ category, total }))
  res.json({ success: true, data: result })
})

app.get('/api/budgets/status/:month', (req, res) => {
  const data = readData()
  const month = req.params.month
  const budgets = data.budgets.filter(b => b.month === month)
  const transactions = data.transactions.filter(t => t.date.startsWith(month) && t.type === 'expense')

  const expenseMap = {}
  transactions.forEach(t => {
    expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount
  })

  const result = budgets.map(b => ({
    ...b,
    spent: expenseMap[b.category] || 0,
    remaining: b.amount - (expenseMap[b.category] || 0)
  }))

  res.json({ success: true, data: result })
})

app.get('/api/budgets/:month', (req, res) => {
  const data = readData()
  const budgets = data.budgets.filter(b => b.month === req.params.month)
  res.json({ success: true, data: budgets })
})

app.post('/api/budgets', (req, res) => {
  const data = readData()
  const budget = {
    id: data.nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  }
  data.budgets.push(budget)
  writeData(data)
  res.json({ success: true, id: budget.id })
})

app.put('/api/budgets/:id', (req, res) => {
  const data = readData()
  const index = data.budgets.findIndex(b => b.id === parseInt(req.params.id))
  if (index > -1) {
    data.budgets[index] = { ...data.budgets[index], ...req.body }
    writeData(data)
    res.json({ success: true })
  } else {
    res.status(404).json({ success: false, error: 'Budget not found' })
  }
})

app.delete('/api/budgets/:id', (req, res) => {
  const data = readData()
  const initialLength = data.budgets.length
  data.budgets = data.budgets.filter(b => b.id !== parseInt(req.params.id))
  if (data.budgets.length < initialLength) {
    writeData(data)
    res.json({ success: true })
  } else {
    res.status(404).json({ success: false, error: 'Budget not found' })
  }
})

app.get('/api/export/:month', (req, res) => {
  const data = readData()
  const month = req.params.month
  const transactions = data.transactions.filter(t => t.date.startsWith(month))

  let csv = '日期,类型,分类,金额,备注\n'
  transactions.forEach(t => {
    csv += `${t.date},${t.type === 'income' ? '收入' : '支出'},${t.category},${t.amount},${t.description || ''}\n`
  })

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=expenses_${month}.csv`)
  res.send(csv)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

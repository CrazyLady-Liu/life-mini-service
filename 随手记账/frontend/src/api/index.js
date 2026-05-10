import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

export const transactions = {
  getAll: (filters = {}) => api.get('/transactions', { params: filters }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getMonthlyStats: (month) => api.get(`/transactions/stats/monthly/${month}`),
  getCategoryStats: (month, type) => api.get(`/transactions/stats/category/${month}/${type}`)
}

export const budgets = {
  getAll: (month) => api.get(`/budgets/${month}`),
  getStatus: (month) => api.get(`/budgets/status/${month}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
}

export const exportCSV = (month) => {
  window.open(`http://localhost:3000/api/export/${month}`)
}

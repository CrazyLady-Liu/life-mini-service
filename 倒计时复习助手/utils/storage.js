const util = require('./util.js')

const STORAGE_KEYS = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  COUNTDOWNS: 'countdowns',
  PLANS: 'plans'
}

const getUsers = () => {
  return wx.getStorageSync(STORAGE_KEYS.USERS) || []
}

const saveUsers = (users) => {
  wx.setStorageSync(STORAGE_KEYS.USERS, users)
}

const registerUser = (studentName, studentId, password) => {
  const users = getUsers()
  const existingUser = users.find(u => u.studentId === studentId)
  if (existingUser) {
    return { success: false, message: '该学号已被注册' }
  }
  const newUser = {
    id: util.generateId(),
    studentName,
    studentId,
    password,
    createdAt: util.formatTime(new Date())
  }
  users.push(newUser)
  saveUsers(users)
  return { success: true, user: newUser }
}

const loginUser = (studentId, password) => {
  const users = getUsers()
  const user = users.find(u => u.studentId === studentId && u.password === password)
  if (user) {
    wx.setStorageSync(STORAGE_KEYS.CURRENT_USER, user)
    return { success: true, user }
  }
  return { success: false, message: '学号或密码错误' }
}

const getCurrentUser = () => {
  return wx.getStorageSync(STORAGE_KEYS.CURRENT_USER)
}

const logoutUser = () => {
  wx.removeStorageSync(STORAGE_KEYS.CURRENT_USER)
}

const getCountdowns = (userId) => {
  const allCountdowns = wx.getStorageSync(STORAGE_KEYS.COUNTDOWNS) || []
  if (userId) {
    return allCountdowns.filter(c => c.userId === userId)
  }
  return allCountdowns
}

const saveCountdowns = (countdowns) => {
  wx.setStorageSync(STORAGE_KEYS.COUNTDOWNS, countdowns)
}

const addCountdown = (countdown) => {
  const countdowns = wx.getStorageSync(STORAGE_KEYS.COUNTDOWNS) || []
  const newCountdown = {
    ...countdown,
    id: util.generateId(),
    createdAt: util.formatTime(new Date())
  }
  countdowns.push(newCountdown)
  saveCountdowns(countdowns)
  return newCountdown
}

const deleteCountdown = (id) => {
  const countdowns = wx.getStorageSync(STORAGE_KEYS.COUNTDOWNS) || []
  const filtered = countdowns.filter(c => c.id !== id)
  saveCountdowns(filtered)
}

const getCountdownById = (id) => {
  const countdowns = wx.getStorageSync(STORAGE_KEYS.COUNTDOWNS) || []
  return countdowns.find(c => c.id === id)
}

const getPlans = (userId, date) => {
  const allPlans = wx.getStorageSync(STORAGE_KEYS.PLANS) || []
  let plans = allPlans
  if (userId) {
    plans = plans.filter(p => p.userId === userId)
  }
  if (date) {
    plans = plans.filter(p => p.date === date)
  }
  return plans.sort((a, b) => a.completed - b.completed)
}

const savePlans = (plans) => {
  wx.setStorageSync(STORAGE_KEYS.PLANS, plans)
}

const addPlan = (plan) => {
  const plans = wx.getStorageSync(STORAGE_KEYS.PLANS) || []
  const newPlan = {
    ...plan,
    id: util.generateId(),
    completed: false,
    createdAt: util.formatTime(new Date())
  }
  plans.push(newPlan)
  savePlans(plans)
  return newPlan
}

const togglePlanComplete = (id) => {
  const plans = wx.getStorageSync(STORAGE_KEYS.PLANS) || []
  const plan = plans.find(p => p.id === id)
  if (plan) {
    plan.completed = !plan.completed
    savePlans(plans)
  }
  return plan
}

const deletePlan = (id) => {
  const plans = wx.getStorageSync(STORAGE_KEYS.PLANS) || []
  const filtered = plans.filter(p => p.id !== id)
  savePlans(filtered)
}

const getPlanStats = (userId) => {
  const plans = getPlans(userId)
  const total = plans.length
  const completed = plans.filter(p => p.completed).length
  const incomplete = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  
  const today = util.formatDate(new Date())
  const todayPlans = plans.filter(p => p.date === today)
  const todayCompleted = todayPlans.filter(p => p.completed).length
  
  return {
    total,
    completed,
    incomplete,
    completionRate,
    todayTotal: todayPlans.length,
    todayCompleted
  }
}

module.exports = {
  STORAGE_KEYS,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getCountdowns,
  addCountdown,
  deleteCountdown,
  getCountdownById,
  getPlans,
  addPlan,
  togglePlanComplete,
  deletePlan,
  getPlanStats
}

const util = require('./util.js')

const STORAGE_KEYS = {
  COURSES: 'courses',
  SETTINGS: 'settings',
  REMINDER_LOG: 'reminderLog'
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00'
]

const hslToHex = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r, g, b
  
  if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  
  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const generateHarmonicColors = (count) => {
  const colors = []
  const saturation = 0.65
  const lightness = 0.6
  
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count + 15) % 360
    colors.push(hslToHex(hue, saturation, lightness))
  }
  
  return colors
}

const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#333333' : '#ffffff'
}

const initDefaultData = () => {
  const settings = getSettings()
  if (!settings.termStartDate) {
    const today = new Date()
    const termStart = new Date(today)
    termStart.setDate(today.getDate() - (today.getDay() || 7) - 7 * 4)
    settings.termStartDate = util.formatDate(termStart)
    settings.totalWeeks = 20
    saveSettings(settings)
  }
}

const getCourses = () => {
  return wx.getStorageSync(STORAGE_KEYS.COURSES) || []
}

const saveCourses = (courses) => {
  wx.setStorageSync(STORAGE_KEYS.COURSES, courses)
}

const addCourse = (course) => {
  const courses = getCourses()
  const newCourse = {
    ...course,
    id: util.generateId(),
    createdAt: util.formatTime(new Date()),
    updatedAt: util.formatTime(new Date())
  }
  courses.push(newCourse)
  saveCourses(courses)
  return newCourse
}

const updateCourse = (id, updates) => {
  const courses = getCourses()
  const index = courses.findIndex(c => c.id === id)
  if (index !== -1) {
    courses[index] = {
      ...courses[index],
      ...updates,
      updatedAt: util.formatTime(new Date())
    }
    saveCourses(courses)
    return courses[index]
  }
  return null
}

const deleteCourse = (id) => {
  const courses = getCourses()
  const filtered = courses.filter(c => c.id !== id)
  saveCourses(filtered)
  return filtered
}

const getCourseById = (id) => {
  const courses = getCourses()
  return courses.find(c => c.id === id)
}

const getCoursesByDate = (date) => {
  const courses = getCourses()
  const targetDate = new Date(date)
  const weekday = targetDate.getDay() || 7
  const weekNum = util.getWeekNumberByDate(date)
  
  return courses.filter(course => {
    if (course.weekday !== weekday) return false
    return util.isWeekInRange(weekNum, course.weekRange)
  })
}

const getCoursesByWeek = (weekNum) => {
  const courses = getCourses()
  return courses.filter(course => util.isWeekInRange(weekNum, course.weekRange))
}

const getWeekStats = (weekNum) => {
  const courses = getCoursesByWeek(weekNum)
  const stats = {
    total: 0,
    byDay: [0, 0, 0, 0, 0, 0, 0],
    byCourse: {},
    uniqueCourseNames: new Set()
  }
  
  courses.forEach(course => {
    const sectionCount = course.sections.length
    stats.total += sectionCount
    stats.byDay[course.weekday - 1] += sectionCount
    stats.uniqueCourseNames.add(course.name)
    if (!stats.byCourse[course.name]) {
      stats.byCourse[course.name] = 0
    }
    stats.byCourse[course.name] += sectionCount
  })
  
  stats.uniqueCourseCount = stats.uniqueCourseNames.size
  delete stats.uniqueCourseNames
  
  return stats
}

const getNextCourse = (fromDate = new Date()) => {
  const courses = getCourses()
  const currentTime = fromDate.getTime()
  let nextCourse = null
  let minDiff = Infinity
  
  courses.forEach(course => {
    const weekNum = util.getCurrentWeekNumber()
    if (!util.isWeekInRange(weekNum, course.weekRange)) return
    
    const today = fromDate.getDay() || 7
    const courseDate = new Date(fromDate)
    
    if (course.weekday >= today) {
      courseDate.setDate(courseDate.getDate() + (course.weekday - today))
    } else {
      courseDate.setDate(courseDate.getDate() + (7 - today + course.weekday))
    }
    
    const firstSection = Math.min.apply(null, course.sections)
    const timeSlot = util.getTimeSlot(firstSection - 1)
    const [hours, minutes] = timeSlot.start.split(':')
    courseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    const diff = courseDate.getTime() - currentTime
    if (diff > 0 && diff < minDiff) {
      minDiff = diff
      nextCourse = {
        ...course,
        nextTime: courseDate
      }
    }
  })
  
  return nextCourse
}

const DEFAULT_TIME_SLOTS = [
  { start: '08:00', end: '08:45', duration: 45, break: 10 },
  { start: '08:55', end: '09:40', duration: 45, break: 20 },
  { start: '10:00', end: '10:45', duration: 45, break: 10 },
  { start: '10:55', end: '11:40', duration: 45, break: 140 },
  { start: '14:00', end: '14:45', duration: 45, break: 10 },
  { start: '14:55', end: '15:40', duration: 45, break: 20 },
  { start: '16:00', end: '16:45', duration: 45, break: 10 },
  { start: '16:55', end: '17:40', duration: 45, break: 80 },
  { start: '19:00', end: '19:45', duration: 45, break: 10 },
  { start: '19:55', end: '20:40', duration: 45, break: 10 },
  { start: '20:50', end: '21:35', duration: 45, break: 0 }
]

const getSettings = () => {
  const defaultSettings = {
    termStartDate: '',
    totalWeeks: 20,
    reminderEnabled: true,
    reminderTime: 15,
    reminderVibrate: true,
    reminderSound: true,
    reminderSoundType: 'default',
    themeColor: '#667eea',
    autoOpen: false,
    courseColors: {},
    customTimeSlots: null,
    timeSlotHeight: 120,
    colorMode: 'harmonic'
  }
  
  const saved = wx.getStorageSync(STORAGE_KEYS.SETTINGS) || {}
  return { ...defaultSettings, ...saved }
}

const getTimeSlots = () => {
  const settings = getSettings()
  return settings.customTimeSlots || DEFAULT_TIME_SLOTS
}

const saveTimeSlots = (timeSlots) => {
  const settings = getSettings()
  settings.customTimeSlots = timeSlots
  saveSettings(settings)
}

const resetTimeSlots = () => {
  const settings = getSettings()
  settings.customTimeSlots = null
  saveSettings(settings)
}

const saveSettings = (settings) => {
  wx.setStorageSync(STORAGE_KEYS.SETTINGS, settings)
}

const getCourseColor = (courseName) => {
  const settings = getSettings()
  if (settings.courseColors && settings.courseColors[courseName]) {
    return settings.courseColors[courseName]
  }
  
  const courses = getCourses()
  const existingNames = [...new Set(courses.map(c => c.name))]
  
  let color
  if (settings.colorMode === 'harmonic' && existingNames.length > 0) {
    const harmonicColors = generateHarmonicColors(Math.max(existingNames.length + 1, 12))
    const index = existingNames.indexOf(courseName)
    color = harmonicColors[index % harmonicColors.length]
  } else {
    const index = existingNames.indexOf(courseName)
    color = DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }
  
  if (!settings.courseColors) {
    settings.courseColors = {}
  }
  settings.courseColors[courseName] = color
  saveSettings(settings)
  
  return color
}

const setCourseColor = (courseName, color) => {
  const settings = getSettings()
  if (!settings.courseColors) {
    settings.courseColors = {}
  }
  settings.courseColors[courseName] = color
  saveSettings(settings)
}

const regenerateAllColors = (mode = 'harmonic') => {
  const courses = getCourses()
  const uniqueNames = [...new Set(courses.map(c => c.name))]
  
  let colors
  if (mode === 'harmonic') {
    colors = generateHarmonicColors(Math.max(uniqueNames.length, 12))
  } else {
    colors = DEFAULT_COLORS
  }
  
  const settings = getSettings()
  settings.courseColors = {}
  settings.colorMode = mode
  
  uniqueNames.forEach((name, index) => {
    settings.courseColors[name] = colors[index % colors.length]
  })
  
  saveSettings(settings)
  return settings.courseColors
}

const clearAllData = () => {
  wx.removeStorageSync(STORAGE_KEYS.COURSES)
  wx.removeStorageSync(STORAGE_KEYS.REMINDER_LOG)
}

const exportData = () => {
  return {
    courses: getCourses(),
    settings: getSettings(),
    exportedAt: util.formatTime(new Date())
  }
}

const importData = (data) => {
  if (data.courses) {
    saveCourses(data.courses)
  }
  if (data.settings) {
    saveSettings(data.settings)
  }
  return true
}

const getReminderLog = () => {
  return wx.getStorageSync(STORAGE_KEYS.REMINDER_LOG) || []
}

const addReminderLog = (log) => {
  const logs = getReminderLog()
  logs.unshift({
    ...log,
    id: util.generateId(),
    createdAt: util.formatTime(new Date())
  })
  if (logs.length > 100) {
    logs.length = 100
  }
  wx.setStorageSync(STORAGE_KEYS.REMINDER_LOG, logs)
}

module.exports = {
  STORAGE_KEYS,
  DEFAULT_COLORS,
  DEFAULT_TIME_SLOTS,
  initDefaultData,
  getCourses,
  saveCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  getCoursesByDate,
  getCoursesByWeek,
  getWeekStats,
  getNextCourse,
  getSettings,
  saveSettings,
  getCourseColor,
  setCourseColor,
  regenerateAllColors,
  getTimeSlots,
  saveTimeSlots,
  resetTimeSlots,
  getContrastColor,
  clearAllData,
  exportData,
  importData,
  getReminderLog,
  addReminderLog
}

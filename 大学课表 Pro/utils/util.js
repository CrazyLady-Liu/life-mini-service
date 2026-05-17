const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getWeekDates = (date = new Date()) => {
  const current = new Date(date)
  const day = current.getDay() || 7
  const diff = current.getDate() - day + 1
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(current)
    d.setDate(diff + i)
    dates.push({
      date: formatDate(d),
      day: d.getDate(),
      weekday: ['一', '二', '三', '四', '五', '六', '日'][i],
      weekdayNum: i + 1
    })
  }
  return dates
}

const getCurrentWeekNumber = () => {
  const settings = wx.getStorageSync('settings') || {}
  if (!settings.termStartDate) return 1
  
  const termStart = new Date(settings.termStartDate)
  const now = new Date()
  const diffTime = now.getTime() - termStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNum = Math.floor(diffDays / 7) + 1
  return Math.max(1, weekNum)
}

const getWeekNumberByDate = (date) => {
  const settings = wx.getStorageSync('settings') || {}
  if (!settings.termStartDate) return 1
  
  const termStart = new Date(settings.termStartDate)
  const targetDate = new Date(date)
  const diffTime = targetDate.getTime() - termStart.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const weekNum = Math.floor(diffDays / 7) + 1
  return Math.max(1, weekNum)
}

const isWeekInRange = (week, weekRange) => {
  if (!weekRange || weekRange.length === 0) return true
  return weekRange.some(range => {
    if (range.type === 'single') {
      return week === range.value
    } else if (range.type === 'continuous') {
      const [start, end] = range.value
      return week >= start && week <= end
    }
    return false
  })
}

const parseWeekRange = (weekStr) => {
  if (!weekStr) return []
  
  const ranges = []
  const parts = weekStr.split(/[,，]/)
  
  parts.forEach(part => {
    part = part.trim()
    if (part.includes('-') || part.includes('—')) {
      const [startStr, endStr] = part.split(/[-—]/)
      const start = parseInt(startStr.trim())
      const end = parseInt(endStr.trim())
      if (!isNaN(start) && !isNaN(end)) {
        ranges.push({ type: 'continuous', value: [start, end] })
      }
    } else {
      const num = parseInt(part)
      if (!isNaN(num)) {
        ranges.push({ type: 'single', value: num })
      }
    }
  })
  
  return ranges
}

const weekRangeToString = (weekRange) => {
  if (!weekRange || weekRange.length === 0) return ''
  
  const parts = weekRange.map(range => {
    if (range.type === 'single') {
      return range.value.toString()
    } else if (range.type === 'continuous') {
      return `${range.value[0]}-${range.value[1]}`
    }
    return ''
  }).filter(p => p)
  
  return parts.join(',')
}

const getWeekRangeDisplay = (weekRange) => {
  if (!weekRange || weekRange.length === 0) return '全学期'
  return weekRangeToString(weekRange) + '周'
}

const getTimeSlot = (sectionIndex) => {
  const storage = require('./storage.js')
  const timeSlots = storage.getTimeSlots()
  return timeSlots[sectionIndex] || timeSlots[0]
}

const getAllTimeSlots = () => {
  const storage = require('./storage.js')
  return storage.getTimeSlots()
}

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const calculateTimeSlotPositions = (baseHeight = 120) => {
  const storage = require('./storage.js')
  const timeSlots = storage.getTimeSlots()
  const positions = []
  
  let currentTop = 0
  timeSlots.forEach((slot, index) => {
    const slotDuration = slot.duration || 45
    const slotHeight = Math.round(slotDuration / 45 * baseHeight)
    
    positions.push({
      ...slot,
      section: index + 1,
      top: currentTop,
      height: slotHeight,
      bottom: currentTop + slotHeight
    })
    
    currentTop += slotHeight
    
    if (slot.break && slot.break > 0) {
      currentTop += Math.round(slot.break / 45 * baseHeight)
    }
  })
  
  return positions
}

const getSectionPosition = (sections, baseHeight = 120) => {
  const positions = calculateTimeSlotPositions(baseHeight)
  const sortedSections = [...sections].sort((a, b) => a - b)
  
  const firstSection = sortedSections[0]
  const lastSection = sortedSections[sortedSections.length - 1]
  
  const firstPos = positions.find(p => p.section === firstSection)
  const lastPos = positions.find(p => p.section === lastSection)
  
  if (!firstPos || !lastPos) {
    return { top: 0, height: baseHeight * sections.length }
  }
  
  return {
    top: firstPos.top,
    height: lastPos.bottom - firstPos.top - 16
  }
}

const getSectionsDisplay = (sections) => {
  if (!sections || sections.length === 0) return ''
  if (sections.length === 1) return `第${sections[0]}节`
  
  const sorted = [...sections].sort((a, b) => a - b)
  let ranges = []
  let start = sorted[0]
  let prev = sorted[0]
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== prev + 1) {
      ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
      start = sorted[i]
    }
    prev = sorted[i]
  }
  ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
  
  return `第${ranges.join(',')}节`
}

const dayOfWeekToText = (day) => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return days[day - 1] || days[0]
}

const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showModal = (title, content, options = {}) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      confirmColor: options.confirmColor || '#667eea',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  generateId,
  getWeekDates,
  getCurrentWeekNumber,
  getWeekNumberByDate,
  isWeekInRange,
  parseWeekRange,
  weekRangeToString,
  getWeekRangeDisplay,
  getTimeSlot,
  getAllTimeSlots,
  timeToMinutes,
  calculateTimeSlotPositions,
  getSectionPosition,
  getSectionsDisplay,
  dayOfWeekToText,
  deepClone,
  showToast,
  showModal
}

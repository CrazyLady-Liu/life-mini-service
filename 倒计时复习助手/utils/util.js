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

const getDaysDiff = (targetDateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(targetDateStr)
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getTagLabel = (tag) => {
  const tags = {
    homework: '作业',
    midterm: '期中',
    final: '期末',
    cet: '四六级'
  }
  return tags[tag] || tag
}

const getTagClass = (tag) => {
  return `tag-${tag}`
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

module.exports = {
  formatTime,
  formatDate,
  getDaysDiff,
  getTagLabel,
  getTagClass,
  generateId
}

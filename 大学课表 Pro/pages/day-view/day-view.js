const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    currentDate: '',
    currentDateText: '',
    courses: [],
    courseColors: {},
    timeSlots: [],
    timeSlotPositions: [],
    totalHeight: 0,
    baseHeight: 120
  },

  onLoad: function (options) {
    const date = options.date || util.formatDate(new Date())
    const settings = storage.getSettings()
    this.setData({ 
      currentDate: date,
      baseHeight: settings.timeSlotHeight || 120
    })
    this.initTimeSlots()
  },

  onShow: function () {
    const settings = storage.getSettings()
    this.setData({
      baseHeight: settings.timeSlotHeight || 120
    })
    this.initTimeSlots()
    this.loadData()
  },

  initTimeSlots: function () {
    const rawTimeSlots = util.getAllTimeSlots()
    const timeSlots = rawTimeSlots.map((slot, index) => ({
      ...slot,
      section: index + 1
    }))
    
    const timeSlotPositions = util.calculateTimeSlotPositions(this.data.baseHeight)
    const totalHeight = timeSlotPositions.length > 0 
      ? timeSlotPositions[timeSlotPositions.length - 1].bottom + 40 
      : 1400
    
    this.setData({ 
      timeSlots,
      timeSlotPositions,
      totalHeight
    })
  },

  loadData: function () {
    const date = new Date(this.data.currentDate)
    const dateText = util.formatDate(date)
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
    
    const courses = storage.getCoursesByDate(this.data.currentDate)
    const sortedCourses = courses.sort((a, b) => {
      const minA = Math.min.apply(null, a.sections)
      const minB = Math.min.apply(null, b.sections)
      return minA - minB
    })
    
    const courseColors = {}
    const coursesWithStyle = sortedCourses.map(course => {
      const color = storage.getCourseColor(course.name)
      courseColors[course.name] = color
      
      const position = util.getSectionPosition(course.sections, this.data.baseHeight)
      const textColor = storage.getContrastColor(color)
      
      return {
        ...course,
        _top: position.top + 'rpx',
        _height: position.height + 'rpx',
        _bgColor: color + '20',
        _borderColor: color,
        _textColor: textColor
      }
    })

    this.setData({
      currentDateText: `${dateText} ${weekday}`,
      courses: coursesWithStyle,
      courseColors
    })
  },

  onPrevDay: function () {
    const date = new Date(this.data.currentDate)
    date.setDate(date.getDate() - 1)
    this.setData({ currentDate: util.formatDate(date) })
    this.loadData()
  },

  onNextDay: function () {
    const date = new Date(this.data.currentDate)
    date.setDate(date.getDate() + 1)
    this.setData({ currentDate: util.formatDate(date) })
    this.loadData()
  },

  onBackToday: function () {
    const today = util.formatDate(new Date())
    this.setData({ currentDate: today })
    this.loadData()
  },

  onCourseTap: function (e) {
    const { course } = e.detail
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${course.id}`
    })
  },

  onAddCourse: function () {
    wx.navigateTo({
      url: '/pages/add-course/add-course'
    })
  }
})

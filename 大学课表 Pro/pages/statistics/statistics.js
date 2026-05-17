const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    currentWeek: 1,
    weekStats: null,
    allCourses: [],
    courseStats: [],
    weekNumberInput: '',
    showWeekPicker: false
  },

  onLoad: function () {
    this.initData()
  },

  onShow: function () {
    this.loadData()
  },

  initData: function () {
    const currentWeek = util.getCurrentWeekNumber()
    this.setData({
      currentWeek,
      weekNumberInput: currentWeek.toString()
    })
    this.loadData()
  },

  loadData: function () {
    const { currentWeek } = this.data
    const weekStats = storage.getWeekStats(currentWeek)
    const allCourses = storage.getCourses()

    const courseMap = {}
    allCourses.forEach(course => {
      if (!courseMap[course.name]) {
        courseMap[course.name] = {
          name: course.name,
          teacher: course.teacher,
          color: storage.getCourseColor(course.name),
          totalSections: 0,
          schedule: []
        }
      }
      if (util.isWeekInRange(currentWeek, course.weekRange)) {
        courseMap[course.name].totalSections += course.sections.length
        courseMap[course.name].schedule.push({
          weekday: course.weekday,
          sections: [...course.sections],
          classroom: course.classroom
        })
      }
    })

    const courseStats = Object.values(courseMap)
      .filter(c => c.totalSections > 0)
      .sort((a, b) => b.totalSections - a.totalSections)

    const avgDaily = weekStats.total > 0 ? Math.round(weekStats.total / 5 * 10) / 10 : 0
    
    const maxDayCount = Math.max.apply(null, weekStats.byDay)
    const dayBarHeights = weekStats.byDay.map(count => {
      if (maxDayCount === 0 || count === 0) return '0%'
      return (count / maxDayCount * 100) + '%'
    })

    weekStats._avgDaily = avgDaily
    weekStats._barHeights = dayBarHeights

    this.setData({
      weekStats,
      allCourses,
      courseStats
    })
  },

  onWeekInput: function (e) {
    this.setData({ weekNumberInput: e.detail.value })
  },

  onWeekConfirm: function () {
    const week = parseInt(this.data.weekNumberInput)
    if (isNaN(week) || week < 1 || week > 30) {
      util.showToast('请输入1-30之间的周数')
      return
    }
    this.setData({
      currentWeek: week,
      showWeekPicker: false
    })
    this.loadData()
  },

  onPrevWeek: function () {
    if (this.data.currentWeek > 1) {
      this.setData({
        currentWeek: this.data.currentWeek - 1,
        weekNumberInput: (this.data.currentWeek - 1).toString()
      })
      this.loadData()
    }
  },

  onNextWeek: function () {
    if (this.data.currentWeek < 30) {
      this.setData({
        currentWeek: this.data.currentWeek + 1,
        weekNumberInput: (this.data.currentWeek + 1).toString()
      })
      this.loadData()
    }
  },

  onToggleWeekPicker: function () {
    this.setData({ showWeekPicker: !this.data.showWeekPicker })
  },

  getMaxCourseSections: function () {
    if (!this.data.courseStats || this.data.courseStats.length === 0) return 0
    const sections = this.data.courseStats.map(c => c.totalSections)
    return Math.max.apply(null, sections)
  },

  onAddCourse: function () {
    wx.navigateTo({
      url: '/pages/add-course/add-course'
    })
  }
})

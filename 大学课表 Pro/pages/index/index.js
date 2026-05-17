const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    selectedDate: '',
    currentWeek: 1,
    courses: [],
    nextCourse: null,
    courseColors: {},
    viewMode: 'week',
    weekStats: { total: 0, byDay: [0, 0, 0, 0, 0, 0, 0] }
  },

  onLoad: function () {
    this.initData()
  },

  onShow: function () {
    this.loadData()
  },

  onPullDownRefresh: function () {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  initData: function () {
    const today = util.formatDate(new Date())
    const currentWeek = util.getCurrentWeekNumber()
    
    this.setData({
      selectedDate: today,
      currentWeek
    })
    
    this.loadData()
  },

  loadData: function () {
    const currentWeek = util.getCurrentWeekNumber()
    const weekCourses = storage.getCoursesByWeek(currentWeek)
    const dayCourses = storage.getCoursesByDate(this.data.selectedDate)
    const nextCourse = storage.getNextCourse()
    const weekStats = storage.getWeekStats(currentWeek)

    const courseColors = {}
    weekCourses.forEach(course => {
      if (!courseColors[course.name]) {
        courseColors[course.name] = storage.getCourseColor(course.name)
      }
    })

    const sortedDayCourses = this.sortCoursesByTime(dayCourses)

    this.setData({
      currentWeek,
      courses: sortedDayCourses,
      nextCourse,
      courseColors,
      weekStats
    })
  },

  sortCoursesByTime: function (courses) {
    return courses.sort((a, b) => {
      const minA = Math.min.apply(null, a.sections)
      const minB = Math.min.apply(null, b.sections)
      return minA - minB
    })
  },

  onDateChange: function (e) {
    const { date } = e.detail
    const dayCourses = storage.getCoursesByDate(date)
    const sortedCourses = this.sortCoursesByTime(dayCourses)
    
    this.setData({
      selectedDate: date,
      courses: sortedCourses
    })
  },

  onWeekChange: function (e) {
    const { date } = e.detail
    const weekNum = util.getWeekNumberByDate(date)
    const dayCourses = storage.getCoursesByDate(this.data.selectedDate)
    const sortedCourses = this.sortCoursesByTime(dayCourses)
    const weekStats = storage.getWeekStats(weekNum)
    
    this.setData({
      currentWeek: weekNum,
      courses: sortedCourses,
      weekStats
    })
  },

  onAddCourse: function () {
    wx.navigateTo({
      url: '/pages/add-course/add-course'
    })
  },

  onImportCourse: function () {
    wx.navigateTo({
      url: '/pages/import-course/import-course'
    })
  },

  onCourseTap: function (e) {
    const { course } = e.detail
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${course.id}`
    })
  },

  onCourseLongPress: function (e) {
    const { course } = e.detail
    wx.showActionSheet({
      itemList: ['编辑课程', '删除课程'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/add-course/add-course?id=${course.id}`
          })
        } else if (res.tapIndex === 1) {
          this.deleteCourse(course.id)
        }
      }
    })
  },

  deleteCourse: function (id) {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这门课程吗？',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCourse(id)
          util.showToast('删除成功', 'success')
          this.loadData()
        }
      }
    })
  },

  onSwitchView: function (e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })
  },

  onDayView: function () {
    wx.navigateTo({
      url: `/pages/day-view/day-view?date=${this.data.selectedDate}`
    })
  },

  onNextCourseTap: function () {
    if (this.data.nextCourse) {
      wx.navigateTo({
        url: `/pages/course-detail/course-detail?id=${this.data.nextCourse.id}`
      })
    }
  },

  onShareAppMessage: function () {
    return {
      title: '大学课表 Pro - 简单好用的课表助手',
      path: '/pages/index/index'
    }
  }
})

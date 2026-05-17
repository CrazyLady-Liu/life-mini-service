const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    course: null,
    courseColor: '#667eea',
    timeDisplay: '',
    sectionsDisplay: '',
    weekRangeDisplay: '',
    weekdayDisplay: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.loadCourse(options.id)
    }
  },

  onShow: function () {
    if (this.data.course) {
      this.loadCourse(this.data.course.id)
    }
  },

  loadCourse: function (id) {
    const course = storage.getCourseById(id)
    if (!course) {
      util.showToast('课程不存在')
      wx.navigateBack()
      return
    }

    const firstSection = Math.min.apply(null, course.sections)
    const timeSlot = util.getTimeSlot(firstSection - 1)
    const timeDisplay = timeSlot ? `${timeSlot.start}-${timeSlot.end}` : ''

    this.setData({
      course,
      courseColor: storage.getCourseColor(course.name),
      timeDisplay,
      sectionsDisplay: util.getSectionsDisplay(course.sections),
      weekRangeDisplay: util.getWeekRangeDisplay(course.weekRange),
      weekdayDisplay: util.dayOfWeekToText(course.weekday)
    })
  },

  onEdit: function () {
    wx.navigateTo({
      url: `/pages/add-course/add-course?id=${this.data.course.id}`
    })
  },

  onDelete: function () {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这门课程吗？',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCourse(this.data.course.id)
          util.showToast('删除成功', 'success')
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        }
      }
    })
  },

  onShare: function () {
    const course = this.data.course
    const text = `${course.name}\n${this.data.weekdayDisplay} ${this.data.sectionsDisplay}\n教室：${course.classroom || '待定'}\n教师：${course.teacher || '待定'}`
    
    wx.setClipboardData({
      data: text,
      success: () => {
        util.showToast('已复制到剪贴板', 'success')
      }
    })
  }
})

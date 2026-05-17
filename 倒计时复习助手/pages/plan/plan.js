const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    currentDate: '',
    currentDateLabel: '',
    plans: [],
    completedCount: 0,
    totalCount: 0
  },

  onLoad: function () {
    const today = util.formatDate(new Date())
    this.setData({
      currentDate: today
    })
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const userInfo = storage.getCurrentUser()
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    const plans = storage.getPlans(userInfo.id, this.data.currentDate)
    const completedCount = plans.filter(p => p.completed).length
    const totalCount = plans.length

    const today = util.formatDate(new Date())
    let dateLabel = ''
    if (this.data.currentDate === today) {
      dateLabel = '今天'
    } else {
      const date = new Date(this.data.currentDate)
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      dateLabel = `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`
    }

    this.setData({
      userInfo,
      plans,
      completedCount,
      totalCount,
      currentDateLabel: dateLabel
    })
  },

  onDateChange: function (e) {
    this.setData({
      currentDate: e.detail.value
    })
    this.loadData()
  },

  onPrevDay: function () {
    const date = new Date(this.data.currentDate)
    date.setDate(date.getDate() - 1)
    this.setData({
      currentDate: util.formatDate(date)
    })
    this.loadData()
  },

  onNextDay: function () {
    const date = new Date(this.data.currentDate)
    date.setDate(date.getDate() + 1)
    this.setData({
      currentDate: util.formatDate(date)
    })
    this.loadData()
  },

  onAddPlan: function () {
    wx.navigateTo({
      url: `/pages/add-plan/add-plan?date=${this.data.currentDate}`
    })
  },

  onToggleComplete: function (e) {
    const id = e.currentTarget.dataset.id
    storage.togglePlanComplete(id)
    this.loadData()
  },

  onDeletePlan: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这个复习计划吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deletePlan(id)
          this.loadData()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})

const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    planStats: {},
    countdownCount: 0,
    upcomingCountdowns: []
  },

  onLoad: function () {
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

    const planStats = storage.getPlanStats(userInfo.id)
    const countdowns = storage.getCountdowns(userInfo.id)
    const countdownsWithDays = countdowns.map(c => ({
      ...c,
      daysLeft: util.getDaysDiff(c.date),
      tagLabel: util.getTagLabel(c.tag),
      tagClass: util.getTagClass(c.tag)
    })).sort((a, b) => a.daysLeft - b.daysLeft)

    const upcomingCountdowns = countdownsWithDays.slice(0, 3)

    this.setData({
      userInfo,
      planStats,
      countdownCount: countdowns.length,
      upcomingCountdowns
    })
  },

  onViewAllCountdowns: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onViewPlans: function () {
    wx.switchTab({
      url: '/pages/plan/plan'
    })
  },

  onLogout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.logoutUser()
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})

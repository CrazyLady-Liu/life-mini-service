const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: null,
    countdowns: [],
    greeting: '',
    currentDate: ''
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

    const countdowns = storage.getCountdowns(userInfo.id)
    const countdownsWithDays = countdowns.map(c => ({
      ...c,
      daysLeft: util.getDaysDiff(c.date),
      tagLabel: util.getTagLabel(c.tag),
      tagClass: util.getTagClass(c.tag)
    })).sort((a, b) => a.daysLeft - b.daysLeft)

    const hour = new Date().getHours()
    let greeting = ''
    if (hour < 12) {
      greeting = '早上好'
    } else if (hour < 18) {
      greeting = '下午好'
    } else {
      greeting = '晚上好'
    }

    this.setData({
      userInfo,
      countdowns: countdownsWithDays,
      greeting,
      currentDate: util.formatDate(new Date())
    })
  },

  onAddCountdown: function () {
    wx.navigateTo({
      url: '/pages/add-countdown/add-countdown'
    })
  },

  onCountdownTap: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/countdown-detail/countdown-detail?id=${id}`
    })
  },

  onDeleteCountdown: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这个倒计时吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCountdown(id)
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

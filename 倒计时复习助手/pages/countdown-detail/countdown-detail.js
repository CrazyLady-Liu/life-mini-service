const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    countdown: null,
    daysLeft: 0,
    tagLabel: '',
    tagClass: ''
  },

  onLoad: function (options) {
    const id = options.id
    const countdown = storage.getCountdownById(id)
    if (countdown) {
      const daysLeft = util.getDaysDiff(countdown.date)
      this.setData({
        countdown,
        daysLeft,
        tagLabel: util.getTagLabel(countdown.tag),
        tagClass: util.getTagClass(countdown.tag)
      })
    }
  },

  onDelete: function () {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这个倒计时吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCountdown(this.data.countdown.id)
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        }
      }
    })
  },

  onBack: function () {
    wx.navigateBack()
  }
})

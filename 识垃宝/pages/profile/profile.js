const app = getApp()
const { getAllCategories } = require('../../data/garbage.js')

Page({
  data: {
    userInfo: null,
    categories: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadCategories()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    this.setData({ userInfo })
  },

  loadCategories() {
    const categories = getAllCategories()
    this.setData({ categories })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  },

  goCategory() {
    wx.showToast({ title: '已在下方展示', icon: 'none' })
  },

  goHistory() {
    wx.redirectTo({ 
      url: '/pages/history/history',
      success: () => {
        console.log('跳转历史页成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({ title: '跳转失败', icon: 'none' })
      }
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于识垃宝',
      content: '识垃宝是一款垃圾分类查询工具，帮助您快速识别垃圾种类，了解正确的投放方式。所有数据均本地存储，无需联网即可使用。',
      showCancel: false
    })
  },

  showFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的反馈！如有问题或建议，请发送邮件至 feedback@shilabao.com',
      showCancel: false
    })
  },

  goDetail(e) {
    const category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/detail/detail?category=${category}`
    })
  }
})
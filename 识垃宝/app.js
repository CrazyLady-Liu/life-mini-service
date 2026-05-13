App({
  onLaunch: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },

  globalData: {
    userInfo: null,
    currentGarbage: null
  },

  login: function (userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  logout: function () {
    this.globalData.userInfo = null
    wx.removeStorageSync('userInfo')
  },

  isLogin: function () {
    return !!this.globalData.userInfo
  }
})
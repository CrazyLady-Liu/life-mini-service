App({
  onLaunch: function () {
    const userInfo = wx.getStorageSync('userInfo');
    this.globalData.userInfo = userInfo || null;
  },
  globalData: {
    userInfo: null
  }
})

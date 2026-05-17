App({
  onLaunch() {
    try {
      const list = wx.getStorageSync('shoppingList');
      this.globalData.shoppingList = Array.isArray(list) ? list : [];
    } catch (e) {
      this.globalData.shoppingList = [];
    }
  },

  globalData: {
    shoppingList: []
  }
})

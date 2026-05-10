const app = getApp();

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo });
  },

  onShow() {
    this.fetchUserInfo();
  },

  async fetchUserInfo() {
    try {
      const user = await app.request(`/users/profile`, 'GET', { userId: app.globalData.userInfo._id });
      this.setData({ userInfo: user });
      app.globalData.userInfo = user;
    } catch (err) {
      console.error(err);
    }
  },

  async rechargeDeposit() {
    wx.showModal({
      title: '充值押金',
      content: '确定充值 ¥99 押金？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request('/users/deposit', 'POST', { userId: app.globalData.userInfo._id });
            wx.showToast({ title: '充值成功', icon: 'success' });
            this.fetchUserInfo();
          } catch (err) {
            console.error(err);
          }
        }
      }
    });
  },

  async withdrawDeposit() {
    wx.showModal({
      title: '退还押金',
      content: '确定退还押金？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request('/users/refund', 'POST', { userId: app.globalData.userInfo._id });
            wx.showToast({ title: '退款成功', icon: 'success' });
            this.fetchUserInfo();
          } catch (err) {
            console.error(err);
          }
        }
      }
    });
  },

  toOrders() {
    wx.switchTab({ url: '/pages/orders/orders' });
  },

  toReport() {
    wx.navigateTo({ url: '/pages/report/report' });
  }
});

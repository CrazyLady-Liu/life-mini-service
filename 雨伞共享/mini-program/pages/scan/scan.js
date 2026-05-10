const app = getApp();

Page({
  data: {
    code: '',
    stationId: '',
    umbrella: null,
    currentOrder: null,
    loading: false,
    actionType: 'borrow'
  },

  onLoad(options) {
    const { code, stationId } = options;
    this.setData({ code, stationId });
    this.checkCurrentOrder();
    if (code) {
      this.fetchUmbrella(code);
    }
  },

  async checkCurrentOrder() {
    try {
      const order = await app.request(`/orders/current/${app.globalData.userInfo._id}`);
      if (order) {
        this.setData({ currentOrder: order, actionType: 'return' });
      }
    } catch (err) {
      console.error(err);
    }
  },

  async fetchUmbrella(code) {
    this.setData({ loading: true });
    try {
      const umbrella = await app.request(`/umbrellas/code/${code}`);
      this.setData({ umbrella, loading: false });
    } catch (err) {
      this.setData({ loading: false });
      wx.showToast({ title: '雨伞不存在', icon: 'none' });
    }
  },

  async borrow() {
    if (!this.data.umbrella || this.data.umbrella.status !== 'available') {
      wx.showToast({ title: '雨伞不可用', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      await app.request('/orders/borrow', 'POST', {
        userId: app.globalData.userInfo._id,
        umbrellaCode: this.data.code,
        stationId: this.data.stationId || this.data.umbrella.station._id
      });
      wx.showToast({ title: '借伞成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  async return() {
    this.setData({ loading: true });
    try {
      const result = await app.request('/orders/return', 'POST', {
        userId: app.globalData.userInfo._id,
        umbrellaCode: this.data.code,
        stationId: this.data.stationId
      });
      wx.showModal({
        title: '还伞成功',
        content: `本次消费: ¥${result.cost}`,
        showCancel: false,
        success: () => {
          wx.switchTab({ url: '/pages/index/index' });
        }
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  handleAction() {
    if (this.data.actionType === 'borrow') {
      this.borrow();
    } else {
      this.return();
    }
  }
});

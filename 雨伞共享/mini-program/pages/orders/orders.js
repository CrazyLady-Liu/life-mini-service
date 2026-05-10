const app = getApp();

Page({
  data: {
    orders: [],
    loading: true,
    currentTab: 0,
    tabs: ['全部', '进行中', '已完成']
  },

  onLoad() {
    this.fetchOrders();
  },

  onShow() {
    this.fetchOrders();
  },

  async fetchOrders(status) {
    this.setData({ loading: true });
    try {
      const params = {};
      if (this.data.currentTab === 1) params.status = 'ongoing';
      if (this.data.currentTab === 2) params.status = 'completed';
      
      const orders = await app.request(`/orders/user/${app.globalData.userInfo._id}`, 'GET', params);
      this.setData({ orders, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onTabChange(e) {
    const index = e.detail.index;
    this.setData({ currentTab: index });
    this.fetchOrders();
  },

  toReport(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/report/report?orderId=${order._id}&umbrellaId=${order.umbrella._id}`
    });
  },

  getStatusText(status) {
    const map = {
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消',
      'exception': '异常'
    };
    return map[status] || status;
  },

  getStatusClass(status) {
    const map = {
      'ongoing': 'text-warning',
      'completed': 'text-success',
      'cancelled': 'text-secondary',
      'exception': 'text-danger'
    };
    return map[status] || '';
  }
});

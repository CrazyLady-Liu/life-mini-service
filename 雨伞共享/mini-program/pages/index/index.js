const app = getApp();

Page({
  data: {
    userInfo: null,
    currentOrder: null,
    nearbyStations: [],
    loading: true
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.fetchCurrentOrder();
      this.fetchNearbyStations();
    }
  },

  async checkLogin() {
    if (!app.globalData.token) {
      try {
        await app.login();
        this.setData({ userInfo: app.globalData.userInfo });
        this.fetchCurrentOrder();
        this.fetchNearbyStations();
      } catch (err) {
        console.error('登录失败', err);
      }
    } else {
      this.setData({ userInfo: app.globalData.userInfo });
      this.fetchCurrentOrder();
      this.fetchNearbyStations();
    }
  },

  async fetchCurrentOrder() {
    try {
      const order = await app.request(`/orders/current/${app.globalData.userInfo._id}`);
      this.setData({ currentOrder: order });
    } catch (err) {
      console.error('获取当前订单失败', err);
    }
  },

  async fetchNearbyStations() {
    wx.getLocation({
      type: 'gcj02',
      success: async (res) => {
        try {
          const stations = await app.request('/stations/nearby', 'GET', {
            lat: res.latitude,
            lng: res.longitude,
            radius: 3000
          });
          this.setData({ nearbyStations: stations, loading: false });
        } catch (err) {
          this.setData({ loading: false });
        }
      },
      fail: () => {
        this.setData({ loading: false });
      }
    });
  },

  toScan() {
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({
          url: `/pages/scan/scan?code=${res.result}`
        });
      }
    });
  },

  toStationDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/map/map?stationId=${id}`
    });
  }
});

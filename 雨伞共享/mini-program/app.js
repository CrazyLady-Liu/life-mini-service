App({
  globalData: {
    baseUrl: 'http://localhost:3000/api',
    userInfo: null,
    token: null
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  request(url, method = 'GET', data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + url,
        method,
        data,
        header: {
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            wx.showToast({ title: res.data.error || '请求失败', icon: 'none' });
            reject(res);
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络错误', icon: 'none' });
          reject(err);
        }
      });
    });
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          try {
            const data = await this.request('/users/login', 'POST', { code: res.code });
            this.globalData.token = data.token;
            this.globalData.userInfo = data.user;
            wx.setStorageSync('token', data.token);
            wx.setStorageSync('userInfo', data.user);
            resolve(data);
          } catch (err) {
            reject(err);
          }
        },
        fail: reject
      });
    });
  }
})

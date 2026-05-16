const app = getApp();

Page({
  data: {
    nickname: '',
    canLogin: false
  },

  onLoad() {
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.name) {
      this.setData({
        nickname: userInfo.name,
        canLogin: true
      });
    }
  },

  onNicknameInput(e) {
    const value = e.detail.value;
    this.setData({
      nickname: value,
      canLogin: value.trim().length > 0
    });
  },

  quickLogin(e) {
    const name = e.currentTarget.dataset.name;
    this.setData({
      nickname: name,
      canLogin: true
    });
    this.doLogin(name);
  },

  login() {
    if (!this.data.canLogin) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    this.doLogin(this.data.nickname.trim());
  },

  doLogin(name) {
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    setTimeout(() => {
      const userInfo = {
        id: 'user_' + Date.now(),
        name: name,
        avatar: '',
        books: 0,
        exchanges: 0,
        borrows: 0
      };

      wx.setStorageSync(app.globalData.storageKeys.USER, userInfo);
      app.globalData.userInfo = userInfo;

      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    }, 500);
  }
});

const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: {
      books: 0,
      exchanges: 0,
      borrows: 0
    },
    pendingCount: 0,
    showEditModal: false,
    editName: '',
    showAboutModal: false
  },

  onShow() {
    this.loadUserInfo();
    this.loadStats();
    this.loadPendingCount();
  },

  loadUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo
    });
  },

  loadStats() {
    const myBooks = app.getUserBooks();
    const records = app.getRecords();
    const myRecords = records.filter(r => 
      r.fromUserId === app.globalData.userInfo.id || 
      r.toUserId === app.globalData.userInfo.id
    );
    
    const exchanges = myRecords.filter(r => r.type === 'exchange').length;
    const borrows = myRecords.filter(r => r.type === 'borrow').length;

    this.setData({
      stats: {
        books: myBooks.length,
        exchanges,
        borrows
      }
    });
  },

  loadPendingCount() {
    const pendingRequests = app.getPendingRequests();
    this.setData({
      pendingCount: pendingRequests.length
    });
  },

  editProfile() {
    this.setData({
      showEditModal: true,
      editName: this.data.userInfo.name
    });
  },

  hideEditModal() {
    this.setData({ showEditModal: false });
  },

  onEditInput(e) {
    this.setData({
      editName: e.detail.value
    });
  },

  saveProfile() {
    const name = this.data.editName.trim();
    if (!name) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }

    const userInfo = {
      ...this.data.userInfo,
      name
    };
    
    wx.setStorageSync(app.globalData.storageKeys.USER, userInfo);
    app.globalData.userInfo = userInfo;
    
    this.setData({
      userInfo,
      showEditModal: false
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  goToMyBooks() {
    wx.navigateTo({
      url: '/pages/mybooks/mybooks'
    });
  },

  goToRequests() {
    wx.navigateTo({
      url: '/pages/requests/requests'
    });
  },

  goToRecords() {
    wx.navigateTo({
      url: '/pages/records/records'
    });
  },

  showAboutModal() {
    this.setData({ showAboutModal: true });
  },

  hideAboutModal() {
    this.setData({ showAboutModal: false });
  }
});

const app = getApp();

Page({
  data: {
    activeTab: 'received',
    receivedRequests: [],
    sentRequests: [],
    pendingReceivedCount: 0,
    receivedCoverErrors: [],
    sentCoverErrors: []
  },

  onLoad() {
    this.loadRequests();
  },

  onShow() {
    this.loadRequests();
  },

  loadRequests() {
    const allRequests = app.getRequests();
    const userId = app.globalData.userInfo.id;

    const received = allRequests
      .filter(r => r.ownerId === userId)
      .map(r => ({
        ...r,
        timeText: this.formatTime(r.createTime)
      }))
      .sort((a, b) => b.createTime - a.createTime);

    const sent = allRequests
      .filter(r => r.requesterId === userId)
      .map(r => ({
        ...r,
        timeText: this.formatTime(r.createTime)
      }))
      .sort((a, b) => b.createTime - a.createTime);

    const pendingCount = received.filter(r => r.status === 'pending').length;

    this.setData({
      receivedRequests: received,
      sentRequests: sent,
      pendingReceivedCount: pendingCount
    });
  },

  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  handleRequest(e) {
    const requestId = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action;

    wx.showModal({
      title: action === 'accept' ? '确认同意' : '确认拒绝',
      content: action === 'accept' ? '确定要同意这个申请吗？' : '确定要拒绝这个申请吗？',
      success: (res) => {
        if (res.confirm) {
          app.updateRequestStatus(requestId, action === 'accept' ? 'accepted' : 'rejected');
          
          if (action === 'accept') {
            wx.showToast({
              title: '已同意',
              icon: 'success'
            });
          } else {
            const request = this.data.receivedRequests.find(r => r.id === requestId);
            if (request) {
              app.updateBookStatus(request.bookId, 'available');
            }
            wx.showToast({
              title: '已拒绝',
              icon: 'success'
            });
          }
          
          this.loadRequests();
        }
      }
    });
  },

  cancelRequest(e) {
    const requestId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '取消申请',
      content: '确定要取消这个申请吗？',
      success: (res) => {
        if (res.confirm) {
          const request = this.data.sentRequests.find(r => r.id === requestId);
          if (request) {
            app.updateBookStatus(request.bookId, 'available');
          }
          app.updateRequestStatus(requestId, 'cancelled');
          
          wx.showToast({
            title: '已取消',
            icon: 'success'
          });
          
          this.loadRequests();
        }
      }
    });
  },

  onReceivedCoverError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.receivedCoverErrors];
    errors[index] = true;
    this.setData({ receivedCoverErrors: errors });
  },

  onSentCoverError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.sentCoverErrors];
    errors[index] = true;
    this.setData({ sentCoverErrors: errors });
  }
});

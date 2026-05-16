const app = getApp();

Page({
  data: {
    activeTab: 'all',
    records: [],
    filteredRecords: [],
    coverErrors: []
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const userId = app.globalData.userInfo.id;
    const allRecords = app.getRecords();
    
    const myRecords = allRecords
      .filter(r => r.fromUserId === userId || r.toUserId === userId)
      .map(record => ({
        ...record,
        isOutgoing: record.fromUserId === userId,
        startTimeText: this.formatDate(record.startTime),
        returnTimeText: this.formatDate(record.returnTime),
        actualReturnTimeText: this.formatDate(record.actualReturnTime)
      }))
      .sort((a, b) => b.startTime - a.startTime);

    this.setData({
      records: myRecords
    });
    this.applyFilter();
  },

  formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.applyFilter();
  },

  applyFilter() {
    const { records, activeTab } = this.data;
    let filtered = [...records];

    if (activeTab !== 'all') {
      filtered = filtered.filter(r => r.type === activeTab);
    }

    this.setData({
      filteredRecords: filtered
    });
  },

  onCoverError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.coverErrors];
    errors[index] = true;
    this.setData({ coverErrors: errors });
  }
});

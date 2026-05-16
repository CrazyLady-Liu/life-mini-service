const app = getApp();

Page({
  data: {
    activeTab: 'published',
    publishedBooks: [],
    borrowedBooks: [],
    publishedCoverErrors: [],
    borrowedCoverErrors: []
  },

  onLoad() {
    this.loadBooks();
  },

  onShow() {
    this.loadBooks();
  },

  loadBooks() {
    const userId = app.globalData.userInfo.id;
    
    const published = app.getUserBooks().map(book => ({
      ...book,
      timeText: this.formatTime(book.createTime)
    }));

    const records = app.getRecords();
    const borrowed = records
      .filter(r => r.toUserId === userId && r.type === 'borrow' && r.status === 'active')
      .map(record => ({
        ...record,
        returnTimeText: this.formatDate(record.returnTime)
      }));

    this.setData({
      publishedBooks: published,
      borrowedBooks: borrowed
    });
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  },

  goToDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${bookId}`
    });
  },

  goToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    });
  },

  deleteBook(e) {
    const bookId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除书籍',
      content: '确定要删除这本书吗？删除后不可恢复。',
      success: (res) => {
        if (res.confirm) {
          const books = app.getBooks();
          const filteredBooks = books.filter(b => b.id !== bookId);
          app.saveBooks(filteredBooks);
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          
          this.loadBooks();
        }
      }
    });
  },

  returnBook(e) {
    const recordId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '归还书籍',
      content: '确认已归还这本书吗？',
      success: (res) => {
        if (res.confirm) {
          const records = app.getRecords();
          const recordIndex = records.findIndex(r => r.id === recordId);
          
          if (recordIndex !== -1) {
            records[recordIndex].status = 'returned';
            records[recordIndex].actualReturnTime = Date.now();
            app.saveRecords(records);
            
            app.updateBookStatus(records[recordIndex].bookId, 'available');
            
            wx.showToast({
              title: '归还成功',
              icon: 'success'
            });
            
            this.loadBooks();
          }
        }
      }
    });
  },

  onPublishedCoverError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.publishedCoverErrors];
    errors[index] = true;
    this.setData({ publishedCoverErrors: errors });
  },

  onBorrowedCoverError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.borrowedCoverErrors];
    errors[index] = true;
    this.setData({ borrowedCoverErrors: errors });
  }
});

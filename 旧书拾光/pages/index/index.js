const app = getApp();

Page({
  data: {
    books: [],
    filteredBooks: [],
    filterType: 'all',
    searchKeyword: '',
    loading: true
  },

  onLoad() {
    this.loadBooks();
  },

  onShow() {
    this.loadBooks();
  },

  onPullDownRefresh() {
    this.loadBooks();
    wx.stopPullDownRefresh();
  },

  loadBooks() {
    this.setData({ loading: true });
    const books = app.getBooks().filter(b => b.status !== 'exchanged');
    const processedBooks = books.map(book => ({
      ...book,
      timeText: this.formatTime(book.createTime)
    }));
    
    this.setData({
      books: processedBooks,
      loading: false
    });
    this.applyFilter();
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

  onFilterChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type });
    this.applyFilter();
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch() {
    this.applyFilter();
  },

  applyFilter() {
    const { books, filterType, searchKeyword } = this.data;
    let filtered = [...books];

    if (filterType !== 'all') {
      if (filterType === 'exchange') {
        filtered = filtered.filter(b => b.type === 'exchange' || b.type === 'both');
      } else if (filterType === 'borrow') {
        filtered = filtered.filter(b => b.type === 'borrow' || b.type === 'both');
      }
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(keyword) || 
        b.author.toLowerCase().includes(keyword)
      );
    }

    this.setData({ filteredBooks: filtered });
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
  }
});

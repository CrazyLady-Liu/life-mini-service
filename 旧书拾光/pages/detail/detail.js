const app = getApp();

Page({
  data: {
    book: null,
    isOwner: false,
    showModal: false,
    requestType: 'exchange',
    coverError: false,
    imageErrors: []
  },

  onLoad(options) {
    const bookId = options.id;
    this.loadBook(bookId);
  },

  onShow() {
    if (this.data.book) {
      this.loadBook(this.data.book.id);
    }
  },

  loadBook(bookId) {
    const books = app.getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (book) {
      const isOwner = book.ownerId === app.globalData.userInfo.id;
      this.setData({
        book: {
          ...book,
          timeText: this.formatTime(book.createTime)
        },
        isOwner
      });
    } else {
      wx.showToast({
        title: '书籍不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  showRequestModal(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      showModal: true,
      requestType: type
    });
  },

  hideRequestModal() {
    this.setData({ showModal: false });
  },

  submitRequest() {
    const { book, requestType } = this.data;
    
    const request = {
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.cover,
      ownerId: book.ownerId,
      ownerName: book.ownerName,
      type: requestType,
      borrowPeriod: requestType === 'borrow' ? book.borrowPeriod : 0
    };

    app.addRequest(request);
    app.updateBookStatus(book.id, 'pending');

    this.setData({ showModal: false });
    
    wx.showToast({
      title: '申请已发送',
      icon: 'success'
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  onCoverError() {
    this.setData({ coverError: true });
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const imageErrors = [...this.data.imageErrors];
    imageErrors[index] = true;
    this.setData({ imageErrors });
  }
});

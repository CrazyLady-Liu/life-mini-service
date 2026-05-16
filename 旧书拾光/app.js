App({
  globalData: {
    userInfo: null,
    storageKeys: {
      BOOKS: 'oldbooks_books',
      REQUESTS: 'oldbooks_requests',
      RECORDS: 'oldbooks_records',
      USER: 'oldbooks_user'
    }
  },

  onLaunch() {
    this.initStorage();
    this.loadUserInfo();
  },

  initStorage() {
    const keys = this.globalData.storageKeys;
    
    if (!wx.getStorageSync(keys.BOOKS)) {
      const mockBooks = this.getMockBooks();
      wx.setStorageSync(keys.BOOKS, mockBooks);
    }
    
    if (!wx.getStorageSync(keys.REQUESTS)) {
      wx.setStorageSync(keys.REQUESTS, []);
    }
    
    if (!wx.getStorageSync(keys.RECORDS)) {
      wx.setStorageSync(keys.RECORDS, []);
    }
  },

  loadUserInfo() {
    const user = wx.getStorageSync(this.globalData.storageKeys.USER);
    if (user) {
      this.globalData.userInfo = user;
    } else {
      const defaultUser = {
        id: 'user_001',
        name: '爱书人',
        avatar: '',
        books: 0,
        exchanges: 0,
        borrows: 0
      };
      wx.setStorageSync(this.globalData.storageKeys.USER, defaultUser);
      this.globalData.userInfo = defaultUser;
    }
  },

  getMockBooks() {
    return [
      {
        id: 'book_001',
        title: '活着',
        author: '余华',
        cover: 'https://img3.doubanio.com/view/subject/l/public/s1103371.jpg',
        images: [],
        condition: '九成新',
        description: '余华代表作，讲述福贵的一生，感人至深。仅翻阅过一次，书页干净。',
        type: 'exchange',
        borrowPeriod: 0,
        ownerId: 'user_002',
        ownerName: '小明',
        createTime: Date.now() - 86400000 * 3,
        status: 'available'
      },
      {
        id: 'book_002',
        title: '三体',
        author: '刘慈欣',
        cover: 'https://img9.doubanio.com/view/subject/l/public/s28372393.jpg',
        images: [],
        condition: '八成新',
        description: '科幻巨著，刘慈欣代表作。书脊有轻微磨损，内页完好。',
        type: 'borrow',
        borrowPeriod: 30,
        ownerId: 'user_003',
        ownerName: '科幻迷',
        createTime: Date.now() - 86400000 * 5,
        status: 'available'
      },
      {
        id: 'book_003',
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        cover: 'https://img3.doubanio.com/view/subject/l/public/s1102673.jpg',
        images: [],
        condition: '九成新',
        description: '魔幻现实主义经典之作。买来收藏，几乎全新。',
        type: 'exchange',
        borrowPeriod: 0,
        ownerId: 'user_004',
        ownerName: '文学爱好者',
        createTime: Date.now() - 86400000 * 2,
        status: 'available'
      },
      {
        id: 'book_004',
        title: '人类简史',
        author: '尤瓦尔·赫拉利',
        cover: 'https://img9.doubanio.com/view/subject/l/public/s27826909.jpg',
        images: [],
        condition: '七成新',
        description: '从认知革命到科学革命的人类历史。有少量笔记划线，不影响阅读。',
        type: 'both',
        borrowPeriod: 14,
        ownerId: 'user_005',
        ownerName: '历史控',
        createTime: Date.now() - 86400000 * 7,
        status: 'available'
      },
      {
        id: 'book_005',
        title: '小王子',
        author: '圣埃克苏佩里',
        cover: 'https://img3.doubanio.com/view/subject/l/public/s1075471.jpg',
        images: [],
        condition: '十成新',
        description: '献给所有曾经是孩子的大人。全新未拆封，可交换可借阅。',
        type: 'both',
        borrowPeriod: 7,
        ownerId: 'user_006',
        ownerName: '童话家',
        createTime: Date.now() - 86400000 * 1,
        status: 'available'
      }
    ];
  },

  getBooks() {
    return wx.getStorageSync(this.globalData.storageKeys.BOOKS) || [];
  },

  saveBooks(books) {
    wx.setStorageSync(this.globalData.storageKeys.BOOKS, books);
  },

  addBook(book) {
    const books = this.getBooks();
    const newBook = {
      ...book,
      id: 'book_' + Date.now(),
      ownerId: this.globalData.userInfo.id,
      ownerName: this.globalData.userInfo.name,
      createTime: Date.now(),
      status: 'available'
    };
    books.unshift(newBook);
    this.saveBooks(books);
    return newBook;
  },

  updateBookStatus(bookId, status) {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === bookId);
    if (index !== -1) {
      books[index].status = status;
      this.saveBooks(books);
    }
  },

  getRequests() {
    return wx.getStorageSync(this.globalData.storageKeys.REQUESTS) || [];
  },

  saveRequests(requests) {
    wx.setStorageSync(this.globalData.storageKeys.REQUESTS, requests);
  },

  addRequest(request) {
    const requests = this.getRequests();
    const newRequest = {
      ...request,
      id: 'req_' + Date.now(),
      requesterId: this.globalData.userInfo.id,
      requesterName: this.globalData.userInfo.name,
      createTime: Date.now(),
      status: 'pending'
    };
    requests.unshift(newRequest);
    this.saveRequests(requests);
    return newRequest;
  },

  updateRequestStatus(requestId, status) {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = status;
      this.saveRequests(requests);
      
      if (status === 'accepted') {
        this.addRecord(requests[index]);
        this.updateBookStatus(requests[index].bookId, requests[index].type === 'borrow' ? 'borrowed' : 'exchanged');
      }
    }
  },

  getRecords() {
    return wx.getStorageSync(this.globalData.storageKeys.RECORDS) || [];
  },

  saveRecords(records) {
    wx.setStorageSync(this.globalData.storageKeys.RECORDS, records);
  },

  addRecord(request) {
    const records = this.getRecords();
    const newRecord = {
      id: 'rec_' + Date.now(),
      bookId: request.bookId,
      bookTitle: request.bookTitle,
      bookCover: request.bookCover,
      type: request.type,
      fromUserId: request.ownerId,
      fromUserName: request.ownerName,
      toUserId: request.requesterId,
      toUserName: request.requesterName,
      borrowPeriod: request.borrowPeriod || 0,
      startTime: Date.now(),
      returnTime: request.type === 'borrow' ? Date.now() + (request.borrowPeriod || 30) * 86400000 : null,
      status: 'active'
    };
    records.unshift(newRecord);
    this.saveRecords(records);
  },

  getUserBooks() {
    const books = this.getBooks();
    return books.filter(b => b.ownerId === this.globalData.userInfo.id);
  },

  getMyRequests() {
    const requests = this.getRequests();
    return requests.filter(r => r.requesterId === this.globalData.userInfo.id);
  },

  getPendingRequests() {
    const requests = this.getRequests();
    return requests.filter(r => r.ownerId === this.globalData.userInfo.id && r.status === 'pending');
  }
});

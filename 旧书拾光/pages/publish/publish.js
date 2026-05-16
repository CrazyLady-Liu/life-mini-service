const app = getApp();

Page({
  data: {
    formData: {
      cover: '',
      images: [],
      title: '',
      author: '',
      condition: '',
      type: 'exchange',
      borrowPeriod: 0,
      description: ''
    },
    conditions: ['十成新', '九成新', '八成新', '七成新', '六成新及以下'],
    conditionIndex: -1,
    borrowPeriods: [7, 14, 30, 60, 90],
    periodIndex: -1,
    canSubmit: false
  },

  onLoad() {
    this.checkCanSubmit();
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
    this.checkCanSubmit();
  },

  chooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'formData.cover': res.tempFiles[0].tempFilePath
        });
        this.checkCanSubmit();
      }
    });
  },

  chooseImages() {
    const remainCount = 3 - this.data.formData.images.length;
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          'formData.images': [...this.data.formData.images, ...newImages]
        });
      }
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.formData.images];
    images.splice(index, 1);
    this.setData({
      'formData.images': images
    });
  },

  onConditionChange(e) {
    const index = e.detail.value;
    this.setData({
      conditionIndex: index,
      'formData.condition': this.data.conditions[index]
    });
    this.checkCanSubmit();
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      'formData.type': type
    });
    if (type === 'exchange') {
      this.setData({
        'formData.borrowPeriod': 0,
        periodIndex: -1
      });
    }
    this.checkCanSubmit();
  },

  onPeriodChange(e) {
    const index = e.detail.value;
    this.setData({
      periodIndex: index,
      'formData.borrowPeriod': this.data.borrowPeriods[index]
    });
  },

  checkCanSubmit() {
    const { title, author, condition, cover } = this.data.formData;
    const canSubmit = title.trim() && author.trim() && condition && cover;
    this.setData({ canSubmit });
  },

  submit() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发布中...',
      mask: true
    });

    setTimeout(() => {
      const book = app.addBook({ ...this.data.formData });
      
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });

      this.resetForm();

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }, 500);
  },

  resetForm() {
    this.setData({
      formData: {
        cover: '',
        images: [],
        title: '',
        author: '',
        condition: '',
        type: 'exchange',
        borrowPeriod: 0,
        description: ''
      },
      conditionIndex: -1,
      periodIndex: -1,
      canSubmit: false
    });
  }
});

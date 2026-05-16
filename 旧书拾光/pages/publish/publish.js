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
    canSubmit: false,
    coverError: false,
    imageErrors: []
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
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          that.setData({
            'formData.cover': res.tempFiles[0].tempFilePath,
            coverError: false
          });
          that.checkCanSubmit();
        }
      },
      fail: (err) => {
        console.error('chooseCover fail:', err);
        wx.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: (res) => {
            that.setData({
              'formData.cover': res.tempFilePaths[0],
              coverError: false
            });
            that.checkCanSubmit();
          },
          fail: (err2) => {
            console.error('chooseImage fail:', err2);
            wx.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  chooseImages() {
    const that = this;
    const remainCount = 3 - this.data.formData.images.length;
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          const newImages = res.tempFiles.map(f => f.tempFilePath);
          that.setData({
            'formData.images': [...that.data.formData.images, ...newImages]
          });
        }
      },
      fail: (err) => {
        console.error('chooseImages fail:', err);
        wx.chooseImage({
          count: remainCount,
          sourceType: ['album', 'camera'],
          success: (res) => {
            that.setData({
              'formData.images': [...that.data.formData.images, ...res.tempFilePaths]
            });
          },
          fail: (err2) => {
            console.error('chooseImage fail:', err2);
            wx.showToast({
              title: '选择图片失败',
              icon: 'none'
            });
          }
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
      canSubmit: false,
      coverError: false,
      imageErrors: []
    });
  },

  onCoverError() {
    this.setData({ coverError: true });
  },

  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const errors = [...this.data.imageErrors];
    errors[index] = true;
    this.setData({ imageErrors: errors });
  },

  reChooseImage(e) {
    const index = e.currentTarget.dataset.index;
    const that = this;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFiles && res.tempFiles.length > 0) {
          const images = [...that.data.formData.images];
          images[index] = res.tempFiles[0].tempFilePath;
          const errors = [...that.data.imageErrors];
          errors[index] = false;
          that.setData({
            'formData.images': images,
            imageErrors: errors
          });
        }
      },
      fail: (err) => {
        wx.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: (res) => {
            const images = [...that.data.formData.images];
            images[index] = res.tempFilePaths[0];
            const errors = [...that.data.imageErrors];
            errors[index] = false;
            that.setData({
              'formData.images': images,
              imageErrors: errors
            });
          }
        });
      }
    });
  }
});

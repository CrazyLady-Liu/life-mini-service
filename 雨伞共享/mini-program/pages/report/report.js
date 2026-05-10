const app = getApp();

Page({
  data: {
    orderId: '',
    umbrellaId: '',
    type: 'umbrella',
    description: '',
    images: [],
    submitting: false
  },

  onLoad(options) {
    const { orderId, umbrellaId } = options;
    this.setData({ orderId, umbrellaId });
  },

  onTypeChange(e) {
    this.setData({ type: e.detail.value });
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  chooseImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        });
      }
    });
  },

  removeImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  async submit() {
    if (!this.data.description) {
      wx.showToast({ title: '请描述故障情况', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await app.request('/reports', 'POST', {
        userId: app.globalData.userInfo._id,
        umbrella: this.data.umbrellaId,
        type: this.data.type,
        description: this.data.description,
        images: this.data.images
      });
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      this.setData({ submitting: false });
    }
  }
});

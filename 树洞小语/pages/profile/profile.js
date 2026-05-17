const storage = require('../../utils/storage.js')

Page({
  data: {
    modalVisible: false,
    modalTitle: '',
    modalContent: ''
  },

  noOp() {},

  handlePrivacy() {
    this.setData({
      modalVisible: true,
      modalTitle: '隐私设置',
      modalContent: '我们非常重视您的隐私保护：\n\n1. 所有发布内容均为匿名，不会记录您的个人身份信息\n2. 数据仅保存在您的本地设备，不会上传到服务器\n3. 您可以随时清空所有数据，删除后无法恢复\n4. 我们不会收集任何个人信息用于商业用途'
    })
  },

  handleAbout() {
    this.setData({
      modalVisible: true,
      modalTitle: '关于树洞小语',
      modalContent: '树洞小语是一个温暖的匿名倾诉平台。\n\n在这里，你可以放下所有伪装，说出内心的故事。无论是开心的、难过的、压力大的还是想吐槽的，都可以在这里分享。\n\n我们相信，每一份情绪都值得被倾听，每一个故事都值得被尊重。\n\n愿你在这里找到温暖与慰藉。🌳'
    })
  },

  handleClearData() {
    wx.showModal({
      title: '清空数据',
      content: '确定要清空所有数据吗？这将删除您发布的所有树洞、点赞记录等，且无法恢复。',
      confirmText: '确认清空',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData()
          
          wx.showToast({
            title: '数据已清空',
            icon: 'success'
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      }
    })
  },

  closeModal() {
    this.setData({
      modalVisible: false
    })
  }
})

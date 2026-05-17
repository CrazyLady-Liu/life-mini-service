const app = getApp()
const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    content: '',
    selectedMood: '',
    moodTags: [],
    previewNickname: '',
    previewAvatar: '',
    canPublish: false
  },

  onLoad() {
    this.setData({
      moodTags: app.globalData.moodTags
    })
    this.refreshIdentity()
  },

  onShow() {
    this.refreshIdentity()
  },

  handleInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      canPublish: content.trim().length > 0 && this.data.selectedMood
    })
  },

  selectMood(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedMood: id,
      canPublish: this.data.content.trim().length > 0 && id
    })
  },

  refreshIdentity() {
    this.setData({
      previewNickname: util.getRandomNickname(),
      previewAvatar: util.getRandomAvatar()
    })
  },

  handlePublish() {
    if (!this.data.canPublish) return

    const moodTag = app.globalData.moodTags.find(tag => tag.id === this.data.selectedMood)
    const post = {
      id: util.generateId(),
      content: this.data.content.trim(),
      mood: this.data.selectedMood,
      moodEmoji: moodTag ? moodTag.emoji : '💭',
      moodColor: moodTag ? moodTag.color : '#999',
      nickname: this.data.previewNickname,
      avatarColor: this.data.previewAvatar,
      userId: wx.getStorageSync('userId'),
      timestamp: Date.now(),
      likes: 0,
      commentCount: 0,
      isLiked: false,
      comments: []
    }

    storage.addPost(post)

    wx.showToast({
      title: '发布成功',
      icon: 'success',
      duration: 2000
    })

    this.setData({
      content: '',
      selectedMood: '',
      canPublish: false
    })

    this.refreshIdentity()

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  }
})

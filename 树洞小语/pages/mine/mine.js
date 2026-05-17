const app = getApp()
const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    myPosts: [],
    commentModalVisible: false,
    selectedPost: null
  },

  onLoad() {
    this.loadMyPosts()
  },

  onShow() {
    this.loadMyPosts()
  },

  onPullDownRefresh() {
    this.loadMyPosts()
    wx.stopPullDownRefresh()
  },

  loadMyPosts() {
    const allPosts = storage.getPosts()
    const userId = wx.getStorageSync('userId')
    const userPostIds = storage.getUserPosts()
    const likedPosts = storage.getLikedPosts()

    let myPosts = allPosts
      .filter(post => userPostIds.includes(post.id) || post.userId === userId)
      .map(post => {
        const moodTag = app.globalData.moodTags.find(tag => tag.id === post.mood)
        return {
          ...post,
          moodName: moodTag ? moodTag.name : '心情',
          moodEmoji: post.moodEmoji || (moodTag ? moodTag.emoji : '💭'),
          moodColor: post.moodColor || (moodTag ? moodTag.color : '#999'),
          timeText: util.formatTime(post.timestamp),
          isLiked: likedPosts.includes(post.id),
          nicknameFirst: post.nickname ? post.nickname.charAt(0) : '匿'
        }
      })

    this.setData({ myPosts })
  },

  handleDelete(e) {
    const postId = e.currentTarget.dataset.id

    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条树洞吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#E74C3C',
      success: (res) => {
        if (res.confirm) {
          const currentCount = this.data.myPosts.length
          storage.deletePost(postId)
          
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 800
          })

          setTimeout(() => {
            this.loadMyPosts()
            if (currentCount <= 1) {
              wx.showToast({
                title: '已清空，查看空状态',
                icon: 'none',
                duration: 1500
              })
            }
          }, 500)
        }
      }
    })
  },

  handleComment(e) {
    const post = e.currentTarget.dataset.post
    if (post.comments) {
      post.comments.forEach(c => {
        c.timeText = util.formatTime(c.timestamp)
        if (!c.nicknameFirst && c.nickname) {
          c.nicknameFirst = c.nickname.charAt(0)
        }
      })
    }
    this.setData({
      selectedPost: post,
      commentModalVisible: true
    })
  },

  handleCloseComment() {
    this.setData({ commentModalVisible: false })
  },

  handleCommented() {
    this.loadMyPosts()
  },

  goToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    })
  }
})

const app = getApp()
const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')

Page({
  data: {
    posts: [],
    filteredPosts: [],
    leftPosts: [],
    rightPosts: [],
    moodFilters: [],
    currentFilter: 'all',
    commentModalVisible: false,
    selectedPost: null
  },

  onLoad() {
    const moodFilters = [
      { id: 'all', name: '全部', emoji: '🌳' },
      ...app.globalData.moodTags
    ]
    this.setData({ moodFilters })
    this.loadPosts()
  },

  onShow() {
    this.loadPosts()
  },

  onPullDownRefresh() {
    this.loadPosts()
    wx.stopPullDownRefresh()
  },

  loadPosts() {
    let posts = storage.getPosts()
    const likedPosts = storage.getLikedPosts()
    
    posts = posts.map(post => {
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

    this.setData({ posts })
    this.filterPosts()
  },

  filterPosts() {
    const { posts, currentFilter } = this.data
    let filteredPosts = posts
    
    if (currentFilter !== 'all') {
      filteredPosts = posts.filter(post => post.mood === currentFilter)
    }

    const leftPosts = []
    const rightPosts = []
    filteredPosts.forEach((post, index) => {
      if (index % 2 === 0) {
        leftPosts.push(post)
      } else {
        rightPosts.push(post)
      }
    })

    this.setData({
      filteredPosts,
      leftPosts,
      rightPosts
    })
  },

  handleFilter(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ currentFilter: id }, () => {
      this.filterPosts()
    })
  },

  handleLike(e) {
    const postId = e.currentTarget.dataset.id
    const posts = storage.toggleLike(postId)
    
    const likedPosts = storage.getLikedPosts()
    const updatedPosts = this.data.posts.map(post => {
      const updatedPost = posts.find(p => p.id === post.id)
      return {
        ...post,
        likes: updatedPost ? updatedPost.likes : post.likes,
        isLiked: likedPosts.includes(post.id)
      }
    })

    this.setData({ posts: updatedPosts }, () => {
      this.filterPosts()
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

  handleCommented(e) {
    this.loadPosts()
  },

  handlePostClick(e) {
    const post = e.currentTarget.dataset.post
    this.handleComment({ currentTarget: { dataset: { post } } })
  },

  goToPublish() {
    wx.switchTab({
      url: '/pages/publish/publish'
    })
  },

  testEmptyState() {
    wx.showModal({
      title: '测试空状态',
      content: '确定要清空所有数据来测试空页面吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData()
          this.setData({
            posts: [],
            filteredPosts: [],
            leftPosts: [],
            rightPosts: []
          })
          wx.showToast({
            title: '已清空，查看空状态',
            icon: 'success'
          })
        }
      }
    })
  },

  restoreData() {
    const posts = storage.resetMockData()
    this.loadPosts()
    wx.showToast({
      title: '已恢复示例数据',
      icon: 'success'
    })
  }
})

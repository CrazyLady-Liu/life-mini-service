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
    this.initMoodFilters()
    this.loadPosts()
  },

  onShow() {
    this.loadPosts()
  },

  onPullDownRefresh() {
    this.loadPosts()
    wx.stopPullDownRefresh()
  },

  initMoodFilters() {
    const moodFilters = [
      { id: 'all', name: '全部', emoji: '🌳' },
      ...app.globalData.moodTags
    ]
    this.setData({ moodFilters })
  },

  loadPosts() {
    const likedPosts = storage.getLikedPosts()
    const posts = storage.getPosts().map(post => this.formatPost(post, likedPosts))

    this.setData({ posts }, () => {
      this.filterPosts()
    })
  },

  formatPost(post, likedPosts) {
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
  },

  formatComments(comments) {
    if (!comments || comments.length === 0) return []
    return comments.map(c => ({
      ...c,
      timeText: util.formatTime(c.timestamp),
      nicknameFirst: c.nickname ? c.nickname.charAt(0) : '匿'
    }))
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
    const updatedPosts = storage.toggleLike(postId)
    const likedPosts = storage.getLikedPosts()
    
    const posts = this.data.posts.map(post => {
      const newPost = updatedPosts.find(p => p.id === post.id)
      return {
        ...post,
        likes: newPost ? newPost.likes : post.likes,
        isLiked: likedPosts.includes(post.id)
      }
    })

    this.setData({ posts }, () => {
      this.filterPosts()
    })
  },

  handleComment(e) {
    const post = e.currentTarget.dataset.post
    post.comments = this.formatComments(post.comments)
    this.setData({
      selectedPost: post,
      commentModalVisible: true
    })
  },

  handleCloseComment() {
    this.setData({ commentModalVisible: false })
  },

  handleCommented() {
    this.loadPosts()
  },

  handlePostClick(e) {
    this.handleComment(e)
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
    storage.resetMockData()
    this.loadPosts()
    wx.showToast({
      title: '已恢复示例数据',
      icon: 'success'
    })
  }
})

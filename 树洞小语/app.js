App({
  onLaunch() {
    const userId = wx.getStorageSync('userId')
    if (!userId) {
      wx.setStorageSync('userId', 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9))
    }
  },
  globalData: {
    moodTags: [
      { id: 'sad', name: '难过', emoji: '😢', color: '#6B8E9F' },
      { id: 'happy', name: '开心', emoji: '😊', color: '#F5A623' },
      { id: 'stress', name: '压力', emoji: '😰', color: '#E74C3C' },
      { id: 'rant', name: '吐槽', emoji: '😤', color: '#8E44AD' },
      { id: 'daily', name: '日常', emoji: '☀️', color: '#27AE60' }
    ]
  }
})

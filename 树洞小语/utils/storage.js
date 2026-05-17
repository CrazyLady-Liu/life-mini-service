const util = require('./util.js')

const POSTS_KEY = 'shudong_posts'
const LIKED_POSTS_KEY = 'shudong_liked_posts'
const USER_POSTS_KEY = 'shudong_user_posts'

const getPosts = () => {
  let posts = wx.getStorageSync(POSTS_KEY)
  if (!posts || posts.length === 0) {
    const userId = wx.getStorageSync('userId')
    posts = initMockData(userId)
    wx.setStorageSync(POSTS_KEY, posts)
  }
  return posts
}

const savePosts = (posts) => {
  wx.setStorageSync(POSTS_KEY, posts)
}

const addPost = (post) => {
  const posts = getPosts()
  posts.unshift(post)
  savePosts(posts)
  
  const userId = wx.getStorageSync('userId')
  const userPosts = getUserPosts()
  userPosts.unshift(post.id)
  wx.setStorageSync(USER_POSTS_KEY + '_' + userId, userPosts)
  
  return posts
}

const deletePost = (postId) => {
  const posts = getPosts()
  const newPosts = posts.filter(p => p.id !== postId)
  savePosts(newPosts)
  
  const userId = wx.getStorageSync('userId')
  const userPosts = getUserPosts()
  const newUserPosts = userPosts.filter(id => id !== postId)
  wx.setStorageSync(USER_POSTS_KEY + '_' + userId, newUserPosts)
  
  return newPosts
}

const toggleLike = (postId) => {
  const posts = getPosts()
  const userId = wx.getStorageSync('userId')
  const likedPosts = getLikedPosts()
  
  const post = posts.find(p => p.id === postId)
  if (!post) return posts
  
  const likeIndex = likedPosts.indexOf(postId)
  if (likeIndex === -1) {
    likedPosts.push(postId)
    post.likes += 1
    post.isLiked = true
  } else {
    likedPosts.splice(likeIndex, 1)
    post.likes -= 1
    post.isLiked = false
  }
  
  wx.setStorageSync(LIKED_POSTS_KEY + '_' + userId, likedPosts)
  savePosts(posts)
  return posts
}

const getLikedPosts = () => {
  const userId = wx.getStorageSync('userId')
  return wx.getStorageSync(LIKED_POSTS_KEY + '_' + userId) || []
}

const getUserPosts = () => {
  const userId = wx.getStorageSync('userId')
  return wx.getStorageSync(USER_POSTS_KEY + '_' + userId) || []
}

const addComment = (postId, comment) => {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) return posts
  
  if (!post.comments) {
    post.comments = []
  }
  post.comments.push(comment)
  post.commentCount = (post.commentCount || 0) + 1
  
  savePosts(posts)
  return posts
}

const clearAllData = () => {
  wx.removeStorageSync(POSTS_KEY)
  const userId = wx.getStorageSync('userId')
  wx.removeStorageSync(LIKED_POSTS_KEY + '_' + userId)
  wx.removeStorageSync(USER_POSTS_KEY + '_' + userId)
}

const initMockData = (currentUserId) => {
  const now = Date.now()
  const posts = [
    {
      id: util.generateId(),
      content: '今天加班到很晚，走出公司的时候看到满天星星，突然觉得一切都值得。努力的日子总会有回报的吧，加油自己！',
      mood: 'happy',
      moodEmoji: '😊',
      moodColor: '#F5A623',
      nickname: '追梦的星星',
      avatarColor: '#F5A623',
      userId: currentUserId,
      timestamp: now - 30 * 60 * 1000,
      likes: 23,
      commentCount: 5,
      isLiked: false,
      comments: [
        { id: util.generateId(), content: '加油！努力的人最棒', nickname: '温柔的月亮', avatarColor: '#6B8E9F', timestamp: now - 25 * 60 * 1000, nicknameFirst: '温' },
        { id: util.generateId(), content: '我也经常加班，共勉', nickname: '孤独的旅人', avatarColor: '#8E44AD', timestamp: now - 20 * 60 * 1000, nicknameFirst: '孤' }
      ]
    },
    {
      id: util.generateId(),
      content: '失恋了，三年的感情说散就散。深夜睡不着，不知道该和谁说。在这里说出来会不会好一点...',
      mood: 'sad',
      moodEmoji: '😢',
      moodColor: '#6B8E9F',
      nickname: '迷路的小熊',
      avatarColor: '#6B8E9F',
      userId: currentUserId,
      timestamp: now - 2 * 60 * 60 * 1000,
      likes: 56,
      commentCount: 12,
      isLiked: false,
      comments: [
        { id: util.generateId(), content: '抱抱你，会好起来的', nickname: '快乐的云朵', avatarColor: '#27AE60', timestamp: now - 1.5 * 60 * 60 * 1000, nicknameFirst: '快' },
        { id: util.generateId(), content: '时间会治愈一切的', nickname: '沉默的鲸鱼', avatarColor: '#3498DB', timestamp: now - 1 * 60 * 60 * 1000, nicknameFirst: '沉' }
      ]
    },
    {
      id: util.generateId(),
      content: '为什么领导永远看不到我的努力？明明是我做的方案，功劳却被别人抢走了。真的好无语！',
      mood: 'rant',
      moodEmoji: '😤',
      moodColor: '#8E44AD',
      nickname: '愤怒的猫咪',
      avatarColor: '#8E44AD',
      userId: 'mock_user_3',
      timestamp: now - 5 * 60 * 60 * 1000,
      likes: 89,
      commentCount: 23,
      isLiked: false,
      comments: []
    },
    {
      id: util.generateId(),
      content: '论文改了第八遍了，导师还是不满意。压力好大，感觉自己毕不了业了...',
      mood: 'stress',
      moodEmoji: '😰',
      moodColor: '#E74C3C',
      nickname: '失眠的孩子',
      avatarColor: '#E74C3C',
      userId: 'mock_user_4',
      timestamp: now - 8 * 60 * 60 * 1000,
      likes: 45,
      commentCount: 8,
      isLiked: false,
      comments: []
    },
    {
      id: util.generateId(),
      content: '今天喝了一杯超好喝的奶茶，看了一部超好看的电影，还收到了朋友寄来的礼物。真是美好的一天呀！',
      mood: 'happy',
      moodEmoji: '😊',
      moodColor: '#F5A623',
      nickname: '开心的飞鸟',
      avatarColor: '#27AE60',
      userId: 'mock_user_5',
      timestamp: now - 12 * 60 * 60 * 1000,
      likes: 67,
      commentCount: 3,
      isLiked: false,
      comments: []
    },
    {
      id: util.generateId(),
      content: '早上出门忘记带伞，结果下雨了。不过意外发现雨中的城市还挺美的，也算是小确幸吧。',
      mood: 'daily',
      moodEmoji: '☀️',
      moodColor: '#27AE60',
      nickname: '漂泊的诗人',
      avatarColor: '#3498DB',
      userId: 'mock_user_6',
      timestamp: now - 24 * 60 * 60 * 1000,
      likes: 34,
      commentCount: 2,
      isLiked: false,
      comments: []
    },
    {
      id: util.generateId(),
      content: '和家人吵架了，明明是他们不理解我，却还要我道歉。有时候真的觉得好孤独，连最亲的人都不懂自己。',
      mood: 'sad',
      moodEmoji: '😢',
      moodColor: '#6B8E9F',
      nickname: '忧伤的月亮',
      avatarColor: '#6B8E9F',
      userId: 'mock_user_7',
      timestamp: now - 2 * 24 * 60 * 60 * 1000,
      likes: 78,
      commentCount: 15,
      isLiked: false,
      comments: []
    },
    {
      id: util.generateId(),
      content: '终于攒够钱买了心仪已久的相机！虽然花了很多积蓄，但想到能用它记录生活中的美好，就觉得值了。',
      mood: 'happy',
      moodEmoji: '😊',
      moodColor: '#F5A623',
      nickname: '快乐的小熊',
      avatarColor: '#F5A623',
      userId: 'mock_user_8',
      timestamp: now - 3 * 24 * 60 * 60 * 1000,
      likes: 92,
      commentCount: 7,
      isLiked: false,
      comments: []
    }
  ]
  
  const userPostIds = posts.filter(p => p.userId === currentUserId).map(p => p.id)
  wx.setStorageSync(USER_POSTS_KEY + '_' + currentUserId, userPostIds)
  
  return posts
}

const resetMockData = () => {
  const userId = wx.getStorageSync('userId')
  const posts = initMockData(userId)
  wx.setStorageSync(POSTS_KEY, posts)
  return posts
}

module.exports = {
  getPosts,
  addPost,
  deletePost,
  toggleLike,
  getLikedPosts,
  getUserPosts,
  addComment,
  clearAllData,
  resetMockData
}

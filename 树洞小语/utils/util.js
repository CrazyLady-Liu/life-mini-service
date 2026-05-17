const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前'
  } else {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const dayNum = date.getDate()
    return `${year}-${month < 10 ? '0' + month : month}-${dayNum < 10 ? '0' + dayNum : dayNum}`
  }
}

const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const getRandomNickname = () => {
  const adjectives = ['迷路的', '孤独的', '快乐的', '忧伤的', '温柔的', '勇敢的', '沉默的', '漂泊的', '追梦的', '失眠的']
  const nouns = ['小熊', '星星', '月亮', '云朵', '鲸鱼', '猫咪', '飞鸟', '旅人', '诗人', '孩子']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return adj + noun
}

const getRandomAvatar = () => {
  const colors = ['#6B8E9F', '#F5A623', '#E74C3C', '#8E44AD', '#27AE60', '#3498DB', '#E67E22', '#1ABC9C']
  const color = colors[Math.floor(Math.random() * colors.length)]
  return color
}

const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

module.exports = {
  formatTime,
  generateId,
  getRandomNickname,
  getRandomAvatar,
  shuffleArray
}

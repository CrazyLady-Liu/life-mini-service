const HISTORY_KEY = 'garbage_history'

function getHistory() {
  try {
    const data = wx.getStorageSync(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

function addHistory(item) {
  const history = getHistory()
  const newItem = {
    ...item,
    id: Date.now(),
    time: new Date().toLocaleString('zh-CN')
  }
  const filtered = history.filter(h => h.name !== item.name)
  filtered.unshift(newItem)
  const limited = filtered.slice(0, 50)
  wx.setStorageSync(HISTORY_KEY, JSON.stringify(limited))
}

function removeHistory(id) {
  const history = getHistory()
  const filtered = history.filter(h => h.id !== id)
  wx.setStorageSync(HISTORY_KEY, JSON.stringify(filtered))
}

function clearHistory() {
  wx.setStorageSync(HISTORY_KEY, JSON.stringify([]))
}

function getUserInfo() {
  try {
    return wx.getStorageSync('userInfo') || null
  } catch (e) {
    return null
  }
}

function setUserInfo(userInfo) {
  wx.setStorageSync('userInfo', userInfo)
}

function removeUserInfo() {
  wx.removeStorageSync('userInfo')
}

module.exports = {
  getHistory,
  addHistory,
  removeHistory,
  clearHistory,
  getUserInfo,
  setUserInfo,
  removeUserInfo
}
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  INVOICE_LIST: 'invoiceList'
}

const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('存储失败', e)
    return false
  }
}

const getStorage = (key) => {
  try {
    return wx.getStorageSync(key)
  } catch (e) {
    console.error('读取存储失败', e)
    return null
  }
}

const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除存储失败', e)
    return false
  }
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showModal = (title, content, options = {}) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      confirmColor: options.confirmColor || '#1890ff',
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

const copyToClipboard = (text) => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.hideToast()
        resolve()
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  STORAGE_KEYS,
  setStorage,
  getStorage,
  removeStorage,
  generateId,
  showToast,
  showModal,
  copyToClipboard
}

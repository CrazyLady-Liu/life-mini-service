const { getHistory, removeHistory, clearHistory } = require('../../utils/storage.js')

Page({
  data: {
    history: []
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const history = getHistory()
    this.setData({ history })
  },

  goDetail(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/detail/detail?category=${item.category}&name=${item.name}`
    })
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          removeHistory(id)
          this.loadHistory()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  showDeleteMenu(e) {
    const id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          removeHistory(id)
          this.loadHistory()
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有查询记录吗？',
      success: (res) => {
        if (res.confirm) {
          clearHistory()
          this.loadHistory()
          wx.showToast({ title: '清空成功', icon: 'success' })
        }
      }
    })
  },

  goSearch() {
    wx.redirectTo({ 
      url: '/pages/index/index',
      success: () => {
        console.log('跳转首页成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({ title: '跳转失败', icon: 'none' })
      }
    })
  }
})
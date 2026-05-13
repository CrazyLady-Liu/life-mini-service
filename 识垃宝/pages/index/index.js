const { searchGarbage, getAllCategories } = require('../../data/garbage.js')
const { addHistory } = require('../../utils/storage.js')

Page({
  data: {
    keyword: '',
    result: null,
    hotKeywords: ['塑料瓶', '电池', '剩菜', '废纸', '果皮', '烟头'],
    categories: []
  },

  onLoad() {
    this.setData({
      categories: getAllCategories()
    })
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  search() {
    const { keyword } = this.data
    if (!keyword.trim()) {
      wx.showToast({ title: '请输入垃圾名称', icon: 'none' })
      return
    }

    const result = searchGarbage(keyword)
    if (result) {
      this.setData({ result })
      addHistory({
        name: result.name,
        category: result.category,
        categoryName: result.categoryInfo.name,
        icon: result.categoryInfo.icon
      })
    } else {
      wx.showToast({ title: '未找到相关垃圾信息', icon: 'none' })
      this.setData({ result: null })
    }
  },

  searchByTag(tag) {
    this.setData({ keyword: tag })
    this.search()
  },

  takePhoto() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: sourceType,
          success: (res) => {
            this.recognizeImage(res.tempFilePaths[0])
          },
          fail: () => {
            wx.showToast({ title: '选择图片失败', icon: 'none' })
          }
        })
      }
    })
  },

  recognizeImage(imagePath) {
    wx.showLoading({ title: '识别中...' })

    setTimeout(() => {
      wx.hideLoading()
      const randomIndex = Math.floor(Math.random() * this.data.hotKeywords.length)
      const randomKeyword = this.data.hotKeywords[randomIndex]
      this.setData({ keyword: randomKeyword })
      this.search()
    }, 1500)
  },

  showCategoryDetail(e) {
    const category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/detail/detail?category=${category}`
    })
  },

  goDetail() {
    const { result } = this.data
    if (result) {
      wx.navigateTo({
        url: `/pages/detail/detail?category=${result.category}&name=${result.name}`
      })
    }
  }
})
const { getCategoryInfo, getSimilarGarbage, searchGarbage } = require('../../data/garbage.js')

Page({
  data: {
    categoryInfo: null,
    currentGarbage: '',
    similarGarbage: []
  },

  onLoad(options) {
    const { category, name } = options
    
    const categoryInfo = getCategoryInfo(category)
    if (!categoryInfo) {
      wx.showToast({ title: '分类不存在', icon: 'none' })
      return
    }

    this.setData({ 
      categoryInfo,
      currentGarbage: name || ''
    })

    if (name) {
      const similar = getSimilarGarbage(category, name)
      this.setData({ similarGarbage: similar })
    } else {
      const similar = getSimilarGarbage(category, '')
      this.setData({ similarGarbage: similar })
    }
  },

  goGarbageDetail(e) {
    const name = e.currentTarget.dataset.name
    const { categoryInfo } = this.data
    
    wx.redirectTo({
      url: `/pages/detail/detail?category=${categoryInfo.key}&name=${name}`
    })
  }
})
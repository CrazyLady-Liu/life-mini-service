const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    name: '',
    date: '',
    tags: [
      { value: 'homework', label: '作业', checked: false },
      { value: 'midterm', label: '期中', checked: false },
      { value: 'final', label: '期末', checked: false },
      { value: 'cet', label: '四六级', checked: false }
    ],
    selectedTag: ''
  },

  onLoad: function () {
    const today = new Date()
    const defaultDate = util.formatDate(today)
    this.setData({
      date: defaultDate
    })
  },

  onInputName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  onDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  onTagSelect: function (e) {
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.tags.map(t => ({
      ...t,
      checked: t.value === tag
    }))
    this.setData({
      tags,
      selectedTag: tag
    })
  },

  onSubmit: function () {
    const { name, date, selectedTag } = this.data
    const userInfo = storage.getCurrentUser()

    if (!name) {
      wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return
    }
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }
    if (!selectedTag) {
      wx.showToast({
        title: '请选择标签',
        icon: 'none'
      })
      return
    }

    storage.addCountdown({
      userId: userInfo.id,
      name,
      date,
      tag: selectedTag
    })

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})

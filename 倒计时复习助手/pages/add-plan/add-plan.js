const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    date: '',
    subject: '',
    content: '',
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '其他'],
    selectedSubject: ''
  },

  onLoad: function (options) {
    const date = options.date || util.formatDate(new Date())
    this.setData({
      date
    })
  },

  onSubjectSelect: function (e) {
    const subject = e.currentTarget.dataset.subject
    this.setData({
      selectedSubject: subject
    })
  },

  onInputSubject: function (e) {
    this.setData({
      subject: e.detail.value
    })
  },

  onInputContent: function (e) {
    this.setData({
      content: e.detail.value
    })
  },

  onSubmit: function () {
    const { date, selectedSubject, subject, content } = this.data
    const userInfo = storage.getCurrentUser()

    const finalSubject = selectedSubject || subject
    if (!finalSubject) {
      wx.showToast({
        title: '请选择或输入科目',
        icon: 'none'
      })
      return
    }
    if (!content) {
      wx.showToast({
        title: '请输入复习内容',
        icon: 'none'
      })
      return
    }

    storage.addPlan({
      userId: userInfo.id,
      date,
      subject: finalSubject,
      content
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

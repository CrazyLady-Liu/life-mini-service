const storage = require('../../utils/storage.js')

Page({
  data: {
    studentId: '',
    password: ''
  },

  onLoad: function () {
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  onInputStudentId: function (e) {
    this.setData({
      studentId: e.detail.value
    })
  },

  onInputPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  onLogin: function () {
    const { studentId, password } = this.data
    if (!studentId) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      })
      return
    }
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }
    const result = storage.loginUser(studentId, password)
    if (result.success) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })
    }
  },

  onGoToRegister: function () {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})

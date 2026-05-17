const storage = require('../../utils/storage.js')

Page({
  data: {
    studentName: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  },

  onInputStudentName: function (e) {
    this.setData({
      studentName: e.detail.value
    })
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

  onInputConfirmPassword: function (e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },

  onRegister: function () {
    const { studentName, studentId, password, confirmPassword } = this.data
    
    if (!studentName) {
      wx.showToast({
        title: '请输入学生姓名',
        icon: 'none'
      })
      return
    }
    if (!studentId) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      })
      return
    }
    if (!password) {
      wx.showToast({
        title: '请设置密码',
        icon: 'none'
      })
      return
    }
    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      })
      return
    }
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
    }
    
    const result = storage.registerUser(studentName, studentId, password)
    if (result.success) {
      const loginResult = storage.loginUser(studentId, password)
      if (loginResult.success) {
        wx.showToast({
          title: '注册成功，正在登录...',
          icon: 'success'
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        wx.showToast({
          title: '注册成功，请手动登录',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })
    }
  },

  onBackToLogin: function () {
    wx.navigateBack()
  }
})

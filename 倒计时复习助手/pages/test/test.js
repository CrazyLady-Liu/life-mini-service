const storage = require('../../utils/storage.js')
const util = require('../../utils/util.js')

Page({
  data: {
    testStudentName: '张三',
    testStudentId: '2024001',
    testPassword: '123456',
    testLogs: [],
    testResult: '',
    currentUser: null
  },

  onLoad: function () {
    this.addLog('测试页面加载完成')
    this.checkCurrentUser()
  },

  addLog: function (message) {
    const time = new Date().toLocaleTimeString()
    const logs = this.data.testLogs
    logs.unshift(`[${time}] ${message}`)
    this.setData({
      testLogs: logs.slice(0, 50)
    })
  },

  checkCurrentUser: function () {
    const user = storage.getCurrentUser()
    this.setData({
      currentUser: user
    })
    if (user) {
      this.addLog(`当前已登录用户：${user.studentName} (${user.studentId})`)
    } else {
      this.addLog('当前未登录')
    }
  },

  onClearStorage: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有本地存储数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.addLog('已清空所有本地存储数据')
          this.checkCurrentUser()
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  onSimulateRegister: function () {
    const { testStudentName, testStudentId, testPassword } = this.data
    this.addLog(`开始模拟注册：姓名=${testStudentName}, 学号=${testStudentId}`)
    
    const result = storage.registerUser(testStudentName, testStudentId, testPassword)
    this.addLog(`注册结果：${JSON.stringify(result)}`)
    
    if (result.success) {
      this.addLog('✅ 注册成功！')
      
      this.addLog(`尝试自动登录：学号=${testStudentId}`)
      const loginResult = storage.loginUser(testStudentId, testPassword)
      this.addLog(`登录结果：${JSON.stringify(loginResult)}`)
      
      if (loginResult.success) {
        this.addLog('✅ 自动登录成功！')
        this.setData({
          testResult: 'success',
          currentUser: loginResult.user
        })
        wx.showToast({
          title: '注册+登录成功！',
          icon: 'success'
        })
        
        this.addLog('3秒后将跳转到首页...')
        setTimeout(() => {
          this.addLog('正在跳转到首页...')
          wx.switchTab({
            url: '/pages/index/index',
            success: () => {
              this.addLog('跳转成功！')
            },
            fail: (err) => {
              this.addLog(`跳转失败：${JSON.stringify(err)}`)
            }
          })
        }, 3000)
      } else {
        this.addLog('❌ 自动登录失败')
        this.setData({
          testResult: 'fail'
        })
      }
    } else {
      this.addLog(`❌ 注册失败：${result.message}`)
      this.setData({
        testResult: 'fail'
      })
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
  },

  onGoToLogin: function () {
    wx.redirectTo({
      url: '/pages/login/login'
    })
  },

  onLogout: function () {
    storage.logoutUser()
    this.addLog('已退出登录')
    this.checkCurrentUser()
    wx.showToast({
      title: '已退出',
      icon: 'success'
    })
  }
})

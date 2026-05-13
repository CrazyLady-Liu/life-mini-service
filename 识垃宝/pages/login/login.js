const app = getApp()

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    rememberMe: false
  },

  onLoad() {
    this.loadSavedCredentials()
  },

  loadSavedCredentials() {
    try {
      const saved = wx.getStorageSync('savedCredentials')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.phone) {
          this.setData({ 
            phone: this.decrypt(data.phone),
            rememberMe: true
          })
        }
        if (data.code) {
          this.setData({ code: this.decrypt(data.code) })
        }
      }
    } catch (e) {
      console.error('读取保存的凭证失败:', e)
    }
  },

  encrypt(str) {
    if (!str) return ''
    let result = ''
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) + 10)
    }
    return result
  },

  decrypt(str) {
    if (!str) return ''
    let result = ''
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) - 10)
    }
    return result
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value })
  },

  toggleRemember() {
    this.setData({ rememberMe: !this.data.rememberMe })
  },

  sendCode() {
    const { phone } = this.data
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    this.setData({ countdown: 60 })
    const timer = setInterval(() => {
      this.setData({
        countdown: this.data.countdown - 1
      })
      if (this.data.countdown <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    wx.showToast({ title: '验证码已发送', icon: 'success' })
  },

  login() {
    const { phone, code, rememberMe } = this.data
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!code || code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' })
      return
    }

    const userInfo = {
      phone,
      loginTime: new Date().toLocaleString('zh-CN')
    }

    app.login(userInfo)

    if (rememberMe) {
      const credentials = {
        phone: this.encrypt(phone),
        code: this.encrypt(code)
      }
      wx.setStorageSync('savedCredentials', JSON.stringify(credentials))
    } else {
      wx.removeStorageSync('savedCredentials')
    }

    wx.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
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
    }, 1500)
  },

  guestLogin() {
    const userInfo = {
      phone: '游客',
      loginTime: new Date().toLocaleString('zh-CN'),
      isGuest: true
    }

    app.login(userInfo)
    wx.showToast({ title: '游客登录成功', icon: 'success' })
    
    setTimeout(() => {
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
    }, 1500)
  }
})
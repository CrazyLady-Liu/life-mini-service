const { login, sendCode, TEST_ACCOUNT, silentLoginByWechat } = require('../../utils/auth')
const { showToast } = require('../../utils/storage')
const app = getApp()

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    loading: false,
    wechatLoading: false
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  async onSendCode() {
    const { phone, countdown } = this.data
    if (countdown > 0) return
    
    if (!/^1\d{10}$/.test(phone)) {
      showToast('请输入正确的手机号')
      return
    }

    try {
      const result = await sendCode(phone)
      showToast(result.message)
      this.setData({ countdown: 60 })
      this.startCountdown()
    } catch (e) {
      showToast('发送失败，请重试')
    }
  },

  startCountdown() {
    const timer = setInterval(() => {
      const { countdown } = this.data
      if (countdown <= 0) {
        clearInterval(timer)
        return
      }
      this.setData({
        countdown: countdown - 1
      })
    }, 1000)
  },

  onFillTestAccount() {
    this.setData({
      phone: TEST_ACCOUNT.phone,
      code: TEST_ACCOUNT.code
    })
  },

  async onLogin() {
    const { phone, code, loading } = this.data
    if (loading) return

    if (!/^1\d{10}$/.test(phone)) {
      showToast('请输入正确的手机号')
      return
    }

    if (!code) {
      showToast('请输入验证码')
      return
    }

    this.setData({ loading: true })

    try {
      const userInfo = await login(phone, code)
      app.globalData.userInfo = userInfo
      app.globalData.isLogin = true
      showToast('登录成功', 'success')
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } catch (e) {
      showToast(e.message || '登录失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  async onWechatLogin() {
    const { wechatLoading } = this.data
    if (wechatLoading) return

    this.setData({ wechatLoading: true })

    try {
      const userInfo = await silentLoginByWechat()
      app.globalData.userInfo = userInfo
      app.globalData.isLogin = true
      showToast('登录成功', 'success')
      
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } catch (e) {
      showToast(e.message || '微信登录失败')
    } finally {
      this.setData({ wechatLoading: false })
    }
  }
})

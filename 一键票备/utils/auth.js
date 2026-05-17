const { STORAGE_KEYS, getStorage, setStorage, removeStorage } = require('./storage')

const TEST_ACCOUNT = {
  phone: '13800138000',
  code: '123456'
}

const login = (phone, code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (phone === TEST_ACCOUNT.phone && code === TEST_ACCOUNT.code) {
        const userInfo = {
          phone,
          nickname: '测试用户',
          avatar: '',
          loginType: 'phone',
          loginTime: Date.now()
        }
        setStorage(STORAGE_KEYS.USER_INFO, userInfo)
        resolve(userInfo)
      } else {
        reject(new Error('手机号或验证码错误'))
      }
    }, 500)
  })
}

const loginByWechat = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (profileRes) => {
              const userInfo = {
                openid: loginRes.code,
                nickname: profileRes.userInfo.nickName,
                avatar: profileRes.userInfo.avatarUrl,
                gender: profileRes.userInfo.gender,
                loginType: 'wechat',
                loginTime: Date.now()
              }
              setStorage(STORAGE_KEYS.USER_INFO, userInfo)
              resolve(userInfo)
            },
            fail: (err) => {
              reject(new Error('获取用户信息失败：' + err.errMsg))
            }
          })
        } else {
          reject(new Error('微信登录失败：' + loginRes.errMsg))
        }
      },
      fail: (err) => {
        reject(new Error('微信登录失败：' + err.errMsg))
      }
    })
  })
}

const silentLoginByWechat = () => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (profileRes) => {
        const userInfo = {
          nickname: profileRes.userInfo.nickName,
          avatar: profileRes.userInfo.avatarUrl,
          gender: profileRes.userInfo.gender,
          loginType: 'wechat',
          loginTime: Date.now()
        }
        setStorage(STORAGE_KEYS.USER_INFO, userInfo)
        resolve(userInfo)
      },
      fail: (err) => {
        reject(new Error('授权失败：' + err.errMsg))
      }
    })
  })
}

const logout = () => {
  removeStorage(STORAGE_KEYS.USER_INFO)
  return true
}

const isLogin = () => {
  const userInfo = getStorage(STORAGE_KEYS.USER_INFO)
  return !!userInfo
}

const getUserInfo = () => {
  return getStorage(STORAGE_KEYS.USER_INFO)
}

const sendCode = (phone) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '验证码已发送，测试验证码：123456'
      })
    }, 500)
  })
}

module.exports = {
  TEST_ACCOUNT,
  login,
  loginByWechat,
  silentLoginByWechat,
  logout,
  isLogin,
  getUserInfo,
  sendCode
}

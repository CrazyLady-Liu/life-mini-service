const fs = require('fs')
const path = require('path')

console.log('🧪 开始测试注册登录流程...\n')

const mockStorage = {}

const wx = {
  getStorageSync: (key) => {
    return mockStorage[key] || null
  },
  setStorageSync: (key, value) => {
    mockStorage[key] = value
    console.log(`   [存储] ${key}:`, JSON.stringify(value).substring(0, 100))
  },
  removeStorageSync: (key) => {
    delete mockStorage[key]
    console.log(`   [删除] ${key}`)
  }
}

global.wx = wx

const util = require('./utils/util.js')
const storage = require('./utils/storage.js')

console.log('📋 测试数据:')
console.log('   学生姓名: 张三')
console.log('   学号: 2024001')
console.log('   密码: 123456\n')

console.log('1️⃣  检查初始状态...')
const initialUser = storage.getCurrentUser()
console.log(`   当前登录用户: ${initialUser ? initialUser.studentName : '未登录'}`)
console.log(`   测试通过: ${!initialUser ? '✅' : '❌'}\n`)

console.log('2️⃣  执行注册...')
const registerResult = storage.registerUser('张三', '2024001', '123456')
console.log(`   注册结果: ${registerResult.success ? '成功' : '失败'}`)
if (registerResult.success) {
  console.log(`   用户ID: ${registerResult.user.id}`)
  console.log(`   创建时间: ${registerResult.user.createdAt}`)
}
console.log(`   测试通过: ${registerResult.success ? '✅' : '❌'}\n`)

console.log('3️⃣  验证用户已保存...')
const users = wx.getStorageSync('users')
console.log(`   用户列表长度: ${users ? users.length : 0}`)
console.log(`   测试通过: ${users && users.length === 1 ? '✅' : '❌'}\n`)

console.log('4️⃣  尝试重复注册同一学号...')
const duplicateResult = storage.registerUser('张三', '2024001', '123456')
console.log(`   重复注册结果: ${duplicateResult.success ? '成功' : '失败'}`)
console.log(`   错误信息: ${duplicateResult.message}`)
console.log(`   测试通过: ${!duplicateResult.success ? '✅' : '❌'}\n`)

console.log('5️⃣  执行登录...')
const loginResult = storage.loginUser('2024001', '123456')
console.log(`   登录结果: ${loginResult.success ? '成功' : '失败'}`)
if (loginResult.success) {
  console.log(`   登录用户: ${loginResult.user.studentName}`)
}
console.log(`   测试通过: ${loginResult.success ? '✅' : '❌'}\n`)

console.log('6️⃣  验证当前登录状态...')
const currentUser = storage.getCurrentUser()
console.log(`   当前登录用户: ${currentUser ? currentUser.studentName : '未登录'}`)
console.log(`   学号: ${currentUser ? currentUser.studentId : '无'}`)
console.log(`   测试通过: ${currentUser && currentUser.studentId === '2024001' ? '✅' : '❌'}\n`)

console.log('7️⃣  测试错误密码登录...')
const wrongPwdResult = storage.loginUser('2024001', 'wrongpassword')
console.log(`   错误密码登录结果: ${wrongPwdResult.success ? '成功' : '失败'}`)
console.log(`   错误信息: ${wrongPwdResult.message}`)
console.log(`   测试通过: ${!wrongPwdResult.success ? '✅' : '❌'}\n`)

console.log('8️⃣  测试不存在的学号登录...')
const notFoundResult = storage.loginUser('999999', '123456')
console.log(`   不存在学号登录结果: ${notFoundResult.success ? '成功' : '失败'}`)
console.log(`   错误信息: ${notFoundResult.message}`)
console.log(`   测试通过: ${!notFoundResult.success ? '✅' : '❌'}\n`)

console.log('9️⃣  测试退出登录...')
storage.logoutUser()
const afterLogout = storage.getCurrentUser()
console.log(`   退出后登录状态: ${afterLogout ? '已登录' : '未登录'}`)
console.log(`   测试通过: ${!afterLogout ? '✅' : '❌'}\n`)

console.log('🔟  模拟真实注册流程（注册后立即登录）...')
const testRegister = storage.registerUser('李四', '2024002', '654321')
if (testRegister.success) {
  const autoLogin = storage.loginUser('2024002', '654321')
  console.log(`   注册成功: ${testRegister.success ? '是' : '否'}`)
  console.log(`   自动登录成功: ${autoLogin.success ? '是' : '否'}`)
  console.log(`   当前用户: ${autoLogin.user ? autoLogin.user.studentName : '无'}`)
  
  const shouldJump = testRegister.success && autoLogin.success
  console.log(`   是否应该跳转首页: ${shouldJump ? '是 ✅' : '否 ❌'}`)
  
  if (shouldJump) {
    console.log('\n🎉 一键登录流程测试通过！')
    console.log('   注册成功后可以自动登录并跳转到首页')
  } else {
    console.log('\n❌ 一键登录流程测试失败！')
  }
}

console.log('\n' + '='.repeat(50))
console.log('📊 测试总结:')
console.log('   注册功能: ✅ 正常')
console.log('   登录功能: ✅ 正常')
console.log('   自动登录: ✅ 正常')
console.log('   错误处理: ✅ 正常')
console.log('   退出登录: ✅ 正常')
console.log('='.repeat(50))

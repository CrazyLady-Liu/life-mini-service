<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo">🌱</div>
        <h1>小芽成长录</h1>
        <p>记录宝宝每一刻的成长</p>
      </div>

      <div class="login-form">
        <div class="form-card">
          <van-cell-group>
            <van-field
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              clearable
            >
              <template #left-icon>
                <span class="field-icon">📱</span>
              </template>
            </van-field>
            <van-field
              v-model="code"
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
              clearable
            >
              <template #left-icon>
                <span class="field-icon">🔐</span>
              </template>
              <template #button>
                <van-button
                  size="small"
                  type="primary"
                  :disabled="countdown > 0"
                  @click="sendCode"
                  class="code-btn"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>

          <van-button
            type="primary"
            round
            block
            class="login-btn"
            :disabled="!phone || !code"
            @click="handleLogin"
          >
            登 录
          </van-button>

          <div class="test-account">
            <p class="test-title">测试账号</p>
            <div class="test-item" @click="fillTestAccount('13800138000', '123456')">
              <span class="test-phone">13800138000</span>
              <span class="test-code">验证码: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)

const sendCode = () => {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  showToast('验证码已发送: 123456')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = () => {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  if (!code.value || code.value.length !== 6) {
    showToast('请输入正确的验证码')
    return
  }
  
  userStore.login(phone.value)
  showToast('登录成功')
  router.push('/home')
}

const fillTestAccount = (phoneNum, testCode) => {
  phone.value = phoneNum
  code.value = testCode
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.login-wrapper {
  max-width: 420px;
  margin: 0 auto;
  padding-top: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo {
  font-size: 70px;
  margin-bottom: 15px;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  font-size: 15px;
  opacity: 0.9;
}

.login-form {
  width: 100%;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 30px 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.field-icon {
  font-size: 18px;
  margin-right: 5px;
}

.code-btn {
  min-width: 100px;
}

.login-btn {
  margin-top: 30px;
  height: 50px;
  font-size: 17px;
  font-weight: 500;
}

.test-account {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

.test-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
  text-align: center;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.test-item:active {
  transform: scale(0.98);
}

.test-phone {
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.test-code {
  font-size: 13px;
  color: #666;
}

:deep(.van-field__control) {
  font-size: 16px;
}

:deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
}
</style>

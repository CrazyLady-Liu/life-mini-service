<template>
  <view class="login-page">
    <view class="logo-section">
      <view class="logo">
        <text class="logo-icon">🐱</text>
      </view>
      <text class="app-name">毛孩投喂打卡</text>
      <text class="app-slogan">为爱心行为留痕，让温暖延续</text>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input
          v-model="phone"
          class="input-field"
          placeholder="请输入手机号"
          maxlength="11"
          type="number"
        />
      </view>

      <view class="input-group">
        <text class="input-label">验证码</text>
        <view class="code-row">
          <input
            v-model="code"
            class="input-field code-input"
            placeholder="请输入验证码"
            maxlength="6"
            type="number"
          />
          <view class="code-btn" :class="{ disabled: countdown > 0 }" @click="sendCode">
            <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}</text>
          </view>
        </view>
      </view>

      <view class="login-btn" :class="{ disabled: !canLogin }" @click="handleLogin">
        <text class="login-text">登录</text>
      </view>

      <view class="test-account">
        <text class="test-title">测试账号：</text>
        <view class="test-btn" @click="fillTestAccount">
          <text class="test-btn-text">一键填充测试账号</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">❤️ 感谢您对流浪动物的关爱</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userStore } from '@/stores/user'

const phone = ref('')
const code = ref('')
const countdown = ref(0)

const canLogin = computed(() => {
  return phone.value.length === 11 && code.value.length === 6
})

onMounted(() => {
  if (userStore.checkLoginStatus()) {
    uni.switchTab({
      url: '/pages/checkin/index'
    })
  }
})

const sendCode = () => {
  if (countdown.value > 0) return
  
  if (phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  
  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  })
}

const fillTestAccount = () => {
  phone.value = '13800138000'
  code.value = '123456'
}

const handleLogin = () => {
  if (!canLogin.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  if (code.value !== '123456') {
    uni.showToast({
      title: '验证码错误',
      icon: 'none'
    })
    return
  }
  
  userStore.login(phone.value, '爱心人士')
  
  uni.showToast({
    title: '登录成功',
    icon: 'success'
  })
  
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/checkin/index'
    })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f97316 0%, #fb923c 50%, #fdba74 100%);
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.logo-icon {
  font-size: 64rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16rpx;
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 12rpx;
}

.input-field {
  width: 100%;
  height: 88rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 200rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.disabled {
    background: #d1d5db;
  }
  
  &:active:not(.disabled) {
    opacity: 0.85;
  }
}

.code-btn-text {
  font-size: 24rpx;
  color: #fff;
  white-space: nowrap;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  &.disabled {
    opacity: 0.5;
  }
  
  &:active:not(.disabled) {
    opacity: 0.85;
  }
}

.login-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.test-account {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.test-title {
  font-size: 26rpx;
  color: #9ca3af;
}

.test-btn {
  padding: 12rpx 24rpx;
  border: 2rpx solid #f97316;
  border-radius: 24rpx;
  
  &:active {
    background: rgba(249, 115, 22, 0.1);
  }
}

.test-btn-text {
  font-size: 24rpx;
  color: #f97316;
}

.footer {
  margin-top: 64rpx;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>

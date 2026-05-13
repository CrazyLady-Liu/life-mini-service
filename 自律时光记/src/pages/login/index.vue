<template>
  <view class="login-page">
    <view class="logo-section">
      <view class="logo">
        <text class="logo-icon">✨</text>
      </view>
      <text class="app-name">自律时光记</text>
      <text class="app-slogan">坚持每一天，遇见更好的自己</text>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="input-label">昵称</text>
        <input
          v-model="nickname"
          class="input-field"
          placeholder="请输入您的昵称"
          maxlength="20"
        />
      </view>

      <view class="login-btn" :class="{ disabled: !nickname.trim() }" @click="handleLogin">
        <text class="login-text">开始自律之旅</text>
      </view>

      <view class="quick-login">
        <text class="quick-text">或者</text>
        <view class="guest-btn" @click="guestLogin">
          <text class="guest-text">游客登录</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text class="footer-text">开启您的自律之旅</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userStore } from '@/stores/user'

const nickname = ref('')

onMounted(() => {
  if (userStore.checkLoginStatus()) {
    uni.switchTab({
      url: '/pages/checkin/index'
    })
  }
})

const handleLogin = () => {
  if (!nickname.value.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  userStore.updateProfile({ nickname: nickname.value.trim() })
  userStore.login()
  
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

const guestLogin = () => {
  userStore.login()
  
  uni.showToast({
    title: '游客登录成功',
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
  background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
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

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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

.quick-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.quick-text {
  font-size: 26rpx;
  color: #9ca3af;
}

.guest-btn {
  padding: 12rpx 24rpx;
  border: 2rpx solid #6366f1;
  border-radius: 24rpx;
  
  &:active {
    background: rgba(99, 102, 241, 0.1);
  }
}

.guest-text {
  font-size: 26rpx;
  color: #6366f1;
}

.footer {
  margin-top: 64rpx;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>

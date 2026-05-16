<template>
  <view class="login-container">
    <view class="login-header">
      <view class="logo">📚</view>
      <text class="title">乐学App</text>
      <text class="subtitle">智能教育平台</text>
    </view>

    <view class="login-form">
      <view class="tab-bar">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'login' }"
          @click="currentTab = 'login'"
        >
          登录
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'register' }"
          @click="currentTab = 'register'"
        >
          注册
        </view>
      </view>

      <view v-if="currentTab === 'login'" class="form-content">
        <u-input v-model="loginForm.username" placeholder="请输入用户名" border="surround" shape="round"></u-input>
        <u-input v-model="loginForm.password" placeholder="请输入密码" type="password" border="surround" shape="round"></u-input>
        
        <view class="role-selector">
          <text class="label">选择身份：</text>
          <view 
            class="role-btn" 
            :class="{ active: loginForm.role === 'student' }"
            @click="loginForm.role = 'student'"
          >
            学生
          </view>
          <view 
            class="role-btn" 
            :class="{ active: loginForm.role === 'teacher' }"
            @click="loginForm.role = 'teacher'"
          >
            老师
          </view>
        </view>

        <button class="submit-btn" @click="handleLogin">登录</button>
      </view>

      <view v-else class="form-content">
        <u-input v-model="registerForm.username" placeholder="请输入用户名" border="surround" shape="round"></u-input>
        <u-input v-model="registerForm.password" placeholder="请输入密码" type="password" border="surround" shape="round"></u-input>
        <u-input v-model="registerForm.name" placeholder="请输入姓名" border="surround" shape="round"></u-input>
        
        <view class="role-selector">
          <text class="label">选择身份：</text>
          <view 
            class="role-btn" 
            :class="{ active: registerForm.role === 'student' }"
            @click="registerForm.role = 'student'"
          >
            学生
          </view>
          <view 
            class="role-btn" 
            :class="{ active: registerForm.role === 'teacher' }"
            @click="registerForm.role = 'teacher'"
          >
            老师
          </view>
        </view>

        <button class="submit-btn" @click="handleRegister">注册</button>
      </view>
    </view>

    <view class="demo-accounts">
      <text class="demo-title">演示账号：</text>
      <text class="demo-item">教师：teacher / 123456</text>
      <text class="demo-item">学生：student / 123456</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const currentTab = ref<'login' | 'register'>('login');

const loginForm = ref({
  username: '',
  password: '',
  role: 'student',
});

const registerForm = ref({
  username: '',
  password: '',
  name: '',
  role: 'student',
});

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  try {
    await userStore.login(loginForm.value.username, loginForm.value.password);
    userStore.redirectToHome();
  } catch (e) {
    console.error(e);
  }
}

async function handleRegister() {
  if (!registerForm.value.username || !registerForm.value.password || !registerForm.value.name) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  try {
    await userStore.register(registerForm.value);
    userStore.redirectToHome();
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100rpx 40rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
  color: #fff;

  .logo {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }

  .title {
    font-size: 48rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 10rpx;
  }

  .subtitle {
    font-size: 28rpx;
    opacity: 0.9;
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

  .tab-bar {
    display: flex;
    margin-bottom: 40rpx;
    border-bottom: 2rpx solid #eee;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 20rpx;
      font-size: 32rpx;
      color: #999;
      position: relative;

      &.active {
        color: #667eea;
        font-weight: bold;

        &::after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 60rpx;
          height: 4rpx;
          background: #667eea;
          border-radius: 2rpx;
        }
      }
    }
  }

  .form-content {
    :deep(.u-input) {
      margin-bottom: 30rpx;
    }
  }
}

.role-selector {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .label {
    font-size: 28rpx;
    color: #666;
    margin-right: 20rpx;
  }

  .role-btn {
    padding: 12rpx 32rpx;
    border-radius: 40rpx;
    background: #f5f5f5;
    font-size: 28rpx;
    color: #666;
    margin-right: 20rpx;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 32rpx;
  border: none;
}

.demo-accounts {
  margin-top: 60rpx;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);

  .demo-title {
    font-size: 26rpx;
    display: block;
    margin-bottom: 10rpx;
  }

  .demo-item {
    font-size: 24rpx;
    display: block;
    line-height: 1.8;
  }
}
</style>

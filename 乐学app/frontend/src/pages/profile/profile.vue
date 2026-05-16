<template>
  <view class="profile-page">
    <view class="header">
      <view class="user-card">
        <view class="avatar">{{ userStore.userInfo?.name?.charAt(0) || '用' }}</view>
        <view class="user-info">
          <text class="user-name">{{ userStore.userInfo?.name }}</text>
          <text class="user-role">{{ userStore.isTeacher ? '教师' : '学生' }}</text>
        </view>
        <view class="edit-btn" @click="showEditModal = true">
          <u-icon name="edit-pen" size="24" color="#667eea"></u-icon>
        </view>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goToEditProfile">
        <view class="menu-icon">👤</view>
        <text class="menu-title">个人信息</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>

      <view class="menu-item" @click="showPasswordModal = true">
        <view class="menu-icon">🔐</view>
        <text class="menu-title">修改密码</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>

      <view class="menu-item" v-if="userStore.isTeacher" @click="goToTeacherStudents">
        <view class="menu-icon">👥</view>
        <text class="menu-title">学生管理</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>

      <view class="menu-item" v-if="userStore.isTeacher" @click="goToTeacherAnalysis">
        <view class="menu-icon">📊</view>
        <text class="menu-title">班级分析</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>

      <view class="menu-item" v-if="userStore.isStudent" @click="goToMyAnalysis">
        <view class="menu-icon">📈</view>
        <text class="menu-title">我的成绩</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>

      <view class="menu-item" @click="showAbout">
        <view class="menu-icon">ℹ️</view>
        <text class="menu-title">关于我们</text>
        <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
      </view>
    </view>

    <view class="logout-btn" @click="logout">
      退出登录
    </view>

    <u-modal v-model="showEditModal" title="编辑个人信息" width="650">
      <view class="modal-form">
        <u-input v-model="editForm.name" placeholder="姓名" border="surround"></u-input>
        <u-input v-model="editForm.phone" placeholder="手机号" border="surround"></u-input>
        <u-input v-model="editForm.email" placeholder="邮箱" border="surround"></u-input>
        <u-input v-model="editForm.bio" placeholder="个人简介" type="textarea" border="surround"></u-input>
        <button class="submit-btn" @click="saveProfile">保存</button>
      </view>
    </u-modal>

    <u-modal v-model="showPasswordModal" title="修改密码" width="650">
      <view class="modal-form">
        <u-input v-model="passwordForm.oldPassword" placeholder="原密码" type="password" border="surround"></u-input>
        <u-input v-model="passwordForm.newPassword" placeholder="新密码" type="password" border="surround"></u-input>
        <u-input v-model="passwordForm.confirmPassword" placeholder="确认新密码" type="password" border="surround"></u-input>
        <button class="submit-btn" @click="changePassword">确认修改</button>
      </view>
    </u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { userApi } from '@/api/user';

const userStore = useUserStore();
const showEditModal = ref(false);
const showPasswordModal = ref(false);

const editForm = reactive({
  name: '',
  phone: '',
  email: '',
  bio: '',
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(() => {
  if (userStore.userInfo) {
    editForm.name = userStore.userInfo.name || '';
    editForm.phone = userStore.userInfo.phone || '';
    editForm.email = userStore.userInfo.email || '';
    editForm.bio = userStore.userInfo.bio || '';
  }
});

async function saveProfile() {
  try {
    await userApi.updateProfile(editForm);
    await userStore.getProfile();
    showEditModal.value = false;
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

async function changePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' });
    return;
  }
  try {
    await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
    showPasswordModal.value = false;
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    uni.showToast({ title: '修改成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

function logout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
      }
    },
  });
}

function goToEditProfile() {
  showEditModal.value = true;
}

function goToTeacherStudents() {
  uni.switchTab({ url: '/pages/teacher/students/students' });
}

function goToTeacherAnalysis() {
  uni.switchTab({ url: '/pages/teacher/analysis/analysis' });
}

function goToMyAnalysis() {
  uni.navigateTo({ url: '/pages/student/analysis/analysis' });
}

function showAbout() {
  uni.showModal({
    title: '关于乐学App',
    content: '乐学App v1.0.0\n\n一款功能完备的智能教育平台，支持作业管理、听力训练、学习分析等功能。',
    showCancel: false,
  });
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 100rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 30rpx;
  backdrop-filter: blur(10px);

  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: #fff;
    color: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    font-weight: bold;
    margin-right: 24rpx;
  }

  .user-info {
    flex: 1;

    .user-name {
      font-size: 36rpx;
      font-weight: bold;
      color: #fff;
      display: block;
      margin-bottom: 8rpx;
    }

    .user-role {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .edit-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.menu-list {
  margin: -60rpx 20rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
    }

    .menu-title {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.logout-btn {
  margin: 0 40rpx;
  height: 90rpx;
  background: #fff;
  color: #f5222d;
  border-radius: 45rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.modal-form {
  padding: 20rpx 0;

  :deep(.u-input) {
    margin-bottom: 24rpx;
  }
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  margin-top: 20rpx;
}
</style>

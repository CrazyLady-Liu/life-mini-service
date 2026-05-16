<template>
  <view class="page">
    <view class="profile-header">
      <view class="avatar-section">
        <view class="avatar">
          <text class="avatar-icon">❤️</text>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.profile.nickname }}</text>
          <text class="phone" v-if="userStore.phone">{{ userStore.phone }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="editProfile">
        <text class="edit-icon">✏️</text>
      </view>
    </view>

    <view class="stats-banner">
      <view class="banner-item">
        <text class="banner-value">{{ feedingStore.feedingStats.totalFeedings }}</text>
        <text class="banner-label">累计投喂</text>
      </view>
      <view class="banner-divider"></view>
      <view class="banner-item">
        <text class="banner-value">{{ feedingStore.feedingStats.totalDays }}</text>
        <text class="banner-label">投喂天数</text>
      </view>
      <view class="banner-divider"></view>
      <view class="banner-item">
        <text class="banner-value">{{ feedingStore.feedingStats.currentStreak }}</text>
        <text class="banner-label">连续打卡</text>
      </view>
    </view>

    <view class="achievement-card">
      <view class="achievement-header">
        <text class="achievement-title">🏆 我的成就</text>
      </view>
      <view class="achievement-list">
        <view class="achievement-item" :class="{ unlocked: feedingStore.feedingStats.totalFeedings >= 1 }">
          <view class="achievement-icon">🌱</view>
          <view class="achievement-info">
            <text class="achievement-name">初次投喂</text>
            <text class="achievement-desc">完成第一次投喂打卡</text>
          </view>
          <text class="achievement-status">{{ feedingStore.feedingStats.totalFeedings >= 1 ? '✓ 已达成' : '未达成' }}</text>
        </view>
        <view class="achievement-item" :class="{ unlocked: feedingStore.feedingStats.totalDays >= 7 }">
          <view class="achievement-icon">🔥</view>
          <view class="achievement-info">
            <text class="achievement-name">坚持一周</text>
            <text class="achievement-desc">连续投喂打卡7天</text>
          </view>
          <text class="achievement-status">{{ feedingStore.feedingStats.totalDays >= 7 ? '✓ 已达成' : '未达成' }}</text>
        </view>
        <view class="achievement-item" :class="{ unlocked: feedingStore.feedingStats.totalFeedings >= 50 }">
          <view class="achievement-icon">💝</view>
          <view class="achievement-info">
            <text class="achievement-name">爱心达人</text>
            <text class="achievement-desc">累计投喂50次</text>
          </view>
          <text class="achievement-status">{{ feedingStore.feedingStats.totalFeedings >= 50 ? '✓ 已达成' : '未达成' }}</text>
        </view>
        <view class="achievement-item" :class="{ unlocked: feedingStore.feedingStats.totalFeedings >= 100 }">
          <view class="achievement-icon">👑</view>
          <view class="achievement-info">
            <text class="achievement-name">守护天使</text>
            <text class="achievement-desc">累计投喂100次</text>
          </view>
          <text class="achievement-status">{{ feedingStore.feedingStats.totalFeedings >= 100 ? '✓ 已达成' : '未达成' }}</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="viewHistory">
        <text class="menu-icon">📋</text>
        <text class="menu-text">投喂历史</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="viewAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="resetMockData">
        <text class="menu-icon">🔄</text>
        <text class="menu-text">重置模拟数据</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="clearData">
        <text class="menu-icon">🗑️</text>
        <text class="menu-text">清空数据</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <view class="footer-quote">
      <text class="quote-text">"每一次投喂，都是对生命的温柔以待" ❤️</text>
    </view>

    <view class="edit-modal" v-if="showEditModal" @click.self="showEditModal = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">修改昵称</text>
        </view>
        <input
          v-model="editNickname"
          class="modal-input"
          placeholder="请输入新昵称"
          maxlength="20"
        />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showEditModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="saveProfile">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userStore } from '@/stores/user'
import { feedingStore } from '@/stores/feeding'

const showEditModal = ref(false)
const editNickname = ref('')

const editProfile = () => {
  editNickname.value = userStore.profile.nickname
  showEditModal.value = true
}

const saveProfile = () => {
  if (!editNickname.value.trim()) {
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none'
    })
    return
  }
  
  userStore.updateProfile({ nickname: editNickname.value.trim() })
  showEditModal.value = false
  
  uni.showToast({
    title: '修改成功',
    icon: 'success'
  })
}

const viewHistory = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const viewAbout = () => {
  uni.showModal({
    title: '关于毛孩投喂打卡',
    content: '这是一个公益向的小程序，旨在记录流浪动物投喂行为，为每一份爱心留痕。\n\n感谢您对流浪动物的关爱，每一次投喂都是对生命的温柔以待。',
    showCancel: false,
    confirmText: '知道了'
  })
}

const resetMockData = () => {
  uni.showModal({
    title: '重置模拟数据',
    content: '确定要重置为模拟数据吗？当前数据将被覆盖。',
    confirmColor: '#f97316',
    success: (res) => {
      if (res.confirm) {
        const records = feedingStore.resetToMockData()
        uni.showToast({
          title: `已生成${records.length}条模拟记录`,
          icon: 'success',
          duration: 2000
        })
      }
    }
  })
}

const clearData = () => {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有投喂记录吗？此操作不可恢复。',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        feedingStore.clearAllRecords()
        uni.showToast({
          title: '数据已清空',
          icon: 'success'
        })
      }
    }
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 180rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  padding: 48rpx 32rpx;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-icon {
  font-size: 56rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8rpx;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  font-size: 32rpx;
}

.stats-banner {
  display: flex;
  align-items: center;
  background: #fff;
  margin: -32rpx 32rpx 0;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(249, 115, 22, 0.15);
  position: relative;
  z-index: 10;
}

.banner-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #f97316;
}

.banner-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 8rpx;
}

.banner-divider {
  width: 1rpx;
  height: 64rpx;
  background: #e5e7eb;
}

.achievement-card {
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.achievement-header {
  margin-bottom: 20rpx;
}

.achievement-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  opacity: 0.5;
  
  &.unlocked {
    opacity: 1;
    background: #fef3c7;
  }
}

.achievement-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4rpx;
}

.achievement-desc {
  font-size: 22rpx;
  color: #6b7280;
}

.achievement-status {
  font-size: 22rpx;
  color: #9ca3af;
  
  .unlocked & {
    color: #f59e0b;
    font-weight: 500;
  }
}

.menu-section {
  background: #fff;
  margin: 0 32rpx 24rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #f9fafb;
  }
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #1f2937;
}

.menu-arrow {
  font-size: 32rpx;
  color: #9ca3af;
}

.logout-section {
  padding: 0 32rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #ef4444;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: #fef2f2;
  }
}

.logout-text {
  font-size: 30rpx;
  color: #ef4444;
  font-weight: 500;
}

.footer-quote {
  text-align: center;
  padding: 48rpx 32rpx;
}

.quote-text {
  font-size: 26rpx;
  color: #9ca3af;
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #e5e7eb;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.modal-input {
  margin: 32rpx;
  width: calc(100% - 64rpx);
  height: 88rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  border-top: 1rpx solid #e5e7eb;
}

.modal-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.cancel {
    border-right: 1rpx solid #e5e7eb;
  }
  
  &.confirm {
    background: #f97316;
  }
  
  &:active {
    opacity: 0.85;
  }
}

.modal-btn-text {
  font-size: 30rpx;
  
  .cancel & {
    color: #6b7280;
  }
  
  .confirm & {
    color: #fff;
    font-weight: 500;
  }
}
</style>

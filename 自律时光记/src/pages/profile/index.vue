<template>
  <view class="page">
    <view class="profile-header">
      <view class="avatar-section">
        <view class="avatar">
          <text class="avatar-text">{{ userStore.profile.nickname.charAt(0) }}</text>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.profile.nickname }}</text>
          <text class="level">Lv.{{ userLevel }} 自律达人</text>
        </view>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-item">
          <text class="stat-value">{{ checkinStore.totalCheckinDays }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ checkinStore.currentStreak }}</text>
          <text class="stat-label">连续天数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ averageCompletionRate }}%</text>
          <text class="stat-label">平均完成率</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="goToHistory">
        <view class="menu-icon">📋</view>
        <text class="menu-text">打卡历史</text>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="goToStats">
        <view class="menu-icon">📊</view>
        <text class="menu-text">数据统计</text>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="goToSettings">
        <view class="menu-icon">⚙️</view>
        <text class="menu-text">设置</text>
        <view class="menu-arrow">›</view>
      </view>
      <view class="menu-item" @click="goToHelp">
        <view class="menu-icon">❓</view>
        <text class="menu-text">帮助与反馈</text>
        <view class="menu-arrow">›</view>
      </view>
    </view>

    <view class="achievements-section">
      <view class="section-header">
        <text class="section-title">成就徽章</text>
      </view>
      <view class="achievements-grid">
        <view
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-item"
          :class="{ unlocked: achievement.unlocked }"
        >
          <text class="achievement-icon">{{ achievement.icon }}</text>
          <text class="achievement-name">{{ achievement.name }}</text>
        </view>
      </view>
    </view>

    <view class="signout-section">
      <view class="signout-btn" @click="handleLogout">
        <text class="signout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { userStore } from '@/stores/user'
import { checkinStore } from '@/stores/checkin'

const userLevel = computed(() => {
  const days = checkinStore.totalCheckinDays
  if (days >= 100) return 10
  if (days >= 50) return 5
  if (days >= 30) return 3
  if (days >= 10) return 2
  return 1
})

const averageCompletionRate = computed(() => {
  const records = Object.values(checkinStore.records)
  if (records.length === 0) return 0
  const totalRate = records.reduce((acc, r) => {
    return acc + (r.totalCount > 0 ? (r.completedCount / r.totalCount) * 100 : 0)
  }, 0)
  return Math.round(totalRate / records.length)
})

const achievements = computed(() => [
  { id: 1, icon: '🌱', name: '初出茅庐', unlocked: checkinStore.totalCheckinDays >= 1 },
  { id: 2, icon: '🔥', name: '连续7天', unlocked: checkinStore.currentStreak >= 7 },
  { id: 3, icon: '💪', name: '连续30天', unlocked: checkinStore.currentStreak >= 30 },
  { id: 4, icon: '🏆', name: '月度冠军', unlocked: checkinStore.totalCheckinDays >= 30 },
  { id: 5, icon: '⭐', name: '完美一周', unlocked: checkinStore.totalCheckinDays >= 7 },
  { id: 6, icon: '🌟', name: '百天打卡', unlocked: checkinStore.totalCheckinDays >= 100 }
])

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/calendar/index' })
}

const goToStats = () => {
  uni.navigateTo({ url: '/pages/calendar/index' })
}

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/target/index' })
}

const goToHelp = () => {
  uni.showToast({
    title: '帮助与反馈功能开发中',
    icon: 'none'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？所有数据将被清除。',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/checkin/index' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 48rpx 32rpx;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
}

.avatar-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
}

.user-info {
  margin-left: 24rpx;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.level {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.stats-section {
  padding: 0 24rpx;
  margin-top: -24rpx;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.15);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #6366f1;
}

.stat-label {
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  height: 64rpx;
  background: #e5e7eb;
}

.menu-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #f9fafb;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #1f2937;
}

.menu-arrow {
  font-size: 32rpx;
  color: #d1d5db;
}

.achievements-section {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.achievements-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.achievement-item {
  width: calc((100% - 80rpx) / 5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 12rpx;
  background: #fff;
  border-radius: 16rpx;
  opacity: 0.4;
  filter: grayscale(1);
  
  &.unlocked {
    opacity: 1;
    filter: grayscale(0);
  }
}

.achievement-icon {
  font-size: 40rpx;
}

.achievement-name {
  font-size: 20rpx;
  color: #6b7280;
  margin-top: 8rpx;
  text-align: center;
}

.signout-section {
  padding: 24rpx;
}

.signout-btn {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  text-align: center;
  border: 2rpx solid #ef4444;
  
  &:active {
    background: #fef2f2;
  }
}

.signout-text {
  font-size: 30rpx;
  color: #ef4444;
  font-weight: 500;
}
</style>

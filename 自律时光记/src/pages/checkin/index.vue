<template>
  <view class="page">
    <view class="header">
      <view class="date-section">
        <text class="date-text">{{ currentDate }}</text>
        <text class="weekday-text">{{ weekday }}</text>
      </view>
      <view class="streak-badge" v-if="checkinStore.currentStreak > 0">
        <text class="streak-icon">🔥</text>
        <text class="streak-text">连续{{ checkinStore.currentStreak }}天</text>
      </view>
    </view>

    <view class="progress-section">
      <view class="progress-ring">
        <view class="ring-bg"></view>
        <view class="ring-progress" :style="{ '--progress': checkinStore.completionRate }"></view>
        <view class="ring-content">
          <text class="progress-percent">{{ checkinStore.completionRate }}%</text>
          <text class="progress-label">今日完成</text>
        </view>
      </view>
      <view class="progress-info">
        <text class="progress-count">{{ checkinStore.completedCount }}/{{ checkinStore.totalCount }}</text>
        <text class="progress-hint">{{ completionHint }}</text>
      </view>
    </view>

    <view class="water-section" v-if="hasWaterTarget">
      <view class="water-card">
        <view class="water-header">
          <text class="water-icon">💧</text>
          <text class="water-title">今日喝水</text>
        </view>
        <view class="water-progress">
          <view class="water-glass">
            <view class="water-fill" :style="{ height: waterProgressPercent + '%' }"></view>
            <view class="water-droplets">
              <text v-for="i in maxWaterDrops" :key="i" class="droplet" :class="{ filled: i <= checkinStore.waterTodayCount }">💧</text>
            </view>
          </view>
          <view class="water-stats">
            <text class="water-count">{{ checkinStore.waterTodayCount }}</text>
            <text class="water-divider">/</text>
            <text class="water-goal">{{ checkinStore.waterDailyGoal }} 杯</text>
          </view>
        </view>
        <view class="water-btn" @click="handleWaterCheckin">
          <text class="water-btn-text">+1 杯</text>
        </view>
      </view>
    </view>

    <view class="checkin-list">
      <view
        v-for="item in otherItems"
        :key="item.id"
        class="checkin-card"
        :class="{ completed: item.completed }"
        @click="handleCheckin(item)"
      >
        <view class="checkin-icon" :style="{ background: item.completed ? item.color + '20' : '#f3f4f6' }">
          <text class="icon-text">{{ item.icon }}</text>
        </view>
        <view class="checkin-info">
          <text class="checkin-name">{{ item.name }}</text>
          <text class="checkin-status">{{ item.completed ? '已完成' : '未完成' }}</text>
        </view>
        <view class="checkin-check">
          <view class="check-circle" :class="{ checked: item.completed }">
            <text v-if="item.completed" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <view class="motivation-card" v-if="showMotivation">
      <text class="motivation-quote">💪 {{ motivationQuote }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { checkinStore } from '@/stores/checkin'
import type { CheckinItem } from '@/types'

const waterItem = computed(() => checkinStore.today.value.items.find((i: CheckinItem) => i.id === 'water'))
const hasWaterTarget = computed(() => !!waterItem.value)

const otherItems = computed(() => checkinStore.today.value.items.filter((i: CheckinItem) => i.id !== 'water'))

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

const weekday = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})

const completionHint = computed(() => {
  const rate = checkinStore.completionRate.value
  if (rate === 0) return '开始今天的打卡吧！'
  if (rate < 50) return '加油，继续努力！'
  if (rate < 100) return '太棒了，差一点就完成了！'
  return '🎉 全部完成！'
})

const waterProgressPercent = computed(() => {
  return Math.min((checkinStore.waterTodayCount.value / checkinStore.waterDailyGoal.value) * 100, 100)
})

const maxWaterDrops = computed(() => Math.max(checkinStore.waterDailyGoal.value, 8))

const showMotivation = computed(() => checkinStore.completionRate.value === 100)

const motivationQuotes = [
  '坚持就是胜利！',
  '自律给你自由！',
  '今天的努力是明天的底气！',
  '你真的很棒！',
  '每一天都是新的开始！'
]

const motivationQuote = computed(() => {
  return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)]
})

const handleCheckin = (item: CheckinItem) => {
  if (!item.completed) {
    checkinStore.checkin(item.id)
    uni.showToast({
      title: `${item.name}打卡成功！`,
      icon: 'success',
      duration: 1500
    })
  }
}

const handleWaterCheckin = () => {
  checkinStore.checkin('water')
  uni.showToast({
    title: `已喝${checkinStore.waterTodayCount.value}杯水`,
    icon: 'success',
    duration: 1500
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #6366f1 0%, #f5f5f5 30%);
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.date-section {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
}

.weekday-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.streak-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 40rpx;
}

.streak-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.streak-text {
  font-size: 24rpx;
  color: #fff;
}

.progress-section {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.15);
  margin-bottom: 32rpx;
}

.progress-ring {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  flex-shrink: 0;
}

.ring-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f3f4f6;
}

.ring-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #6366f1 calc(var(--progress) * 1%),
    #f3f4f6 calc(var(--progress) * 1%)
  );
  mask: radial-gradient(farthest-side, transparent calc(100% - 12rpx), #fff calc(100% - 12rpx));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 12rpx), #fff calc(100% - 12rpx));
}

.ring-content {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 32rpx;
  font-weight: 700;
  color: #6366f1;
}

.progress-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.progress-info {
  flex: 1;
  margin-left: 32rpx;
}

.progress-count {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1f2937;
}

.progress-hint {
  display: block;
  font-size: 26rpx;
  color: #6b7280;
  margin-top: 8rpx;
}

.water-section {
  margin-bottom: 32rpx;
}

.water-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 24rpx;
  padding: 32rpx;
}

.water-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.water-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.water-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e40af;
}

.water-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.water-glass {
  flex: 1;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  margin-right: 24rpx;
}

.water-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  transition: height 0.3s ease-out;
}

.water-droplets {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  gap: 8rpx;
}

.droplet {
  font-size: 24rpx;
  opacity: 0.3;
  transition: opacity 0.3s ease-out;
  
  &.filled {
    opacity: 1;
  }
}

.water-stats {
  display: flex;
  align-items: baseline;
}

.water-count {
  font-size: 48rpx;
  font-weight: 700;
  color: #1e40af;
}

.water-divider {
  font-size: 28rpx;
  color: #64748b;
  margin: 0 4rpx;
}

.water-goal {
  font-size: 26rpx;
  color: #64748b;
}

.water-btn {
  background: #3b82f6;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  
  &:active {
    opacity: 0.85;
  }
}

.water-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checkin-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-out;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.completed {
    background: #f0fdf4;
    
    .checkin-icon {
      transform: scale(1.1);
    }
    
    .checkin-name {
      color: #10b981;
    }
    
    .checkin-status {
      color: #10b981;
    }
  }
}

.checkin-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-out;
}

.icon-text {
  font-size: 40rpx;
}

.checkin-info {
  flex: 1;
  margin-left: 24rpx;
}

.checkin-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.checkin-status {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.checkin-check {
  margin-left: auto;
}

.check-circle {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 3rpx solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-out;
  
  &.checked {
    background: #10b981;
    border-color: #10b981;
  }
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.motivation-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-top: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(251, 191, 36, 0.2);
}

.motivation-quote {
  font-size: 30rpx;
  color: #92400e;
  font-weight: 500;
}
</style>

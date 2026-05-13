<template>
  <view class="page">
    <view class="section-title">
      <text class="title-text">打卡目标</text>
      <text class="title-hint">开启或关闭每日打卡项</text>
    </view>

    <view class="target-list">
      <view
        v-for="target in checkinStore.targets"
        :key="target.id"
        class="target-card"
        @click="toggleTarget(target.id)"
      >
        <view class="target-icon" :style="{ background: target.enabled ? target.color + '20' : '#f3f4f6' }">
          <text class="icon-text">{{ target.icon }}</text>
        </view>
        <view class="target-info">
          <text class="target-name">{{ target.name }}</text>
          <text class="target-reminder" v-if="target.reminderTime">提醒时间: {{ target.reminderTime }}</text>
        </view>
        <view class="target-switch" :class="{ active: target.enabled }" @click.stop="toggleTarget(target.id)">
          <view class="switch-thumb"></view>
        </view>
      </view>
    </view>

    <view class="section-title mt-4">
      <text class="title-text">喝水目标设置</text>
      <text class="title-hint">设置每日喝水杯数目标</text>
    </view>

    <view class="water-goal-card">
      <view class="water-goal-header">
        <text class="water-goal-icon">💧</text>
        <text class="water-goal-title">每日喝水目标</text>
      </view>
      <view class="water-goal-value">
        <text class="goal-number">{{ waterGoal }}</text>
        <text class="goal-unit">杯</text>
      </view>
      <view class="water-goal-slider">
        <slider
          :value="waterGoal"
          :min="4"
          :max="12"
          :step="1"
          activeColor="#3b82f6"
          backgroundColor="#e5e7eb"
          block-size="24"
          @change="onWaterGoalChange"
        />
        <view class="slider-labels">
          <text class="label-text">4杯</text>
          <text class="label-text">8杯</text>
          <text class="label-text">12杯</text>
        </view>
      </view>
    </view>

    <view class="section-title mt-4">
      <text class="title-text">作息计划</text>
      <text class="title-hint">设置您的理想作息时间</text>
    </view>

    <view class="schedule-card">
      <view class="schedule-item">
        <view class="schedule-icon">🌅</view>
        <view class="schedule-info">
          <text class="schedule-label">起床时间</text>
          <text class="schedule-time">{{ schedule.wakeUp }}</text>
        </view>
        <picker mode="time" :value="schedule.wakeUp" @change="onWakeUpChange">
          <view class="schedule-arrow">›</view>
        </picker>
      </view>
      <view class="schedule-divider"></view>
      <view class="schedule-item">
        <view class="schedule-icon">🌙</view>
        <view class="schedule-info">
          <text class="schedule-label">睡觉时间</text>
          <text class="schedule-time">{{ schedule.sleep }}</text>
        </view>
        <picker mode="time" :value="schedule.sleep" @change="onSleepChange">
          <view class="schedule-arrow">›</view>
        </picker>
      </view>
    </view>

    <view class="section-title mt-4">
      <text class="title-text">提醒设置</text>
    </view>

    <view class="reminder-card">
      <view class="reminder-item">
        <text class="reminder-label">打卡提醒</text>
        <view class="reminder-switch" :class="{ active: reminders.checkin }" @click="toggleReminder('checkin')">
          <view class="switch-thumb"></view>
        </view>
      </view>
      <view v-if="reminders.checkin" class="reminder-time">
        <text class="time-label">提醒时间</text>
        <picker mode="time" :value="reminders.checkinTime" @change="onCheckinTimeChange">
          <view class="time-value">{{ reminders.checkinTime }}</view>
        </picker>
      </view>
      <view class="reminder-divider"></view>
      <view class="reminder-item">
        <text class="reminder-label">早睡提醒</text>
        <view class="reminder-switch" :class="{ active: reminders.sleep }" @click="toggleReminder('sleep')">
          <view class="switch-thumb"></view>
        </view>
      </view>
      <view v-if="reminders.sleep" class="reminder-time">
        <text class="time-label">提醒时间</text>
        <picker mode="time" :value="reminders.sleepTime" @change="onSleepTimeChange">
          <view class="time-value">{{ reminders.sleepTime }}</view>
        </picker>
      </view>
      <view class="reminder-divider"></view>
      <view class="reminder-item">
        <text class="reminder-label">喝水提醒</text>
        <view class="reminder-switch" :class="{ active: reminders.water }" @click="toggleReminder('water')">
          <view class="switch-thumb"></view>
        </view>
      </view>
      <view v-if="reminders.water" class="reminder-time">
        <text class="time-label">提醒间隔</text>
        <view class="time-value">{{ reminders.waterInterval }}小时</view>
      </view>
    </view>

    <view class="tips-card">
      <view class="tips-header">
        <text class="tips-icon">💡</text>
        <text class="tips-title">小贴士</text>
      </view>
      <text class="tips-content">成年人每天建议饮水量为8杯(约2000ml)，分多次小口饮用效果更佳。设置合理的喝水目标，养成良好的饮水习惯！</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { checkinStore } from '@/stores/checkin'

const schedule = reactive({
  wakeUp: '06:30',
  sleep: '22:30'
})

const reminders = reactive({
  checkin: true,
  checkinTime: '09:00',
  sleep: true,
  sleepTime: '22:00',
  water: true,
  waterInterval: 2
})

const waterGoal = computed(() => {
  const waterTarget = checkinStore.targets.find(t => t.id === 'water')
  return waterTarget?.dailyGoal || 8
})

const toggleTarget = (id: string) => {
  checkinStore.toggleTarget(id)
}

const toggleReminder = (type: 'checkin' | 'sleep' | 'water') => {
  reminders[type] = !reminders[type]
}

const onWaterGoalChange = (e: any) => {
  checkinStore.updateWaterGoal(e.detail.value)
}

const onWakeUpChange = (e: any) => {
  schedule.wakeUp = e.detail.value
}

const onSleepChange = (e: any) => {
  schedule.sleep = e.detail.value
}

const onCheckinTimeChange = (e: any) => {
  reminders.checkinTime = e.detail.value
}

const onSleepTimeChange = (e: any) => {
  reminders.sleepTime = e.detail.value
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 180rpx;
}

.section-title {
  margin-bottom: 20rpx;
}

.title-text {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.title-hint {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.mt-4 {
  margin-top: 32rpx;
}

.target-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.target-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.target-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 36rpx;
}

.target-info {
  flex: 1;
  margin-left: 20rpx;
}

.target-name {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #1f2937;
}

.target-reminder {
  display: block;
  font-size: 24rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.target-switch,
.reminder-switch {
  width: 88rpx;
  height: 48rpx;
  background: #d1d5db;
  border-radius: 24rpx;
  position: relative;
  transition: background 0.2s ease;
  
  &.active {
    background: #6366f1;
    
    .switch-thumb {
      transform: translateX(40rpx);
    }
  }
}

.switch-thumb {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  background: #fff;
  border-radius: 50%;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s ease;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.water-goal-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 20rpx;
  padding: 32rpx;
}

.water-goal-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.water-goal-icon {
  font-size: 40rpx;
  margin-right: 12rpx;
}

.water-goal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e40af;
}

.water-goal-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 32rpx;
}

.goal-number {
  font-size: 80rpx;
  font-weight: 700;
  color: #1e40af;
}

.goal-unit {
  font-size: 28rpx;
  color: #64748b;
  margin-left: 8rpx;
}

.water-goal-slider {
  padding: 0 16rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
}

.label-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.schedule-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.schedule-item {
  display: flex;
  align-items: center;
}

.schedule-icon {
  font-size: 40rpx;
}

.schedule-info {
  flex: 1;
  margin-left: 20rpx;
}

.schedule-label {
  display: block;
  font-size: 26rpx;
  color: #9ca3af;
}

.schedule-time {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-top: 4rpx;
}

.schedule-arrow {
  font-size: 32rpx;
  color: #d1d5db;
}

.schedule-divider {
  height: 1rpx;
  background: #f3f4f6;
  margin: 20rpx 0;
}

.reminder-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.reminder-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reminder-label {
  font-size: 30rpx;
  color: #1f2937;
}

.reminder-time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f9fafb;
  border-radius: 12rpx;
}

.time-label {
  font-size: 26rpx;
  color: #6b7280;
}

.time-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #6366f1;
}

.reminder-divider {
  height: 1rpx;
  background: #f3f4f6;
  margin: 20rpx 0;
}

.tips-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 32rpx;
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.tips-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #92400e;
}

.tips-content {
  font-size: 26rpx;
  color: #b45309;
  line-height: 1.6;
}
</style>

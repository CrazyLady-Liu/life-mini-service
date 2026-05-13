<template>
  <view class="page">
    <view class="calendar-header">
      <view class="month-nav">
        <view class="nav-btn" @click="prevMonth">
          <text class="nav-icon">‹</text>
        </view>
        <text class="month-title">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
        <view class="nav-btn" @click="nextMonth">
          <text class="nav-icon">›</text>
        </view>
      </view>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ monthCompletionRate }}%</text>
        <text class="stat-label">本月完成率</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ checkinDaysInMonth }}</text>
        <text class="stat-label">打卡天数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ checkinStore.currentStreak }}</text>
        <text class="stat-label">连续打卡</text>
      </view>
    </view>

    <view class="water-stats-card">
      <view class="water-stat-header">
        <text class="water-icon">💧</text>
        <text class="water-title">本月喝水统计</text>
      </view>
      <view class="water-stat-row">
        <view class="water-stat-item">
          <text class="water-stat-value">{{ monthlyWaterTotal }}</text>
          <text class="water-stat-label">累计杯数</text>
        </view>
        <view class="water-stat-item">
          <text class="water-stat-value">{{ monthlyWaterAverage }}</text>
          <text class="water-stat-label">日均杯数</text>
        </view>
        <view class="water-stat-item">
          <text class="water-stat-value">{{ waterDaysInMonth }}</text>
          <text class="water-stat-label">喝水天数</text>
        </view>
      </view>
    </view>

    <view class="calendar-card">
      <view class="weekday-row">
        <text v-for="day in weekdays" :key="day" class="weekday-item">{{ day }}</text>
      </view>
      <view class="dates-grid">
        <view
          v-for="(date, index) in calendarDates"
          :key="index"
          class="date-item"
          :class="{ 
            'other-month': !date.currentMonth,
            'today': date.isToday,
            'completed': date.completed,
            'selected': date.dateStr === selectedDate
          }"
          @click="selectDate(date)"
        >
          <text class="date-num">{{ date.day }}</text>
          <view v-if="date.completed" class="date-dot"></view>
          <view v-if="date.waterCount > 0" class="water-drop">💧</view>
        </view>
      </view>
    </view>

    <view v-if="selectedRecord" class="detail-card">
      <view class="detail-header">
        <text class="detail-date">{{ selectedDateLabel }}</text>
        <text class="detail-rate">完成率 {{ selectedRecord.completedCount }}/{{ selectedRecord.totalCount }}</text>
      </view>
      <view class="detail-water" v-if="selectedRecord.waterCount">
        <view class="water-progress-bar">
          <view class="water-fill-bar" :style="{ width: getWaterProgress() + '%' }"></view>
        </view>
        <text class="water-count-text">💧 喝水 {{ selectedRecord.waterCount }} 杯</text>
      </view>
      <view class="detail-list">
        <view
          v-for="item in selectedRecord.items"
          :key="item.id"
          class="detail-item"
          :class="{ completed: item.completed }"
        >
          <text class="detail-icon">{{ item.icon }}</text>
          <text class="detail-name">{{ item.name }}</text>
          <text class="detail-count" v-if="item.id === 'water' && item.count">({{ item.count }}杯)</text>
          <text class="detail-status">{{ item.completed ? '✓ 已完成' : '✗ 未完成' }}</text>
        </view>
      </view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">本月打卡趋势</text>
      </view>
      <view class="chart-bars">
        <view
          v-for="(record, index) in monthlyRecords"
          :key="index"
          class="bar-item"
        >
          <view class="bar-wrapper">
            <view
              class="bar-fill"
              :style="{ height: getBarHeight(record) + '%' }"
              :class="getBarClass(record)"
            ></view>
          </view>
          <text class="bar-label">{{ record.date.split('-')[2] }}</text>
        </view>
      </view>
    </view>

    <view class="water-chart-card">
      <view class="chart-header">
        <text class="chart-title">💧 喝水趋势</text>
      </view>
      <view class="chart-bars">
        <view
          v-for="(record, index) in monthlyRecords"
          :key="index"
          class="bar-item"
        >
          <view class="bar-wrapper">
            <view
              class="bar-fill water-bar"
              :style="{ height: getWaterBarHeight(record) + '%' }"
            ></view>
          </view>
          <text class="bar-label">{{ record.date.split('-')[2] }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { checkinStore } from '@/stores/checkin'
import type { DailyRecord, CheckinItem } from '@/types'

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref('')

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDate {
  day: number
  dateStr: string
  currentMonth: boolean
  isToday: boolean
  completed: boolean
  completedCount: number
  totalCount: number
  waterCount: number
}

const calendarDates = computed<CalendarDate[]>(() => {
  const result: CalendarDate[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const startPadding = firstDay.getDay()
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  for (let i = startPadding - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const month = currentMonth.value - 1
    const year = month < 0 ? currentYear.value - 1 : currentYear.value
    const actualMonth = month < 0 ? 11 : month
    const dateStr = `${year}-${String(actualMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = checkinStore.records[dateStr]
    
    result.push({
      day,
      dateStr,
      currentMonth: false,
      isToday: false,
      completed: record?.completedCount > 0 || false,
      completedCount: record?.completedCount || 0,
      totalCount: record?.totalCount || 5,
      waterCount: getWaterCount(record)
    })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = checkinStore.records[dateStr]
    
    result.push({
      day,
      dateStr,
      currentMonth: true,
      isToday: dateStr === todayStr,
      completed: record?.completedCount > 0 || false,
      completedCount: record?.completedCount || 0,
      totalCount: record?.totalCount || 5,
      waterCount: getWaterCount(record)
    })
  }

  const remaining = 42 - result.length
  for (let day = 1; day <= remaining; day++) {
    const month = currentMonth.value + 1
    const year = month > 11 ? currentYear.value + 1 : currentYear.value
    const actualMonth = month > 11 ? 0 : month
    const dateStr = `${year}-${String(actualMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const record = checkinStore.records[dateStr]
    
    result.push({
      day,
      dateStr,
      currentMonth: false,
      isToday: false,
      completed: record?.completedCount > 0 || false,
      completedCount: record?.completedCount || 0,
      totalCount: record?.totalCount || 5,
      waterCount: getWaterCount(record)
    })
  }

  return result
})

const monthlyRecords = computed(() => checkinStore.getRecordsByMonth(currentYear.value, currentMonth.value))

const monthCompletionRate = computed(() => {
  if (monthlyRecords.value.length === 0) return 0
  const total = monthlyRecords.value.reduce((acc, r) => acc + r.totalCount, 0)
  const completed = monthlyRecords.value.reduce((acc, r) => acc + r.completedCount, 0)
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const checkinDaysInMonth = computed(() => monthlyRecords.value.filter(r => r.completedCount > 0).length)

const monthlyWaterTotal = computed(() => monthlyRecords.value.reduce((acc, r) => acc + getWaterCount(r), 0))

const monthlyWaterAverage = computed(() => {
  const daysWithWater = monthlyRecords.value.filter(r => getWaterCount(r) > 0)
  if (daysWithWater.length === 0) return 0
  return Math.round(daysWithWater.reduce((acc, r) => acc + getWaterCount(r), 0) / daysWithWater.length)
})

const waterDaysInMonth = computed(() => monthlyRecords.value.filter(r => getWaterCount(r) > 0).length)

const selectedRecord = computed<DailyRecord | null>(() => {
  if (!selectedDate.value) return null
  return checkinStore.records[selectedDate.value] || null
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const [, month, day] = selectedDate.value.split('-')
  return `${parseInt(month)}月${parseInt(day)}日`
})

function getWaterCount(record: DailyRecord | undefined): number {
  if (!record) return 0
  const waterItem = record.items.find((item: CheckinItem) => item.id === 'water')
  return waterItem?.count || record.waterCount || 0
}

function getWaterProgress(): number {
  if (!selectedRecord.value) return 0
  return Math.min((selectedRecord.value.waterCount / checkinStore.waterDailyGoal.value) * 100, 100)
}

function getBarHeight(record: DailyRecord): number {
  if (record.totalCount === 0) return 0
  return (record.completedCount / record.totalCount) * 100
}

function getBarClass(record: DailyRecord): string {
  const height = getBarHeight(record)
  if (height < 50) return 'low'
  if (height < 80) return 'medium'
  return 'high'
}

function getWaterBarHeight(record: DailyRecord): number {
  return Math.min((getWaterCount(record) / 12) * 100, 100)
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  selectedDate.value = ''
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  selectedDate.value = ''
}

function selectDate(date: CalendarDate) {
  if (date.currentMonth) {
    selectedDate.value = date.dateStr
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 180rpx;
}

.calendar-header {
  margin-bottom: 24rpx;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.nav-icon {
  font-size: 36rpx;
  color: #6b7280;
}

.month-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.stats-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 32rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
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
  color: #fff;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.3);
}

.water-stats-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.water-stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.water-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.water-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e40af;
}

.water-stat-row {
  display: flex;
  justify-content: space-around;
}

.water-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.water-stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e40af;
}

.water-stat-label {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 4rpx;
}

.calendar-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.weekday-row {
  display: flex;
  margin-bottom: 16rpx;
}

.weekday-item {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #9ca3af;
}

.dates-grid {
  display: flex;
  flex-wrap: wrap;
}

.date-item {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12rpx;
  transition: all 0.2s ease-out;
  
  &:active {
    background: #f3f4f6;
  }
  
  &.other-month .date-num {
    color: #d1d5db;
  }
  
  &.today {
    background: #6366f1;
    .date-num { color: #fff; }
  }
  
  &.completed:not(.today) {
    background: #dcfce7;
  }
  
  &.selected {
    background: #e0e7ff;
    .date-num { color: #6366f1; font-weight: 600; }
  }
}

.date-num {
  font-size: 28rpx;
  color: #1f2937;
}

.date-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #10b981;
  margin-top: 4rpx;
}

.water-drop {
  font-size: 16rpx;
  position: absolute;
  bottom: 4rpx;
  right: 8rpx;
}

.detail-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-date {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.detail-rate {
  font-size: 26rpx;
  color: #6366f1;
  font-weight: 500;
}

.detail-water {
  margin-bottom: 20rpx;
}

.water-progress-bar {
  height: 12rpx;
  background: #e5e7eb;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.water-fill-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease-out;
}

.water-count-text {
  font-size: 26rpx;
  color: #3b82f6;
  font-weight: 500;
}

.detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  
  &.completed {
    background: #f0fdf4;
    .detail-name, .detail-status { color: #10b981; }
  }
}

.detail-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.detail-name {
  font-size: 26rpx;
  color: #374151;
}

.detail-count {
  font-size: 22rpx;
  color: #6b7280;
  margin-left: 4rpx;
}

.detail-status {
  font-size: 22rpx;
  color: #9ca3af;
  margin-left: 8rpx;
}

.chart-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.water-chart-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
}

.chart-header {
  margin-bottom: 24rpx;
}

.chart-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 200rpx;
  gap: 8rpx;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 8rpx 8rpx 0 0;
  transition: height 0.3s ease-out;
  
  &.low { background: #ef4444; }
  &.medium { background: #f59e0b; }
  &.high { background: #10b981; }
  &.water-bar { background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); }
}

.bar-label {
  font-size: 20rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}
</style>

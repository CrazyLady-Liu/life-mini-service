<template>
  <view class="page">
    <view class="stats-overview">
      <view class="overview-card">
        <view class="overview-item">
          <text class="overview-value">{{ feedingStore.feedingStats.totalFeedings }}</text>
          <text class="overview-label">累计投喂</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-value">{{ feedingStore.feedingStats.totalDays }}</text>
          <text class="overview-label">投喂天数</text>
        </view>
        <view class="overview-divider"></view>
        <view class="overview-item">
          <text class="overview-value">{{ feedingStore.feedingStats.currentStreak }}</text>
          <text class="overview-label">连续天数</text>
        </view>
      </view>
    </view>

    <view class="animal-stats">
      <view class="animal-stats-title">📊 投喂动物分布</view>
      <view class="animal-stats-row">
        <view class="animal-stat-item">
          <view class="animal-stat-icon cat">🐱</view>
          <text class="animal-stat-count">{{ feedingStore.feedingStats.catCount }}</text>
          <text class="animal-stat-label">猫咪</text>
        </view>
        <view class="animal-stat-item">
          <view class="animal-stat-icon dog">🐶</view>
          <text class="animal-stat-count">{{ feedingStore.feedingStats.dogCount }}</text>
          <text class="animal-stat-label">狗狗</text>
        </view>
        <view class="animal-stat-item">
          <view class="animal-stat-icon other">🐾</view>
          <text class="animal-stat-count">{{ feedingStore.feedingStats.otherCount }}</text>
          <text class="animal-stat-label">其他</text>
        </view>
      </view>
    </view>

    <view class="calendar-section">
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

      <view class="month-summary">
        <view class="summary-item">
          <text class="summary-value">{{ monthTotal }}</text>
          <text class="summary-label">本月投喂</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ monthDays }}</text>
          <text class="summary-label">投喂天数</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ weekAverage }}</text>
          <text class="summary-label">周均投喂</text>
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
              'has-record': date.hasRecord,
              'selected': date.dateStr === selectedDate
            }"
            @click="selectDate(date)"
          >
            <text class="date-num">{{ date.day }}</text>
            <view v-if="date.hasRecord" class="date-dot">
              <text class="dot-text">{{ date.count }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="selectedDayRecords.length > 0" class="day-detail">
      <view class="detail-header">
        <text class="detail-title">📋 {{ selectedDateLabel }} 投喂记录</text>
        <text class="detail-count">{{ selectedDayRecords.length }}条</text>
      </view>
      <view class="detail-list">
        <view
          v-for="record in selectedDayRecords"
          :key="record.id"
          class="detail-item"
        >
          <view class="detail-time">
            <text class="detail-time-text">{{ record.time }}</text>
          </view>
          <view class="detail-content">
            <view class="detail-animal">
              <text class="detail-animal-icon">{{ getAnimalIcon(record.animalType) }}</text>
              <text class="detail-animal-type">{{ record.animalTypeLabel }}</text>
            </view>
            <text class="detail-food">{{ record.food }}</text>
            <text class="detail-location">📍 {{ record.location }}</text>
            <text v-if="record.notes" class="detail-notes">📝 {{ record.notes }}</text>
          </view>
          <image v-if="record.photo" :src="record.photo" class="detail-photo" mode="aspectFill" />
        </view>
      </view>
    </view>

    <view class="chart-section">
      <view class="chart-header">
        <text class="chart-title">📈 本月投喂趋势</text>
      </view>
      <view class="chart-bars">
        <view
          v-for="(data, index) in chartData"
          :key="index"
          class="chart-bar-item"
        >
          <view class="bar-wrapper">
            <view
              class="bar-fill"
              :style="{ height: data.height + '%' }"
            ></view>
          </view>
          <text class="bar-label">{{ data.day }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { feedingStore } from '@/stores/feeding'
import type { AnimalType, FeedingRecord } from '@/types'

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref('')

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDate {
  day: number
  dateStr: string
  currentMonth: boolean
  isToday: boolean
  hasRecord: boolean
  count: number
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
    const records = feedingStore.getRecordsByDate(dateStr)
    
    result.push({
      day,
      dateStr,
      currentMonth: false,
      isToday: false,
      hasRecord: records.length > 0,
      count: records.length
    })
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const records = feedingStore.getRecordsByDate(dateStr)
    
    result.push({
      day,
      dateStr,
      currentMonth: true,
      isToday: dateStr === todayStr,
      hasRecord: records.length > 0,
      count: records.length
    })
  }

  const remaining = 42 - result.length
  for (let day = 1; day <= remaining; day++) {
    const month = currentMonth.value + 1
    const year = month > 11 ? currentYear.value + 1 : currentYear.value
    const actualMonth = month > 11 ? 0 : month
    const dateStr = `${year}-${String(actualMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const records = feedingStore.getRecordsByDate(dateStr)
    
    result.push({
      day,
      dateStr,
      currentMonth: false,
      isToday: false,
      hasRecord: records.length > 0,
      count: records.length
    })
  }

  return result
})

const monthRecords = computed(() => {
  return feedingStore.getRecordsByMonth(currentYear.value, currentMonth.value)
})

const monthTotal = computed(() => monthRecords.value.length)

const monthDays = computed(() => {
  const dates = new Set(monthRecords.value.map(r => r.date))
  return dates.size
})

const weekAverage = computed(() => {
  const days = monthDays.value
  if (days === 0) return 0
  return Math.round(monthTotal.value / Math.ceil(days / 7))
})

const selectedDayRecords = computed<FeedingRecord[]>(() => {
  if (!selectedDate.value) return []
  return feedingStore.getRecordsByDate(selectedDate.value)
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const [, month, day] = selectedDate.value.split('-')
  return `${parseInt(month)}月${parseInt(day)}日`
})

const chartData = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const data: { day: string; count: number; height: number }[] = []
  
  let maxCount = 0
  const dailyCounts: number[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const count = feedingStore.getRecordsByDate(dateStr).length
    dailyCounts.push(count)
    maxCount = Math.max(maxCount, count)
  }
  
  const maxHeight = maxCount > 0 ? maxCount : 1
  
  for (let day = 1; day <= daysInMonth; day++) {
    const count = dailyCounts[day - 1]
    data.push({
      day: String(day),
      count,
      height: maxCount > 0 ? (count / maxHeight) * 100 : 0
    })
  }
  
  return data
})

function getAnimalIcon(type: AnimalType): string {
  const icons: Record<AnimalType, string> = {
    cat: '🐱',
    dog: '🐶',
    other: '🐾'
  }
  return icons[type]
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

.stats-overview {
  margin-bottom: 20rpx;
}

.overview-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  padding: 32rpx;
  border-radius: 20rpx;
}

.overview-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overview-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.overview-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.overview-divider {
  width: 1rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.3);
}

.animal-stats {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.animal-stats-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.animal-stats-row {
  display: flex;
  justify-content: space-around;
}

.animal-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.animal-stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 8rpx;
  
  &.cat {
    background: #fef3c7;
  }
  
  &.dog {
    background: #dbeafe;
  }
  
  &.other {
    background: #d1fae5;
  }
}

.animal-stat-count {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}

.animal-stat-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.calendar-section {
  margin-bottom: 20rpx;
}

.calendar-header {
  margin-bottom: 16rpx;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
}

.nav-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  
  &:active {
    background: #e5e7eb;
  }
}

.nav-icon {
  font-size: 32rpx;
  color: #6b7280;
}

.month-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.month-summary {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 20rpx;
  margin-top: 12rpx;
  border-radius: 16rpx;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #f97316;
}

.summary-label {
  font-size: 22rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.calendar-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 12rpx;
}

.weekday-row {
  display: flex;
  margin-bottom: 12rpx;
}

.weekday-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
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
    background: #f97316;
    .date-num { color: #fff; }
    .date-dot { background: rgba(255, 255, 255, 0.3); }
    .dot-text { color: #fff; }
  }
  
  &.has-record:not(.today) {
    .date-num {
      color: #f97316;
      font-weight: 600;
    }
  }
  
  &.selected:not(.today) {
    background: #ffedd5;
  }
}

.date-num {
  font-size: 26rpx;
  color: #1f2937;
}

.date-dot {
  margin-top: 4rpx;
  padding: 2rpx 10rpx;
  background: #fed7aa;
  border-radius: 20rpx;
}

.dot-text {
  font-size: 18rpx;
  color: #f97316;
  font-weight: 500;
}

.day-detail {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.detail-count {
  font-size: 24rpx;
  color: #f97316;
  font-weight: 500;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background: #f9fafb;
  border-radius: 12rpx;
}

.detail-time {
  flex-shrink: 0;
  width: 80rpx;
}

.detail-time-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #f97316;
}

.detail-content {
  flex: 1;
  margin-left: 12rpx;
}

.detail-animal {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.detail-animal-icon {
  font-size: 26rpx;
  margin-right: 6rpx;
}

.detail-animal-type {
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2937;
}

.detail-food {
  display: block;
  font-size: 24rpx;
  color: #374151;
  margin-bottom: 4rpx;
}

.detail-location {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  margin-bottom: 4rpx;
}

.detail-notes {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
}

.detail-photo {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.chart-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
}

.chart-header {
  margin-bottom: 20rpx;
}

.chart-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 200rpx;
  gap: 4rpx;
  overflow-x: auto;
}

.chart-bar-item {
  flex: 0 0 auto;
  width: 24rpx;
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
  background: linear-gradient(180deg, #f97316 0%, #fb923c 100%);
  border-radius: 4rpx 4rpx 0 0;
  min-height: 4rpx;
  transition: height 0.3s ease-out;
}

.bar-label {
  font-size: 18rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}
</style>

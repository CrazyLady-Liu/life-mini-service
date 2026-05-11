<template>
  <div class="home-page">
    <div class="header">
      <div class="header-content">
        <h1>小芽成长录</h1>
        <p class="date-today">{{ todayDate }}</p>
      </div>
    </div>

    <div class="content">
      <!-- 宝宝核心信息卡片 -->
      <div class="baby-info-card">
        <div class="baby-main" @click="$router.push('/profile')">
          <div class="baby-avatar">{{ babyStore.avatar || '👶' }}</div>
          <div class="baby-details">
            <h2>{{ babyStore.name || '请设置宝宝信息' }}</h2>
            <p class="baby-age" v-if="babyStore.age">
              {{ babyStore.gender === 'boy' ? '男宝' : '女宝' }} · {{ babyStore.age }}
            </p>
          </div>
        </div>
        <div class="growth-summary" v-if="growthStore.latestGrowth">
          <div class="growth-data-item">
            <span class="growth-value">{{ growthStore.latestGrowth.height }}</span>
          <span class="growth-unit">cm</span>
            <span class="growth-label">身高</span>
          </div>
          <div class="growth-divider"></div>
          <div class="growth-data-item">
            <span class="growth-value">{{ growthStore.latestGrowth.weight }}</span>
          <span class="growth-unit">kg</span>
            <span class="growth-label">体重</span>
          </div>
        </div>
      </div>

      <!-- 疫苗倒计时提醒 -->
      <div class="vaccine-countdown-card" v-if="nearestVaccine">
        <div class="countdown-header">
          <span class="countdown-icon">💉</span>
          <span class="countdown-title">疫苗提醒</span>
          <span class="countdown-tag urgent" v-if="daysUntil <= 3">紧急</span>
          <span class="countdown-tag upcoming" v-else-if="daysUntil <= 7">近期</span>
        </div>
        <div class="countdown-content">
          <h3>{{ nearestVaccine.name }}</h3>
          <div class="countdown-info">
            <span class="countdown-days">
              <span class="days-num">{{ daysUntil }}</span>
              <span class="days-text">天后</span>
            </span>
            <span class="countdown-date">{{ formatDate(nearestVaccine.date) }}</span>
          </div>
        </div>
      </div>

      <!-- 身高体重趋势图 -->
      <div class="section chart-section" v-if="growthRecordsForChart.length >= 2">
        <div class="section-title">
          <span class="icon">📈</span>
          <h3>生长趋势</h3>
        </div>
        <div class="chart-container">
          <div class="chart-item">
            <div class="chart-label">身高 (cm)</div>
            <svg class="line-chart" viewBox="0 0 300 120" preserveAspectRatio="none">
              <polyline :points="heightChartPoints" fill="none" stroke="#667eea" stroke-width="2" />
              <circle v-for="(point, index) in heightChartPointsArray" :key="index" :cx="point.x" :cy="point.y" r="4" fill="#667eea" />
            </svg>
            <div class="chart-x-axis">
              <span v-for="(record, index) in growthRecordsForChart" :key="index" class="chart-date">{{ formatShortDate(record.date) }}</span>
            </div>
          </div>
          <div class="chart-divider"></div>
          <div class="chart-item">
            <div class="chart-label">体重 (kg)</div>
            <svg class="line-chart" viewBox="0 0 300 120" preserveAspectRatio="none">
              <polyline :points="weightChartPoints" fill="none" stroke="#764ba2" stroke-width="2" />
              <circle v-for="(point, index) in weightChartPointsArray" :key="index" :cx="point.x" :cy="point.y" r="4" fill="#764ba2" />
            </svg>
            <div class="chart-x-axis">
              <span v-for="(record, index) in growthRecordsForChart" :key="index" class="chart-date">{{ formatShortDate(record.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 近期疫苗列表 -->
      <div class="section">
        <div class="section-title">
          <span class="icon">💉</span>
          <h3>近期疫苗</h3>
        </div>
        <div class="vaccine-list" v-if="vaccineStore.upcomingVaccines.length > 0">
          <div class="vaccine-item" v-for="v in vaccineStore.upcomingVaccines.slice(0, 3)" :key="v.id">
            <div class="vaccine-name">{{ v.name }}</div>
            <div class="vaccine-date">{{ formatDate(v.date) }}</div>
          </div>
        </div>
        <div class="empty-tip" v-else>
          <p>暂无疫苗提醒</p>
        </div>
      </div>

      <!-- 最新成长记录 -->
      <div class="section">
        <div class="section-title">
          <span class="icon">📝</span>
          <h3>成长点滴</h3>
        </div>
        <div class="record-list" v-if="recordStore.records.length > 0">
          <div class="record-item" v-for="r in recordStore.records.slice(0, 3)" :key="r.id">
            <div class="record-icon">✨</div>
            <div class="record-content-wrapper">
              <div class="record-content">{{ r.content }}</div>
              <div class="record-time">{{ formatDate(r.createTime) }}</div>
            </div>
          </div>
        </div>
        <div class="empty-tip" v-else>
          <p>暂无成长记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { useVaccineStore } from '@/stores/vaccine'
import { useGrowthStore } from '@/stores/growth'
import { useRecordStore } from '@/stores/record'
import dayjs from 'dayjs'

const babyStore = useBabyStore()
const vaccineStore = useVaccineStore()
const growthStore = useGrowthStore()
const recordStore = useRecordStore()

const todayDate = dayjs().format('YYYY年MM月DD日 dddd')

const nearestVaccine = computed(() => {
  if (vaccineStore.upcomingVaccines.length === 0) return null
  return vaccineStore.upcomingVaccines[0]
})

const daysUntil = computed(() => {
  if (!nearestVaccine.value) return 0
  return dayjs(nearestVaccine.value.date).diff(dayjs(), 'day')
})

const growthRecordsForChart = computed(() => {
  const records = [...growthStore.growthRecords]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  return records.slice(-5)
})

const heightChartPoints = computed(() => {
  if (growthRecordsForChart.value.length < 2) return ''
  
  const heights = growthRecordsForChart.value.map(r => parseFloat(r.height))
  const minH = Math.min(...heights)
  const maxH = Math.max(...heights)
  const range = maxH - minH || 1
  
  const padding = 20
  const width = 300
  const height = 120
  const stepX = (width - padding * 2) / (heights.length - 1)
  
  return heights.map((h, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((h - minH) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')
})

const weightChartPoints = computed(() => {
  if (growthRecordsForChart.value.length < 2) return ''
  
  const weights = growthRecordsForChart.value.map(r => parseFloat(r.weight))
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1
  
  const padding = 20
  const width = 300
  const height = 120
  const stepX = (width - padding * 2) / (weights.length - 1)
  
  return weights.map((w, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((w - minW) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')
})

const heightChartPointsArray = computed(() => {
  if (growthRecordsForChart.value.length < 2) return []
  
  const heights = growthRecordsForChart.value.map(r => parseFloat(r.height))
  const minH = Math.min(...heights)
  const maxH = Math.max(...heights)
  const range = maxH - minH || 1
  
  const padding = 20
  const width = 300
  const height = 120
  const stepX = (width - padding * 2) / (heights.length - 1)
  
  return heights.map((h, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((h - minH) / range) * (height - padding * 2)
    return { x, y }
  })
})

const weightChartPointsArray = computed(() => {
  if (growthRecordsForChart.value.length < 2) return []
  
  const weights = growthRecordsForChart.value.map(r => parseFloat(r.weight))
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1
  
  const padding = 20
  const width = 300
  const height = 120
  const stepX = (width - padding * 2) / (weights.length - 1)
  
  return weights.map((w, i) => {
    const x = padding + i * stepX
    const y = height - padding - ((w - minW) / range) * (height - padding * 2)
    return { x, y }
  })
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatShortDate = (date) => {
  return dayjs(date).format('MM-DD')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px 80px;
}

.header-content {
  color: white;
}

.header-content h1 {
  font-size: 24px;
  margin-bottom: 5px;
  font-weight: 600;
}

.date-today {
  font-size: 14px;
  opacity: 0.9;
}

.content {
  padding: 0 15px;
  margin-top: -40px;
}

.baby-info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.baby-main {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  margin-bottom: 20px;
}

.baby-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.baby-details h2 {
  font-size: 20px;
  margin-bottom: 5px;
  color: #333;
}

.baby-details .baby-age {
  font-size: 14px;
  color: #666;
}

.growth-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.growth-data-item {
  text-align: center;
}

.growth-value {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  display: block;
  margin-bottom: 3px;
}

.growth-unit {
  font-size: 14px;
  color: #999;
  margin-right: 4px;
}

.growth-label {
  font-size: 13px;
  color: #666;
}

.growth-divider {
  width: 1px;
  height: 50px;
  background: #f0f0f0;
}

.vaccine-countdown-card {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3);
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.countdown-icon {
  font-size: 20px;
}

.countdown-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.countdown-tag {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.countdown-tag.urgent {
  background: #ff4757;
  color: white;
}

.countdown-tag.upcoming {
  background: #ffa502;
  color: white;
}

.countdown-content h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.countdown-info {
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.countdown-days {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.days-num {
  font-size: 36px;
  font-weight: bold;
  color: #ff4757;
}

.days-text {
  font-size: 16px;
  color: #666;
}

.countdown-date {
  font-size: 14px;
  color: #666;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.section-title .icon {
  font-size: 20px;
}

.section-title h3 {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.chart-section {
  padding: 20px;
}

.chart-container {
  display: flex;
  gap: 15px;
}

.chart-item {
  flex: 1;
}

.chart-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
}

.line-chart {
  width: 100%;
  height: 120px;
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.chart-date {
  font-size: 11px;
  color: #999;
}

.chart-divider {
  width: 1px;
  background: #f0f0f0;
}

.vaccine-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.vaccine-item:last-child {
  border-bottom: none;
}

.vaccine-name {
  font-size: 14px;
  color: #333;
}

.vaccine-date {
  font-size: 13px;
  color: #ff6b6b;
}

.record-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  font-size: 18px;
  margin-top: 2px;
}

.record-content-wrapper {
  flex: 1;
}

.record-content {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>

import { reactive, computed } from 'vue'
import type { CheckinItem, DailyRecord, TargetSetting, WaterStats } from '@/types'

const DEFAULT_TARGETS: TargetSetting[] = [
  { id: 'early', name: '早起', icon: '🌅', color: '#f59e0b', enabled: true, reminderTime: '06:30', dailyGoal: 1 },
  { id: 'early_sleep', name: '早睡', icon: '🌙', color: '#6366f1', enabled: true, reminderTime: '22:30', dailyGoal: 1 },
  { id: 'exercise', name: '运动', icon: '💪', color: '#10b981', enabled: true, reminderTime: '19:00', dailyGoal: 1 },
  { id: 'water', name: '喝水', icon: '💧', color: '#3b82f6', enabled: true, reminderTime: '09:00', dailyGoal: 8 },
  { id: 'study', name: '学习', icon: '📚', color: '#8b5cf6', enabled: true, reminderTime: '20:00', dailyGoal: 1 }
]

const STORAGE_KEYS = {
  TARGETS: 'checkin_targets',
  RECORDS: 'checkin_records'
}

function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function safeParse<T>(str: string | null, defaultValue: T): T {
  if (!str) return defaultValue
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

function generateMockRecords(): Record<string, DailyRecord> {
  const records: Record<string, DailyRecord> = {}
  const today = new Date()
  
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const items: CheckinItem[] = DEFAULT_TARGETS.map(target => ({
      id: target.id,
      name: target.name,
      icon: target.icon,
      color: target.color,
      completed: Math.random() > 0.3,
      count: target.id === 'water' ? Math.floor(Math.random() * 10) + 1 : undefined
    }))
    
    const waterItem = items.find(i => i.id === 'water')
    
    records[dateStr] = {
      date: dateStr,
      items,
      completedCount: items.filter(i => i.completed).length,
      totalCount: items.length,
      waterCount: waterItem?.count || 0
    }
  }
  
  return records
}

function trySaveStorage(key: string, value: string): boolean {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch {
    console.warn(`Storage save failed for key: ${key}`)
    return false
  }
}

const state = reactive({
  targets: ((): TargetSetting[] => {
    const saved = uni.getStorageSync(STORAGE_KEYS.TARGETS)
    const parsed = safeParse(saved, null)
    return parsed && Array.isArray(parsed) ? parsed : DEFAULT_TARGETS
  })(),
  
  records: ((): Record<string, DailyRecord> => {
    const saved = uni.getStorageSync(STORAGE_KEYS.RECORDS)
    const parsed = safeParse(saved, null)
    return parsed && typeof parsed === 'object' ? parsed : generateMockRecords()
  })()
})

const today = computed(() => {
  const dateStr = getTodayString()
  if (!state.records[dateStr]) {
    state.records[dateStr] = {
      date: dateStr,
      items: state.targets
        .filter(t => t.enabled)
        .map(t => ({
          id: t.id,
          name: t.name,
          icon: t.icon,
          color: t.color,
          completed: false,
          count: t.id === 'water' ? 0 : undefined
        })),
      completedCount: 0,
      totalCount: state.targets.filter(t => t.enabled).length,
      waterCount: 0
    }
  }
  return state.records[dateStr]
})

const completedCount = computed(() => today.value.completedCount)
const totalCount = computed(() => today.value.totalCount)
const completionRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

const currentStreak = computed(() => {
  let streak = 0
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const record = state.records[dateStr]
    if (record && record.completedCount > 0) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  
  return streak
})

const totalCheckinDays = computed(() => {
  return Object.values(state.records).filter((r: DailyRecord) => r.completedCount > 0).length
})

const waterTodayCount = computed(() => {
  const waterItem = today.value.items.find((i: CheckinItem) => i.id === 'water')
  return waterItem?.count || 0
})

const waterDailyGoal = computed(() => {
  const waterTarget = state.targets.find(t => t.id === 'water')
  return waterTarget?.dailyGoal || 8
})

const waterStats = computed((): WaterStats => {
  const today = new Date()
  let monthlyTotal = 0
  let weeklyTotal = 0
  let totalDays = 0
  let longestStreak = 0
  let currentStreakCount = 0
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const record = state.records[dateStr]
    if (record) {
      const waterItem = record.items.find((item: CheckinItem) => item.id === 'water')
      const count = waterItem?.count || record.waterCount || 0
      
      if (count > 0) {
        currentStreakCount++
        longestStreak = Math.max(longestStreak, currentStreakCount)
        totalDays++
        
        if (i < 30) monthlyTotal += count
        if (i < 7) weeklyTotal += count
      } else {
        currentStreakCount = 0
      }
    }
  }
  
  return {
    todayCount: waterTodayCount.value,
    todayGoal: waterDailyGoal.value,
    weeklyAverage: totalDays > 0 ? Math.round(weeklyTotal / Math.min(7, totalDays)) : 0,
    monthlyTotal,
    totalDays,
    longestStreak
  }
})

function checkin(itemId: string) {
  const item = today.value.items.find((i: CheckinItem) => i.id === itemId)
  if (!item) return
  
  if (itemId === 'water') {
    item.count = (item.count || 0) + 1
    today.value.waterCount = item.count
    if (item.count >= waterDailyGoal.value && !item.completed) {
      item.completed = true
      today.value.completedCount++
    }
  } else if (!item.completed) {
    item.completed = true
    today.value.completedCount++
  }
  saveRecords()
}

function updateTarget(id: string, updates: Partial<TargetSetting>) {
  const target = state.targets.find((t: TargetSetting) => t.id === id)
  if (!target) return
  
  Object.assign(target, updates)
  saveTargets()
  
  const dateStr = getTodayString()
  if (state.records[dateStr]) {
    const item = state.records[dateStr].items.find((i: CheckinItem) => i.id === id)
    if (item) {
      Object.assign(item, {
        name: updates.name ?? item.name,
        icon: updates.icon ?? item.icon,
        color: updates.color ?? item.color
      })
    }
  }
}

function updateWaterGoal(goal: number) {
  const waterTarget = state.targets.find(t => t.id === 'water')
  if (waterTarget) {
    waterTarget.dailyGoal = goal
    saveTargets()
  }
}

function toggleTarget(id: string) {
  const target = state.targets.find((t: TargetSetting) => t.id === id)
  if (!target) return
  
  target.enabled = !target.enabled
  saveTargets()
  
  const dateStr = getTodayString()
  if (!state.records[dateStr]) return
  
  const existingItem = state.records[dateStr].items.find((i: CheckinItem) => i.id === id)
  
  if (target.enabled && !existingItem) {
    state.records[dateStr].items.push({
      id: target.id,
      name: target.name,
      icon: target.icon,
      color: target.color,
      completed: false,
      count: target.id === 'water' ? 0 : undefined
    })
    state.records[dateStr].totalCount++
  } else if (!target.enabled && existingItem) {
    const index = state.records[dateStr].items.indexOf(existingItem)
    if (index > -1) {
      state.records[dateStr].items.splice(index, 1)
      state.records[dateStr].totalCount--
    }
  }
  saveRecords()
}

function getRecordsByMonth(year: number, month: number): DailyRecord[] {
  const result: DailyRecord[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const record = state.records[dateStr]
    if (record) result.push(record)
  }
  
  return result
}

function saveTargets() {
  trySaveStorage(STORAGE_KEYS.TARGETS, JSON.stringify(state.targets))
}

function saveRecords() {
  trySaveStorage(STORAGE_KEYS.RECORDS, JSON.stringify(state.records))
}

export const checkinStore = {
  get targets() { return state.targets },
  get records() { return state.records },
  today,
  completedCount,
  totalCount,
  completionRate,
  currentStreak,
  totalCheckinDays,
  waterTodayCount,
  waterDailyGoal,
  waterStats,
  checkin,
  updateTarget,
  updateWaterGoal,
  toggleTarget,
  getRecordsByMonth
}

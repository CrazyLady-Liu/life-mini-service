import { reactive, computed } from 'vue'
import type { FeedingRecord, DailyFeedingStats, FeedingStats, AnimalType } from '@/types'

const STORAGE_KEY = 'pet_feeding_records'

function getTodayString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

function getTimeString(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function safeParse<T>(str: string | null, defaultValue: T): T {
  if (!str) return defaultValue
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getAnimalTypeLabel(type: AnimalType): string {
  const labels: Record<AnimalType, string> = {
    cat: '猫咪',
    dog: '狗狗',
    other: '其他'
  }
  return labels[type]
}

function generateMockRecords(): FeedingRecord[] {
  const records: FeedingRecord[] = []
  const today = new Date()
  const locations = ['小区花园', '楼下便利店', '公园长椅', '停车场入口', '学校后门', '图书馆门口', '食堂旁']
  const foods = ['猫粮', '狗粮', '火腿肠', '剩饭', '专用罐头', '鸡胸肉', '小鱼干']
  const animalTypes: AnimalType[] = ['cat', 'dog', 'other']
  const notes = [
    '小家伙吃得很香',
    '小橘猫很亲人',
    '小黑狗一直摇尾巴',
    '喂了三只小猫',
    '今天带了罐头来',
    '流浪猫妈妈带着崽',
    '狗狗看起来很饿',
    '吃得干干净净',
    '明天还要来',
    ''
  ]
  
  for (let i = 45; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    let count: number
    const dayOfWeek = date.getDay()
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      count = Math.floor(Math.random() * 3) + 2
    } else if (dayOfWeek === 5) {
      count = Math.floor(Math.random() * 2) + 2
    } else {
      count = Math.floor(Math.random() * 2) + 1
    }
    
    if (i % 7 === 0) {
      count = Math.floor(Math.random() * 2) + 3
    }
    
    if (i === 0 || i === 1 || i === 2 || i === 3 || i === 5 || i === 7 || i === 10 || i === 14) {
      count = Math.max(count, Math.floor(Math.random() * 2) + 2)
    }
    
    for (let j = 0; j < count; j++) {
      let hour: number
      if (j === 0) {
        hour = Math.floor(Math.random() * 3) + 7
      } else if (j === 1) {
        hour = Math.floor(Math.random() * 3) + 12
      } else {
        hour = Math.floor(Math.random() * 4) + 17
      }
      const minute = Math.floor(Math.random() * 60)
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      
      let animalType: AnimalType
      const rand = Math.random()
      if (rand < 0.5) {
        animalType = 'cat'
      } else if (rand < 0.85) {
        animalType = 'dog'
      } else {
        animalType = 'other'
      }
      
      let food: string
      if (animalType === 'cat') {
        const catFoods = ['猫粮', '小鱼干', '鸡胸肉', '火腿肠', '剩饭']
        food = catFoods[Math.floor(Math.random() * catFoods.length)]
      } else if (animalType === 'dog') {
        const dogFoods = ['狗粮', '火腿肠', '剩饭', '鸡胸肉', '专用罐头']
        food = dogFoods[Math.floor(Math.random() * dogFoods.length)]
      } else {
        food = foods[Math.floor(Math.random() * foods.length)]
      }
      
      records.push({
        id: generateId(),
        timestamp: date.getTime() + (hour * 60 + minute) * 60000,
        date: dateStr,
        time: timeStr,
        location: locations[Math.floor(Math.random() * locations.length)],
        animalType,
        animalTypeLabel: getAnimalTypeLabel(animalType),
        food,
        notes: notes[Math.floor(Math.random() * notes.length)]
      })
    }
  }
  
  return records.sort((a, b) => b.timestamp - a.timestamp)
}

function trySaveStorage(value: string): boolean {
  try {
    uni.setStorageSync(STORAGE_KEY, value)
    return true
  } catch {
    console.warn('Storage save failed')
    return false
  }
}

const state = reactive({
  records: ((): FeedingRecord[] => {
    const saved = uni.getStorageSync(STORAGE_KEY)
    const parsed = safeParse(saved, null)
    return parsed && Array.isArray(parsed) ? parsed : generateMockRecords()
  })()
})

const todayRecords = computed(() => {
  const today = getTodayString()
  return state.records.filter(r => r.date === today)
})

const dailyStats = computed(() => {
  const statsMap = new Map<string, DailyFeedingStats>()
  
  state.records.forEach(record => {
    if (!statsMap.has(record.date)) {
      statsMap.set(record.date, {
        date: record.date,
        records: [],
        totalCount: 0,
        catCount: 0,
        dogCount: 0,
        otherCount: 0
      })
    }
    const stats = statsMap.get(record.date)!
    stats.records.push(record)
    stats.totalCount++
    if (record.animalType === 'cat') stats.catCount++
    else if (record.animalType === 'dog') stats.dogCount++
    else stats.otherCount++
  })
  
  return Array.from(statsMap.values()).sort((a, b) => b.date.localeCompare(a.date))
})

const feedingStats = computed<FeedingStats>(() => {
  const today = new Date()
  const todayStr = getTodayString()
  
  let totalFeedings = state.records.length
  let totalDays = dailyStats.value.length
  let currentStreak = 0
  let catCount = 0
  let dogCount = 0
  let otherCount = 0
  let weeklyTotal = 0
  let monthlyTotal = 0
  
  state.records.forEach(record => {
    if (record.animalType === 'cat') catCount++
    else if (record.animalType === 'dog') dogCount++
    else otherCount++
    
    const recordDate = new Date(record.date)
    const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff < 7) weeklyTotal++
    if (daysDiff < 30) monthlyTotal++
  })
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
    
    const hasRecord = dailyStats.value.some(s => s.date === dateStr)
    if (hasRecord) {
      currentStreak++
    } else if (i > 0) {
      break
    }
  }
  
  return {
    totalFeedings,
    totalDays,
    currentStreak,
    catCount,
    dogCount,
    otherCount,
    weeklyAverage: Math.round(weeklyTotal / 7),
    monthlyTotal
  }
})

function addRecord(record: Omit<FeedingRecord, 'id' | 'timestamp' | 'date' | 'time' | 'animalTypeLabel'>) {
  const newRecord: FeedingRecord = {
    ...record,
    id: generateId(),
    timestamp: Date.now(),
    date: getTodayString(),
    time: getTimeString(),
    animalTypeLabel: getAnimalTypeLabel(record.animalType)
  }
  
  state.records.unshift(newRecord)
  saveRecords()
  
  return newRecord
}

function deleteRecord(id: string) {
  const index = state.records.findIndex(r => r.id === id)
  if (index > -1) {
    state.records.splice(index, 1)
    saveRecords()
  }
}

function getRecordsByDate(date: string): FeedingRecord[] {
  return state.records.filter(r => r.date === date)
}

function getRecordsByMonth(year: number, month: number): FeedingRecord[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  return state.records.filter(r => r.date.startsWith(monthStr))
}

function saveRecords() {
  trySaveStorage(JSON.stringify(state.records))
}

function clearAllRecords() {
  state.records = []
  saveRecords()
}

function resetToMockData() {
  state.records = generateMockRecords()
  saveRecords()
  return state.records
}

export const feedingStore = {
  get records() { return state.records },
  todayRecords,
  dailyStats,
  feedingStats,
  addRecord,
  deleteRecord,
  getRecordsByDate,
  getRecordsByMonth,
  clearAllRecords,
  resetToMockData
}

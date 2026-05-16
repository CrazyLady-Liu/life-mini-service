export type AnimalType = 'cat' | 'dog' | 'other'

export interface FeedingRecord {
  id: string
  timestamp: number
  date: string
  time: string
  location: string
  animalType: AnimalType
  animalTypeLabel: string
  food: string
  notes: string
  photo?: string
}

export interface DailyFeedingStats {
  date: string
  records: FeedingRecord[]
  totalCount: number
  catCount: number
  dogCount: number
  otherCount: number
}

export interface UserProfile {
  nickname: string
  avatar: string
  phone: string
  totalFeedings: number
  totalDays: number
  currentStreak: number
}

export interface CalendarDay {
  date: string
  day: number
  currentMonth: boolean
  isToday: boolean
  hasRecord: boolean
  count: number
}

export interface FeedingStats {
  totalFeedings: number
  totalDays: number
  currentStreak: number
  catCount: number
  dogCount: number
  otherCount: number
  weeklyAverage: number
  monthlyTotal: number
}

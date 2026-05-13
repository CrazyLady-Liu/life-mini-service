export interface CheckinItem {
  id: string
  name: string
  icon: string
  color: string
  completed: boolean
  count?: number
}

export interface DailyRecord {
  date: string
  items: CheckinItem[]
  completedCount: number
  totalCount: number
  waterCount?: number
}

export interface TargetSetting {
  id: string
  name: string
  icon: string
  color: string
  enabled: boolean
  reminderTime: string | null
  dailyGoal?: number
}

export interface UserProfile {
  nickname: string
  avatar: string
  totalCheckinDays: number
  currentStreak: number
}

export interface CalendarDay {
  date: string
  completed: boolean
  completedCount: number
  totalCount: number
  waterCount?: number
}

export interface WaterStats {
  todayCount: number
  todayGoal: number
  weeklyAverage: number
  monthlyTotal: number
  totalDays: number
  longestStreak: number
}

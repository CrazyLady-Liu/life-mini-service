import { reactive, computed } from 'vue'
import type { UserProfile } from '@/types'

const DEFAULT_PROFILE: UserProfile = {
  nickname: '爱心人士',
  avatar: '',
  phone: '',
  totalFeedings: 0,
  totalDays: 0,
  currentStreak: 0
}

const STORAGE_KEYS = {
  PROFILE: 'pet_user_profile',
  IS_LOGGED_IN: 'pet_is_logged_in',
  PHONE: 'pet_phone'
}

function safeParse<T>(str: string | null, defaultValue: T): T {
  if (!str) return defaultValue
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

const state = reactive({
  profile: ((): UserProfile => {
    const saved = uni.getStorageSync(STORAGE_KEYS.PROFILE)
    return safeParse(saved, DEFAULT_PROFILE)
  })(),
  isLoggedIn: ((): boolean => {
    const saved = uni.getStorageSync(STORAGE_KEYS.IS_LOGGED_IN)
    return safeParse(saved, false)
  })(),
  phone: ((): string => {
    const saved = uni.getStorageSync(STORAGE_KEYS.PHONE)
    return saved || ''
  })()
})

function updateProfile(updates: Partial<UserProfile>) {
  Object.assign(state.profile, updates)
  uni.setStorageSync(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile))
}

function login(phone: string, nickname?: string) {
  state.isLoggedIn = true
  state.phone = phone
  uni.setStorageSync(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true))
  uni.setStorageSync(STORAGE_KEYS.PHONE, phone)
  
  if (nickname) {
    updateProfile({ nickname, phone })
  } else {
    updateProfile({ phone })
  }
}

function logout() {
  state.isLoggedIn = false
  state.phone = ''
  Object.assign(state.profile, { ...DEFAULT_PROFILE })
  
  uni.removeStorageSync(STORAGE_KEYS.IS_LOGGED_IN)
  uni.removeStorageSync(STORAGE_KEYS.PHONE)
  uni.removeStorageSync(STORAGE_KEYS.PROFILE)
}

function checkLoginStatus(): boolean {
  return state.isLoggedIn
}

export const userStore = {
  get profile() { return state.profile },
  get isLoggedIn() { return state.isLoggedIn },
  get phone() { return state.phone },
  updateProfile,
  login,
  logout,
  checkLoginStatus
}

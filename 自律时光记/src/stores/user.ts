import { reactive } from 'vue'
import type { UserProfile } from '@/types'

const DEFAULT_PROFILE: UserProfile = {
  nickname: '自律达人',
  avatar: '',
  totalCheckinDays: 0,
  currentStreak: 0
}

const state = reactive({
  profile: ((): UserProfile => {
    const saved = uni.getStorageSync('profile')
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE
  })(),
  isLoggedIn: (() => {
    const saved = uni.getStorageSync('isLoggedIn')
    return saved ? JSON.parse(saved) : false
  })()
})

function updateProfile(updates: Partial<UserProfile>) {
  Object.assign(state.profile, updates)
  uni.setStorageSync('profile', JSON.stringify(state.profile))
}

function logout() {
  state.isLoggedIn = false
  uni.setStorageSync('isLoggedIn', JSON.stringify(false))
  uni.removeStorageSync('profile')
  uni.removeStorageSync('records')
  uni.removeStorageSync('targets')
}

function login() {
  state.isLoggedIn = true
  uni.setStorageSync('isLoggedIn', JSON.stringify(true))
}

function checkLoginStatus(): boolean {
  return state.isLoggedIn
}

export const userStore = {
  get profile() { return state.profile },
  get isLoggedIn() { return state.isLoggedIn },
  updateProfile,
  logout,
  login,
  checkLoginStatus
}

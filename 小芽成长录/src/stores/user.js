import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    phone: '',
    isLoggedIn: false
  }),
  actions: {
    login(phone) {
      this.phone = phone
      this.isLoggedIn = true
      localStorage.setItem('user', JSON.stringify({ phone, isLoggedIn: true }))
    },
    logout() {
      this.phone = ''
      this.isLoggedIn = false
      localStorage.removeItem('user')
      localStorage.removeItem('baby')
      localStorage.removeItem('records')
      localStorage.removeItem('vaccines')
      localStorage.removeItem('growth')
    },
    loadFromStorage() {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        this.phone = parsed.phone
        this.isLoggedIn = parsed.isLoggedIn
      }
    }
  }
})

import { defineStore } from 'pinia'

export const useBabyStore = defineStore('baby', {
  state: () => ({
    name: '',
    gender: '',
    birthday: '',
    avatar: ''
  }),
  getters: {
    age: (state) => {
      if (!state.birthday) return ''
      const birth = new Date(state.birthday)
      const now = new Date()
      let years = now.getFullYear() - birth.getFullYear()
      let months = now.getMonth() - birth.getMonth()
      if (months < 0) {
        years--
        months += 12
      }
      return years > 0 ? `${years}岁${months}个月` : `${months}个月`
    }
  },
  actions: {
    updateBabyInfo(info) {
      this.name = info.name
      this.gender = info.gender
      this.birthday = info.birthday
      this.avatar = info.avatar
      localStorage.setItem('baby', JSON.stringify(info))
    },
    loadFromStorage() {
      const babyData = localStorage.getItem('baby')
      if (babyData) {
        const parsed = JSON.parse(babyData)
        this.name = parsed.name
        this.gender = parsed.gender
        this.birthday = parsed.birthday
        this.avatar = parsed.avatar
      }
    }
  }
})

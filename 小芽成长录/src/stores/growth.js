import { defineStore } from 'pinia'

export const useGrowthStore = defineStore('growth', {
  state: () => ({
    growthRecords: []
  }),
  getters: {
    latestGrowth: (state) => {
      if (state.growthRecords.length === 0) return null
      return [...state.growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    }
  },
  actions: {
    addGrowthRecord(record) {
      this.growthRecords.unshift({
        id: Date.now(),
        ...record,
        createTime: new Date().toISOString()
      })
      this.saveToStorage()
    },
    deleteGrowthRecord(id) {
      this.growthRecords = this.growthRecords.filter(r => r.id !== id)
      this.saveToStorage()
    },
    saveToStorage() {
      localStorage.setItem('growth', JSON.stringify(this.growthRecords))
    },
    loadFromStorage() {
      const growthData = localStorage.getItem('growth')
      if (growthData) {
        this.growthRecords = JSON.parse(growthData)
      }
    }
  }
})

import { defineStore } from 'pinia'

export const useRecordStore = defineStore('record', {
  state: () => ({
    records: []
  }),
  actions: {
    addRecord(record) {
      this.records.unshift({
        id: Date.now(),
        ...record,
        createTime: new Date().toISOString()
      })
      this.saveToStorage()
    },
    deleteRecord(id) {
      this.records = this.records.filter(r => r.id !== id)
      this.saveToStorage()
    },
    saveToStorage() {
      localStorage.setItem('records', JSON.stringify(this.records))
    },
    loadFromStorage() {
      const recordsData = localStorage.getItem('records')
      if (recordsData) {
        this.records = JSON.parse(recordsData)
      }
    }
  }
})

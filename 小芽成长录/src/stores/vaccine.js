import { defineStore } from 'pinia'

export const useVaccineStore = defineStore('vaccine', {
  state: () => ({
    vaccines: []
  }),
  getters: {
    upcomingVaccines: (state) => {
      const now = new Date()
      return state.vaccines
        .filter(v => new Date(v.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
    }
  },
  actions: {
    addVaccine(vaccine) {
      this.vaccines.unshift({
        id: Date.now(),
        ...vaccine,
        createTime: new Date().toISOString()
      })
      this.saveToStorage()
    },
    deleteVaccine(id) {
      this.vaccines = this.vaccines.filter(v => v.id !== id)
      this.saveToStorage()
    },
    toggleVaccinated(id) {
      const vaccine = this.vaccines.find(v => v.id === id)
      if (vaccine) {
        vaccine.vaccinated = !vaccine.vaccinated
        this.saveToStorage()
      }
    },
    saveToStorage() {
      localStorage.setItem('vaccines', JSON.stringify(this.vaccines))
    },
    loadFromStorage() {
      const vaccinesData = localStorage.getItem('vaccines')
      if (vaccinesData) {
        this.vaccines = JSON.parse(vaccinesData)
      }
    }
  }
})

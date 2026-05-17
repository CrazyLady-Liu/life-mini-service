const storage = require('../../utils/storage.js')
const { batchProcessMedicines } = require('../../utils/medicine.js')
const app = getApp()

Page({
  data: {
    medicines: [],
    filteredMedicines: [],
    searchKeyword: '',
    currentTab: 'all',
    currentCategory: 'all',
    categories: [],
    totalCount: 0,
    normalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    remindDays: 30
  },

  onLoad() {
    this.setData({
      categories: app.globalData.categories
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  loadData() {
    const settings = storage.getSettings()
    const remindDays = settings.remindDays || 30
    
    const medicines = storage.getMedicines() || []
    const { sorted, counts, processed } = batchProcessMedicines(medicines, remindDays)

    this.setData({
      medicines: sorted,
      processedMedicines: processed,
      totalCount: counts.total,
      normalCount: counts.normal,
      expiringCount: counts.expiring,
      expiredCount: counts.expired,
      remindDays
    })

    this.applyFilters()
  },

  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.applyFilters()
  },

  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    })
    this.applyFilters()
  },

  selectCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.category
    })
    this.applyFilters()
  },

  applyFilters() {
    const { medicines, processedMedicines, searchKeyword, currentTab, currentCategory } = this.data
    
    let filtered = [...medicines]

    if (searchKeyword) {
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    if (currentTab !== 'all') {
      const idMap = {}
      processedMedicines.forEach(p => {
        if (p.status === currentTab) {
          idMap[p.id] = true
        }
      })
      filtered = filtered.filter(med => idMap[med.id])
    }

    if (currentCategory !== 'all') {
      filtered = filtered.filter(med => med.category === currentCategory)
    }

    this.setData({
      filteredMedicines: filtered
    })
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/medicine-edit/medicine-edit'
    })
  },

  editMedicine(e) {
    const medicine = e.detail.medicine
    wx.navigateTo({
      url: `/pages/medicine-edit/medicine-edit?id=${medicine.id}`
    })
  },

  viewMedicine(e) {
    const medicine = e.detail.medicine
    wx.navigateTo({
      url: `/pages/medicine-edit/medicine-edit?id=${medicine.id}`
    })
  },

  deleteMedicine(e) {
    const medicine = e.detail.medicine
    const success = storage.deleteMedicine(medicine.id)
    if (success) {
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      this.loadData()
    } else {
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }
})

const storage = require('../../utils/storage.js')
const { batchProcessMedicines } = require('../../utils/medicine.js')

Page({
  data: {
    medicines: [],
    recentMedicines: [],
    expiringMedicines: [],
    totalCount: 0,
    normalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    remindDays: 30
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData(false)
  },

  onPullDownRefresh() {
    this.loadData(false)
    wx.stopPullDownRefresh()
  },

  loadData(showAlert = true) {
    const settings = storage.getSettings()
    const remindDays = settings.remindDays || 30
    const medicines = storage.getMedicines() || []
    
    const { sorted, expiring, counts } = batchProcessMedicines(medicines, remindDays)

    this.setData({
      medicines: sorted,
      recentMedicines: sorted.slice(0, 3),
      expiringMedicines: expiring,
      totalCount: counts.total,
      normalCount: counts.normal,
      expiringCount: counts.expiring,
      expiredCount: counts.expired,
      remindDays
    })

    if (showAlert && expiring.length > 0) {
      const lastAlertTime = wx.getStorageSync('lastExpireAlertTime') || 0
      const now = Date.now()
      const fourHours = 4 * 60 * 60 * 1000
      
      if (now - lastAlertTime > fourHours) {
        wx.setStorageSync('lastExpireAlertTime', now)
        wx.nextTick(() => {
          wx.showModal({
            title: '药品提醒',
            content: `您有 ${expiring.length} 种药品需要注意有效期`,
            showCancel: false,
            confirmText: '知道了'
          })
        })
      }
    }
  },

  goToAddMedicine() {
    wx.navigateTo({
      url: '/pages/medicine-edit/medicine-edit'
    })
  },

  goToAddRecord() {
    wx.navigateTo({
      url: '/pages/record-add/record-add'
    })
  },

  goToMedicine() {
    wx.switchTab({
      url: '/pages/medicine/medicine'
    })
  },

  goToSettings() {
    wx.switchTab({
      url: '/pages/settings/settings'
    })
  },

  goToMedicineDetail(e) {
    const medicine = e.detail.medicine || e.currentTarget.dataset.medicine
    wx.navigateTo({
      url: `/pages/medicine-edit/medicine-edit?id=${medicine.id}`
    })
  }
})

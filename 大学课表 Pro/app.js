const reminder = require('./utils/reminder.js')
const storage = require('./utils/storage.js')

App({
  onLaunch: function () {
    const settings = storage.getSettings()
    this.globalData.settings = settings
    
    if (settings.reminderEnabled) {
      reminder.startReminderCheck()
    }

    if (!wx.getStorageSync('initialized')) {
      storage.initDefaultData()
      wx.setStorageSync('initialized', true)
    }
  },

  onShow: function () {
    const settings = storage.getSettings()
    if (settings.reminderEnabled) {
      reminder.startReminderCheck()
    }
  },

  onHide: function () {
    reminder.stopReminderCheck()
  },

  globalData: {
    settings: null,
    colorList: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00'
    ],
    timeSlots: [
      { start: '08:00', end: '08:45' },
      { start: '08:55', end: '09:40' },
      { start: '10:00', end: '10:45' },
      { start: '10:55', end: '11:40' },
      { start: '14:00', end: '14:45' },
      { start: '14:55', end: '15:40' },
      { start: '16:00', end: '16:45' },
      { start: '16:55', end: '17:40' },
      { start: '19:00', end: '19:45' },
      { start: '19:55', end: '20:40' },
      { start: '20:50', end: '21:35' }
    ]
  }
})

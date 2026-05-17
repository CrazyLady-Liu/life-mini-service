const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')
const reminder = require('../../utils/reminder.js')

Page({
  data: {
    settings: null,
    courseCount: 0,
    reminderTimeOptions: [5, 10, 15, 30, 60],
    colorModeOptions: ['harmonic', 'default'],
    colorModeNames: ['和谐配色', '经典配色'],
    timeSlotHeightOptions: [100, 110, 120, 130, 140, 150],
    showTermPicker: false,
    tempTermStartDate: '',
    tempTotalWeeks: 20,
    _reminderTimeIndex: 2,
    _colorModeIndex: 0,
    _timeSlotHeightIndex: 2
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const settings = storage.getSettings()
    const courses = storage.getCourses()
    
    const reminderTimeIndex = this.data.reminderTimeOptions.indexOf(settings.reminderTime)
    const _reminderTimeIndex = reminderTimeIndex >= 0 ? reminderTimeIndex : 2
    
    const colorModeIndex = this.data.colorModeOptions.indexOf(settings.colorMode)
    const _colorModeIndex = colorModeIndex >= 0 ? colorModeIndex : 0
    
    const timeSlotHeightIndex = this.data.timeSlotHeightOptions.indexOf(settings.timeSlotHeight)
    const _timeSlotHeightIndex = timeSlotHeightIndex >= 0 ? timeSlotHeightIndex : 2
    
    this.setData({
      settings,
      courseCount: courses.length,
      tempTermStartDate: settings.termStartDate,
      tempTotalWeeks: settings.totalWeeks,
      _reminderTimeIndex,
      _colorModeIndex,
      _timeSlotHeightIndex
    })
  },

  onReminderToggle: function (e) {
    const enabled = e.detail.value
    const settings = { ...this.data.settings, reminderEnabled: enabled }
    
    storage.saveSettings(settings)
    this.setData({ settings })
    
    if (enabled) {
      reminder.startReminderCheck()
      util.showToast('提醒已开启', 'success')
    } else {
      reminder.stopReminderCheck()
      util.showToast('提醒已关闭')
    }
  },

  onReminderTimeChange: function (e) {
    const index = parseInt(e.detail.value)
    const reminderTime = this.data.reminderTimeOptions[index]
    const settings = { ...this.data.settings, reminderTime }
    
    storage.saveSettings(settings)
    this.setData({ 
      settings,
      _reminderTimeIndex: index
    })
    util.showToast(`已设置课前${reminderTime}分钟提醒`, 'success')
  },

  onVibrateToggle: function (e) {
    const vibrate = e.detail.value
    const settings = { ...this.data.settings, reminderVibrate: vibrate }
    
    storage.saveSettings(settings)
    this.setData({ settings })
  },

  onSoundToggle: function (e) {
    const sound = e.detail.value
    const settings = { ...this.data.settings, reminderSound: sound }
    
    storage.saveSettings(settings)
    this.setData({ settings })
  },

  onTestReminder: function () {
    reminder.testReminder()
  },

  onColorModeChange: function (e) {
    const index = parseInt(e.detail.value)
    const colorMode = this.data.colorModeOptions[index]
    const colorModeName = this.data.colorModeNames[index]
    
    wx.showModal({
      title: '切换配色方案',
      content: `确定切换到「${colorModeName}」吗？将重新为所有课程分配颜色。`,
      success: (res) => {
        if (res.confirm) {
          const newColors = storage.regenerateAllColors(colorMode)
          const settings = { ...this.data.settings, colorMode, courseColors: newColors }
          
          storage.saveSettings(settings)
          this.setData({ 
            settings,
            _colorModeIndex: index
          })
          util.showToast(`已切换到${colorModeName}`, 'success')
        }
      }
    })
  },

  onRegenerateColors: function () {
    wx.showModal({
      title: '重新分配颜色',
      content: '确定要重新为所有课程分配颜色吗？',
      success: (res) => {
        if (res.confirm) {
          const settings = this.data.settings
          const newColors = storage.regenerateAllColors(settings.colorMode)
          const updatedSettings = { ...settings, courseColors: newColors }
          
          storage.saveSettings(updatedSettings)
          this.setData({ settings: updatedSettings })
          util.showToast('颜色已重新分配', 'success')
        }
      }
    })
  },

  onTimeSlotHeightChange: function (e) {
    const index = parseInt(e.detail.value)
    const timeSlotHeight = this.data.timeSlotHeightOptions[index]
    const settings = { ...this.data.settings, timeSlotHeight }
    
    storage.saveSettings(settings)
    this.setData({ 
      settings,
      _timeSlotHeightIndex: index
    })
    util.showToast(`节次高度已设为${timeSlotHeight}rpx`, 'success')
  },

  onResetTimeSlots: function () {
    wx.showModal({
      title: '重置节次时间',
      content: '确定要重置为默认的节次时间配置吗？',
      success: (res) => {
        if (res.confirm) {
          storage.resetTimeSlots()
          util.showToast('节次时间已重置', 'success')
        }
      }
    })
  },

  onTermStartChange: function (e) {
    this.setData({ tempTermStartDate: e.detail.value })
  },

  onTotalWeeksInput: function (e) {
    const value = parseInt(e.detail.value)
    if (!isNaN(value) && value >= 1 && value <= 30) {
      this.setData({ tempTotalWeeks: value })
    }
  },

  onSaveTermSettings: function () {
    const { tempTermStartDate, tempTotalWeeks } = this.data
    
    if (!tempTermStartDate) {
      util.showToast('请选择开学日期')
      return
    }
    
    const settings = { 
      ...this.data.settings, 
      termStartDate: tempTermStartDate,
      totalWeeks: tempTotalWeeks
    }
    
    storage.saveSettings(settings)
    this.setData({ 
      settings,
      showTermPicker: false
    })
    
    util.showToast('学期设置已保存', 'success')
  },

  onToggleTermPicker: function () {
    this.setData({ 
      showTermPicker: !this.data.showTermPicker,
      tempTermStartDate: this.data.settings.termStartDate,
      tempTotalWeeks: this.data.settings.totalWeeks
    })
  },

  onExportData: function () {
    const data = storage.exportData()
    const jsonStr = JSON.stringify(data, null, 2)
    
    wx.setClipboardData({
      data: jsonStr,
      success: () => {
        util.showToast('数据已复制到剪贴板', 'success')
      }
    })
  },

  onImportData: function () {
    wx.showModal({
      title: '导入数据',
      editable: true,
      placeholderText: '粘贴之前导出的JSON数据',
      success: (res) => {
        if (res.confirm && res.content) {
          try {
            const data = JSON.parse(res.content)
            if (storage.importData(data)) {
              util.showToast('导入成功', 'success')
              this.loadData()
            } else {
              util.showToast('导入失败')
            }
          } catch (e) {
            util.showToast('数据格式错误')
          }
        }
      }
    })
  },

  onClearAllData: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有课程数据吗？此操作不可恢复！',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData()
          util.showToast('已清空所有数据', 'success')
          this.loadData()
        }
      }
    })
  },

  onAbout: function () {
    wx.showModal({
      title: '关于大学课表 Pro',
      content: '版本：1.0.0\n\n专为大学生设计的课表管理工具\n· 无需登录，本地存储\n· 智能识别课程信息\n· 自定义上课提醒\n\n祝您学业顺利！',
      showCancel: false,
      confirmText: '好的'
    })
  },

  onAddCourse: function () {
    wx.navigateTo({
      url: '/pages/add-course/add-course'
    })
  },

  onImportCourse: function () {
    wx.navigateTo({
      url: '/pages/import-course/import-course'
    })
  }
})

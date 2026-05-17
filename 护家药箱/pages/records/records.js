const storage = require('../../utils/storage.js')
const { formatDate, formatDateTime, isToday } = require('../../utils/date.js')

Page({
  data: {
    records: [],
    filteredRecords: [],
    groupedRecords: [],
    familyMembers: [],
    currentMember: 'all',
    todayCount: 0,
    thisWeekCount: 0
  },

  onLoad() {
    const settings = storage.getSettings()
    this.setData({
      familyMembers: settings.familyMembers || ['本人', '家人1', '家人2', '家人3']
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
    let records = storage.getRecords() || []
    
    records = records.map(record => ({
      ...record,
      timeText: formatDateTime(record.time || record.createTime)
    })).sort((a, b) => {
      return new Date(b.time || b.createTime) - new Date(a.time || a.createTime)
    })

    const todayCount = records.filter(r => isToday(r.time || r.createTime)).length
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const thisWeekCount = records.filter(r => {
      const recordDate = new Date(r.time || r.createTime)
      return recordDate >= weekAgo
    }).length

    this.setData({
      records,
      todayCount,
      thisWeekCount
    })

    this.applyFilter()
  },

  selectMember(e) {
    this.setData({
      currentMember: e.currentTarget.dataset.member
    })
    this.applyFilter()
  },

  applyFilter() {
    const { records, currentMember } = this.data
    
    let filtered = [...records]
    
    if (currentMember !== 'all') {
      filtered = filtered.filter(r => r.person === currentMember)
    }

    const grouped = this.groupByDate(filtered)

    this.setData({
      filteredRecords: filtered,
      groupedRecords: grouped
    })
  },

  groupByDate(records) {
    const groups = {}
    
    records.forEach(record => {
      const date = formatDate(record.time || record.createTime)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(record)
    })

    const today = formatDate(new Date())
    const yesterday = formatDate(new Date(Date.now() - 86400000))

    return Object.keys(groups).map(date => {
      let displayDate = date
      if (date === today) {
        displayDate = '今天'
      } else if (date === yesterday) {
        displayDate = '昨天'
      }
      
      return {
        date: displayDate,
        originalDate: date,
        records: groups[date]
      }
    }).sort((a, b) => new Date(b.originalDate) - new Date(a.originalDate))
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/record-add/record-add'
    })
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条用药记录吗？',
      success: (res) => {
        if (res.confirm) {
          const success = storage.deleteRecord(id)
          if (success) {
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadData()
          } else {
            wx.showToast({ title: '删除失败', icon: 'error' })
          }
        }
      }
    })
  }
})

const storage = require('../../utils/storage.js')

Page({
  data: {
    remindDays: 30,
    remindOptions: [7, 15, 30],
    familyMembers: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const settings = storage.getSettings() || {}
    this.setData({
      remindDays: settings.remindDays || 30,
      familyMembers: settings.familyMembers || ['本人', '家人1', '家人2', '家人3']
    })
  },

  selectRemindDays(e) {
    const days = e.currentTarget.dataset.days
    const settings = storage.getSettings() || {}
    settings.remindDays = days
    storage.saveSettings(settings)
    this.setData({
      remindDays: days
    })
    wx.showToast({
      title: `已设置提前${days}天提醒`,
      icon: 'success'
    })
  },

  addMember() {
    wx.showModal({
      title: '添加家庭成员',
      editable: true,
      placeholderText: '请输入成员名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const name = res.content.trim()
          if (this.data.familyMembers.includes(name)) {
            wx.showToast({ title: '成员已存在', icon: 'none' })
            return
          }
          const settings = storage.getSettings() || {}
          settings.familyMembers = [...this.data.familyMembers, name]
          storage.saveSettings(settings)
          this.setData({
            familyMembers: settings.familyMembers
          })
          wx.showToast({ title: '添加成功', icon: 'success' })
        }
      }
    })
  },

  deleteMember(e) {
    const index = e.currentTarget.dataset.index
    const member = this.data.familyMembers[index]
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${member}」吗？`,
      success: (res) => {
        if (res.confirm) {
          const settings = storage.getSettings() || {}
          settings.familyMembers = this.data.familyMembers.filter((_, i) => i !== index)
          storage.saveSettings(settings)
          this.setData({
            familyMembers: settings.familyMembers
          })
          wx.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  },

  exportData() {
    wx.showActionSheet({
      itemList: ['导出药品数据', '导出用药记录'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.exportMedicineData()
        } else if (res.tapIndex === 1) {
          this.exportRecordData()
        }
      }
    })
  },

  exportMedicineData() {
    const medicines = storage.getMedicines() || []
    const settings = storage.getSettings() || {}
    const remindDays = settings.remindDays || 30
    const { getMedicineStatus, getStatusText } = require('../../utils/medicine.js')

    if (medicines.length === 0) {
      wx.showToast({
        title: '暂无药品数据',
        icon: 'none'
      })
      return
    }

    const headers = ['药品名称', '类别', '规格', '数量', '单位', '有效期', '状态', '存放位置', '备注']
    
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = medicines.map(med => {
      const status = getMedicineStatus(med.expiryDate, remindDays)
      return [
        med.name,
        med.category,
        med.specification || '',
        med.quantity,
        med.unit || '',
        med.expiryDate,
        getStatusText(status),
        med.location || '',
        med.remark || ''
      ].map(escapeCSV).join(',')
    })

    const BOM = '\uFEFF'
    const headerRow = headers.map(escapeCSV).join(',')
    const csvContent = BOM + [headerRow, ...rows].join('\r\n')

    this.saveCSVFile(csvContent, '药品数据')
  },

  exportRecordData() {
    const records = storage.getRecords() || []
    const { formatDateTime } = require('../../utils/date.js')

    if (records.length === 0) {
      wx.showToast({
        title: '暂无用药记录',
        icon: 'none'
      })
      return
    }

    const headers = ['记录时间', '药品名称', '服用人', '用量', '用药时间', '症状', '备注']
    
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return ''
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = records.map(record => {
      return [
        formatDateTime(record.createTime),
        record.medicineName,
        record.person,
        record.dosage || '',
        formatDateTime(record.time || record.createTime),
        record.symptom || '',
        record.remark || ''
      ].map(escapeCSV).join(',')
    })

    const BOM = '\uFEFF'
    const headerRow = headers.map(escapeCSV).join(',')
    const csvContent = BOM + [headerRow, ...rows].join('\r\n')

    this.saveCSVFile(csvContent, '用药记录')
  },

  saveCSVFile(csvContent, dataType) {
    const { formatDate } = require('../../utils/date.js')
    const fs = wx.getFileSystemManager()
    const timestamp = formatDate(new Date(), 'YYYYMMDD_HHmmss')
    const fileName = `护家药箱_${dataType}_${timestamp}.csv`
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`

    try {
      fs.writeFileSync(filePath, csvContent, 'utf8')
      
      wx.showActionSheet({
        itemList: ['打开文件', '保存到手机', '复制CSV内容'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.openFile(filePath)
          } else if (res.tapIndex === 1) {
            this.saveFileToAlbum(filePath, fileName)
          } else if (res.tapIndex === 2) {
            wx.setClipboardData({
              data: csvContent,
              success: () => {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
    } catch (error) {
      console.error('写入文件失败:', error)
      wx.showModal({
        title: '导出失败',
        content: '文件写入失败，是否复制CSV内容到剪贴板？',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({
              data: csvContent,
              success: () => {
                wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
              }
            })
          }
        }
      })
    }
  },

  openFile(filePath) {
    wx.openDocument({
      filePath: filePath,
      fileType: 'csv',
      showMenu: true,
      success: () => {
        console.log('文件打开成功')
      },
      fail: (error) => {
        console.error('打开文件失败:', error)
        wx.showModal({
          title: '打开失败',
          content: '无法直接打开文件，可选择"复制CSV内容"后粘贴到Excel中。',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },

  saveFileToAlbum(filePath, fileName) {
    wx.saveFile({
      tempFilePath: filePath,
      success: (res) => {
        wx.showModal({
          title: '保存成功',
          content: `文件已保存到小程序本地存储。\n\n文件名：${fileName}\n\n如需在电脑上打开，可通过微信文件传输助手发送文件。`,
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: (error) => {
        console.error('保存文件失败:', error)
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    })
  },

  clearData() {
    wx.showModal({
      title: '确认清空',
      content: '此操作将删除所有药品和用药记录，且无法恢复，确定继续吗？',
      confirmColor: '#f44336',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '真的要清空所有数据吗？',
            confirmColor: '#f44336',
            success: (res2) => {
              if (res2.confirm) {
                storage.saveMedicines([])
                storage.saveRecords([])
                wx.showToast({ title: '数据已清空', icon: 'success' })
              }
            }
          })
        }
      }
    })
  }
})

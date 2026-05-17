const { getUserInfo, logout, isLogin } = require('../../utils/auth')
const { getInvoiceCount, clearAllInvoices, getInvoiceList } = require('../../utils/invoice')
const { showToast, showModal, copyToClipboard } = require('../../utils/storage')
const { formatListForExport, formatForJson } = require('../../utils/format')
const app = getApp()

Page({
  data: {
    userInfo: null,
    invoiceCount: 0
  },

  onShow() {
    this.checkLogin()
    this.loadData()
  },

  checkLogin() {
    const loginStatus = isLogin()
    if (!loginStatus) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  loadData() {
    const userInfo = getUserInfo()
    const invoiceCount = getInvoiceCount()
    this.setData({
      userInfo,
      invoiceCount
    })
  },

  async onExport() {
    const { invoiceCount } = this.data
    if (invoiceCount === 0) {
      showToast('暂无数据可导出')
      return
    }

    wx.showActionSheet({
      itemList: ['导出为文本格式', '导出为JSON格式', '复制全部数据'],
      success: (res) => {
        const invoiceList = getInvoiceList()
        let content = ''
        
        switch (res.tapIndex) {
          case 0:
            content = formatListForExport(invoiceList)
            this.saveToFile(content, 'invoice_export.txt')
            break
          case 1:
            content = JSON.stringify(invoiceList.map(item => ({
              companyName: item.companyName,
              taxNumber: item.taxNumber,
              address: item.address || '',
              phone: item.phone || '',
              bank: item.bank || '',
              account: item.account || '',
              isDefault: item.isDefault
            })), null, 2)
            this.saveToFile(content, 'invoice_export.json')
            break
          case 2:
            content = formatListForExport(invoiceList)
            copyToClipboard(content).then(() => {
              showToast('已复制到剪贴板', 'success')
            }).catch(() => {
              showToast('复制失败')
            })
            break
        }
      }
    })
  },

  saveToFile(content, filename) {
    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
    
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      
      wx.showModal({
        title: '导出成功',
        content: `文件已保存：${filename}`,
        showCancel: false,
        confirmText: '知道了'
      })
      
      console.log('文件保存成功:', filePath)
    } catch (e) {
      console.error('文件保存失败:', e)
      
      copyToClipboard(content).then(() => {
        showToast('已复制到剪贴板', 'success')
      }).catch(() => {
        showToast('导出失败，请重试')
      })
    }
  },

  async onClearAll() {
    const confirmed = await showModal(
      '提示', 
      '确定要清空所有抬头数据吗？此操作不可恢复！',
      { confirmText: '清空', confirmColor: '#ff4d4f' }
    )
    
    if (confirmed) {
      clearAllInvoices()
      this.loadData()
      showToast('已清空所有数据', 'success')
    }
  },

  async onLogout() {
    const confirmed = await showModal('提示', '确定要退出登录吗？')
    if (confirmed) {
      logout()
      app.globalData.userInfo = null
      app.globalData.isLogin = false
      showToast('已退出登录', 'success')
      
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }, 1000)
    }
  }
})

const { getInvoiceList, deleteInvoice, setDefaultInvoice } = require('../../utils/invoice')
const { isLogin } = require('../../utils/auth')
const { showToast, showModal, copyToClipboard } = require('../../utils/storage')
const { formatForText, formatForJson, formatForInvoice, formatForWechat } = require('../../utils/format')

Page({
  data: {
    invoiceList: [],
    isLogin: false,
    isBatchMode: false,
    selectedIds: [],
    selectAll: false
  },

  onShow() {
    this.checkLogin()
    this.loadInvoiceList()
  },

  checkLogin() {
    const loginStatus = isLogin()
    this.setData({ isLogin: loginStatus })
    if (!loginStatus) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  loadInvoiceList() {
    const list = getInvoiceList()
    this.setData({ 
      invoiceList: list,
      selectedIds: [],
      selectAll: false
    })
  },

  onToggleBatchMode() {
    this.setData({
      isBatchMode: !this.data.isBatchMode,
      selectedIds: [],
      selectAll: false
    })
  },

  onSelectItem(e) {
    const { id } = e.currentTarget.dataset
    const { selectedIds } = this.data
    const index = selectedIds.indexOf(id)
    
    if (index > -1) {
      selectedIds.splice(index, 1)
    } else {
      selectedIds.push(id)
    }
    
    this.setData({
      selectedIds,
      selectAll: selectedIds.length === this.data.invoiceList.length
    })
  },

  onSelectAll() {
    const { invoiceList, selectAll } = this.data
    
    if (selectAll) {
      this.setData({
        selectedIds: [],
        selectAll: false
      })
    } else {
      const allIds = invoiceList.map(item => item.id)
      this.setData({
        selectedIds: allIds,
        selectAll: true
      })
    }
  },

  async onBatchDelete() {
    const { selectedIds } = this.data
    if (selectedIds.length === 0) {
      showToast('请先选择要删除的抬头')
      return
    }

    const confirmed = await showModal(
      '提示', 
      `确定删除选中的 ${selectedIds.length} 条抬头吗？`,
      { confirmText: '删除', confirmColor: '#ff4d4f' }
    )
    
    if (confirmed) {
      selectedIds.forEach(id => {
        deleteInvoice(id)
      })
      this.loadInvoiceList()
      this.setData({ isBatchMode: false })
      showToast(`已删除 ${selectedIds.length} 条`, 'success')
    }
  },

  async onBatchSetDefault() {
    const { selectedIds } = this.data
    if (selectedIds.length === 0) {
      showToast('请先选择抬头')
      return
    }
    if (selectedIds.length > 1) {
      showToast('只能设置一个常用抬头')
      return
    }

    setDefaultInvoice(selectedIds[0])
    this.loadInvoiceList()
    this.setData({ isBatchMode: false })
    showToast('设置成功', 'success')
  },

  async onCopy(e) {
    const { item } = e.currentTarget.dataset
    
    wx.showActionSheet({
      itemList: ['复制全部信息', '复制开票格式', '复制JSON格式', '复制微信格式'],
      success: async (res) => {
        let text = ''
        switch (res.tapIndex) {
          case 0:
            text = formatForText(item)
            break
          case 1:
            text = formatForInvoice(item)
            break
          case 2:
            text = formatForJson(item)
            break
          case 3:
            text = formatForWechat(item)
            break
        }
        
        try {
          await copyToClipboard(text)
          showToast('复制成功', 'success')
        } catch (e) {
          showToast('复制失败')
        }
      }
    })
  },

  async onSetDefault(e) {
    const { id } = e.currentTarget.dataset
    const confirmed = await showModal('提示', '确定将该抬头设为常用吗？')
    if (confirmed) {
      setDefaultInvoice(id)
      this.loadInvoiceList()
      showToast('设置成功', 'success')
    }
  },

  onEdit(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}`
    })
  },

  async onDelete(e) {
    const { id } = e.currentTarget.dataset
    const confirmed = await showModal('提示', '确定删除该抬头吗？', { confirmText: '删除', confirmColor: '#ff4d4f' })
    if (confirmed) {
      deleteInvoice(id)
      this.loadInvoiceList()
      showToast('删除成功', 'success')
    }
  },

  onAdd() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    })
  }
})

const { getMedicineStatus, getStatusText, getCategoryIcon } = require('../../utils/medicine.js')

Component({
  properties: {
    medicine: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    },
    remindDays: {
      type: Number,
      value: 30
    }
  },

  data: {
    status: 'normal',
    statusText: '正常',
    categoryIcon: '💊'
  },

  observers: {
    'medicine, remindDays': function(medicine, remindDays) {
      if (medicine && medicine.expiryDate) {
        const status = getMedicineStatus(medicine.expiryDate, remindDays)
        const statusText = getStatusText(status)
        const categoryIcon = getCategoryIcon(medicine.category)
        this.setData({ status, statusText, categoryIcon })
      }
    }
  },

  methods: {
    onCardTap() {
      this.triggerEvent('cardtap', { medicine: this.data.medicine })
    },

    onEdit() {
      this.triggerEvent('edit', { medicine: this.data.medicine })
    },

    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除「${this.data.medicine.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { medicine: this.data.medicine })
          }
        }
      })
    }
  }
})

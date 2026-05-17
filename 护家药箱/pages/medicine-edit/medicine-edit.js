const storage = require('../../utils/storage.js')
const { formatDate } = require('../../utils/date.js')
const app = getApp()

Page({
  data: {
    isEdit: false,
    medicineId: '',
    categories: [],
    units: ['片', '粒', '袋', '盒', '瓶', '支', 'ml', 'g'],
    unitIndex: 1,
    form: {
      name: '',
      category: '',
      specification: '',
      quantity: '',
      unit: '粒',
      expiryDate: '',
      location: '',
      remark: ''
    }
  },

  onLoad(options) {
    this.setData({
      categories: app.globalData.categories
    })

    if (options.id) {
      wx.setNavigationBarTitle({ title: '编辑药品' })
      const medicine = storage.getMedicineById(options.id)
      if (medicine) {
        const unitIndex = this.data.units.indexOf(medicine.unit)
        this.setData({
          isEdit: true,
          medicineId: options.id,
          form: {
            name: medicine.name,
            category: medicine.category,
            specification: medicine.specification || '',
            quantity: medicine.quantity,
            unit: medicine.unit || '粒',
            expiryDate: medicine.expiryDate,
            location: medicine.location || '',
            remark: medicine.remark || ''
          },
          unitIndex: unitIndex >= 0 ? unitIndex : 1
        })
      }
    } else {
      const today = new Date()
      const defaultDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      this.setData({
        'form.expiryDate': formatDate(defaultDate)
      })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  selectCategory(e) {
    this.setData({
      'form.category': e.currentTarget.dataset.category
    })
  },

  onUnitChange(e) {
    const index = e.detail.value
    this.setData({
      unitIndex: index,
      'form.unit': this.data.units[index]
    })
  },

  onDateChange(e) {
    this.setData({
      'form.expiryDate': e.detail.value
    })
  },

  goBack() {
    wx.navigateBack()
  },

  submit() {
    const { form, isEdit, medicineId } = this.data

    if (!form.name.trim()) {
      wx.showToast({ title: '请输入药品名称', icon: 'none' })
      return
    }
    if (!form.category) {
      wx.showToast({ title: '请选择药品类别', icon: 'none' })
      return
    }
    if (!form.quantity || form.quantity <= 0) {
      wx.showToast({ title: '请输入有效数量', icon: 'none' })
      return
    }
    if (!form.expiryDate) {
      wx.showToast({ title: '请选择有效期', icon: 'none' })
      return
    }

    const medicineData = {
      name: form.name.trim(),
      category: form.category,
      specification: form.specification.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      expiryDate: form.expiryDate,
      location: form.location.trim(),
      remark: form.remark.trim()
    }

    let success = false
    if (isEdit) {
      success = storage.updateMedicine(medicineId, medicineData)
    } else {
      success = storage.addMedicine(medicineData)
    }

    if (success) {
      wx.showToast({
        title: isEdit ? '修改成功' : '添加成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  }
})

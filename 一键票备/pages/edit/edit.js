const { getInvoiceById, addInvoice, updateInvoice } = require('../../utils/invoice')
const { showToast } = require('../../utils/storage')

Page({
  data: {
    id: '',
    isEdit: false,
    saving: false,
    form: {
      companyName: '',
      taxNumber: '',
      address: '',
      phone: '',
      bank: '',
      account: '',
      isDefault: false
    }
  },

  onLoad(options) {
    if (options.id) {
      const invoice = getInvoiceById(options.id)
      this.setData({
        id: options.id,
        isEdit: true,
        form: invoice ? {
          companyName: invoice.companyName || '',
          taxNumber: invoice.taxNumber || '',
          address: invoice.address || '',
          phone: invoice.phone || '',
          bank: invoice.bank || '',
          account: invoice.account || '',
          isDefault: invoice.isDefault || false
        } : this.data.form
      })
      wx.setNavigationBarTitle({ title: '编辑抬头' })
    } else {
      wx.setNavigationBarTitle({ title: '新增抬头' })
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value
    })
  },

  onSwitchChange(e) {
    const { form } = this.data
    form.isDefault = e.detail.value
    this.setData({ form })
  },

  onSave() {
    const { form, isEdit, id, saving } = this.data

    if (saving) return

    if (!form.companyName.trim()) {
      showToast('请输入公司名称')
      return
    }

    if (!form.taxNumber.trim()) {
      showToast('请输入纳税人识别号')
      return
    }

    this.setData({ saving: true })

    try {
      if (isEdit) {
        const result = updateInvoice(id, form)
        if (!result) {
          showToast('保存失败，请重试')
          this.setData({ saving: false })
          return
        }
        showToast('保存成功', 'success')
      } else {
        const result = addInvoice(form)
        if (!result) {
          showToast('添加失败，请重试')
          this.setData({ saving: false })
          return
        }
        showToast('添加成功', 'success')
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 800)
    } catch (e) {
      console.error('保存错误:', e)
      showToast('保存失败，请重试')
      this.setData({ saving: false })
    }
  }
})

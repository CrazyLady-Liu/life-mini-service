const storage = require('../../utils/storage.js');
const { processCategories } = require('../../utils/categories.js');

Page({
  data: {
    id: null,
    name: '',
    quantity: '',
    remark: '',
    categories: [],
    selectedCategory: ''
  },

  onLoad(options) {
    const id = parseInt(options.id);
    const list = storage.getList();
    const item = list.find(i => i.id === id);
    if (item) {
      this.setData({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        remark: item.remark,
        selectedCategory: item.category
      });
    }
    this.updateCategories();
  },

  updateCategories() {
    this.setData({
      categories: processCategories(this.data.selectedCategory)
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: this.data.selectedCategory === category ? '' : category
    });
    this.updateCategories();
  },

  save() {
    const { id, name, quantity, remark, selectedCategory } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' });
      return;
    }

    storage.updateItem(id, {
      name: name.trim(),
      quantity: quantity.trim(),
      remark: remark.trim(),
      category: selectedCategory
    });

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },

  deleteItem() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteItem(this.data.id);
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 500);
        }
      }
    });
  }
});

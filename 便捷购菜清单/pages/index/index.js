const storage = require('../../utils/storage.js');
const { getCategoryColor, processCategories } = require('../../utils/categories.js');

Page({
  data: {
    shoppingList: [],
    checkedCount: 0,
    inputValue: '',
    quantity: '',
    remark: '',
    showAddPanel: false,
    categories: [],
    selectedCategory: ''
  },

  onShow() {
    this.loadList();
    this.updateCategories();
  },

  updateCategories() {
    this.setData({
      categories: processCategories(this.data.selectedCategory)
    });
  },

  loadList() {
    const list = storage.getList();
    const processedList = list.map(item => ({
      ...item,
      categoryColor: getCategoryColor(item.category)
    }));
    const checkedCount = list.filter(item => item.checked).length;
    this.setData({ shoppingList: processedList, checkedCount });
  },

  stopPropagation() {},

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

  resetForm() {
    this.setData({
      inputValue: '',
      quantity: '',
      remark: '',
      selectedCategory: ''
    });
    this.updateCategories();
  },

  showAddForm() {
    this.resetForm();
    this.setData({ showAddPanel: true });
  },

  hideAddForm() {
    this.setData({ showAddPanel: false });
  },

  addItem() {
    const { inputValue, quantity, remark, selectedCategory } = this.data;
    if (!inputValue.trim()) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' });
      return;
    }

    storage.addItem({
      name: inputValue.trim(),
      quantity: quantity.trim(),
      remark: remark.trim(),
      category: selectedCategory
    });

    this.setData({ showAddPanel: false });
    this.resetForm();
    this.loadList();
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  quickAdd(e) {
    const category = e.currentTarget.dataset.category;
    this.resetForm();
    this.setData({
      showAddPanel: true,
      selectedCategory: category
    });
    this.updateCategories();
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    storage.toggleChecked(id);
    this.loadList();
  },

  editItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` });
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteItem(id);
          this.loadList();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  clearChecked() {
    const uncheckedCount = this.data.shoppingList.filter(item => !item.checked).length;
    if (uncheckedCount === this.data.shoppingList.length) {
      wx.showToast({ title: '没有已购项目', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '清空已购',
      content: '确定要清空所有已购项目吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clearChecked();
          this.loadList();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  clearAll() {
    if (this.data.shoppingList.length === 0) {
      wx.showToast({ title: '清单为空', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '清空全部',
      content: '确定要清空全部清单吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.clearAll();
          this.loadList();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});

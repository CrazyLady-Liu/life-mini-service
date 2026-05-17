const STORAGE_KEY = 'shoppingList';

function getList() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (e) {
    console.error('读取存储数据失败:', e);
    return [];
  }
}

function saveList(list) {
  wx.setStorageSync(STORAGE_KEY, list);
}

function addItem(item) {
  const list = getList();
  const newItem = {
    id: Date.now(),
    name: item.name,
    quantity: item.quantity || '',
    remark: item.remark || '',
    category: item.category || '',
    checked: false,
    createdAt: Date.now()
  };
  list.unshift(newItem);
  saveList(list);
  return newItem;
}

function updateItem(id, updates) {
  const list = getList();
  const index = list.findIndex(item => item.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    saveList(list);
    return list[index];
  }
  return null;
}

function deleteItem(id) {
  const list = getList();
  const newList = list.filter(item => item.id !== id);
  saveList(newList);
  return newList;
}

function toggleChecked(id) {
  const list = getList();
  const index = list.findIndex(item => item.id === id);
  if (index !== -1) {
    list[index].checked = !list[index].checked;
    saveList(list);
    return list[index];
  }
  return null;
}

function clearChecked() {
  const list = getList();
  const newList = list.filter(item => !item.checked);
  saveList(newList);
  return newList;
}

function clearAll() {
  saveList([]);
  return [];
}

module.exports = {
  getList,
  saveList,
  addItem,
  updateItem,
  deleteItem,
  toggleChecked,
  clearChecked,
  clearAll
};

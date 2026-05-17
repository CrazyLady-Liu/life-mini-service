const MEDICINES_KEY = 'medicines'
const RECORDS_KEY = 'records'
const SETTINGS_KEY = 'settings'

function getMedicines() {
  try {
    return wx.getStorageSync(MEDICINES_KEY)
  } catch (e) {
    console.error('获取药品列表失败', e)
    return null
  }
}

function saveMedicines(medicines) {
  try {
    wx.setStorageSync(MEDICINES_KEY, medicines)
    return true
  } catch (e) {
    console.error('保存药品列表失败', e)
    return false
  }
}

function addMedicine(medicine) {
  const medicines = getMedicines() || []
  medicine.id = Date.now().toString()
  medicine.createTime = Date.now()
  medicines.unshift(medicine)
  return saveMedicines(medicines)
}

function updateMedicine(id, medicine) {
  const medicines = getMedicines() || []
  const index = medicines.findIndex(m => m.id === id)
  if (index !== -1) {
    medicines[index] = { ...medicines[index], ...medicine }
    return saveMedicines(medicines)
  }
  return false
}

function deleteMedicine(id) {
  const medicines = getMedicines() || []
  const newMedicines = medicines.filter(m => m.id !== id)
  return saveMedicines(newMedicines)
}

function getMedicineById(id) {
  const medicines = getMedicines() || []
  return medicines.find(m => m.id === id)
}

function getRecords() {
  try {
    return wx.getStorageSync(RECORDS_KEY)
  } catch (e) {
    console.error('获取用药记录失败', e)
    return null
  }
}

function saveRecords(records) {
  try {
    wx.setStorageSync(RECORDS_KEY, records)
    return true
  } catch (e) {
    console.error('保存用药记录失败', e)
    return false
  }
}

function addRecord(record) {
  const records = getRecords() || []
  record.id = Date.now().toString()
  record.createTime = Date.now()
  records.unshift(record)
  return saveRecords(records)
}

function deleteRecord(id) {
  const records = getRecords() || []
  const newRecords = records.filter(r => r.id !== id)
  return saveRecords(newRecords)
}

function getSettings() {
  try {
    return wx.getStorageSync(SETTINGS_KEY)
  } catch (e) {
    console.error('获取设置失败', e)
    return null
  }
}

function saveSettings(settings) {
  try {
    wx.setStorageSync(SETTINGS_KEY, settings)
    return true
  } catch (e) {
    console.error('保存设置失败', e)
    return false
  }
}

module.exports = {
  getMedicines,
  saveMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById,
  getRecords,
  saveRecords,
  addRecord,
  deleteRecord,
  getSettings,
  saveSettings
}

const { STORAGE_KEYS, getStorage, setStorage, generateId, removeStorage } = require('./storage')

const getInvoiceList = () => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  return list.sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return b.createTime - a.createTime
  })
}

const getInvoiceById = (id) => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  return list.find(item => item.id === id)
}

const addInvoice = (invoice) => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  const newInvoice = {
    ...invoice,
    id: generateId(),
    createTime: Date.now(),
    updateTime: Date.now(),
    isDefault: invoice.isDefault || false
  }
  
  if (newInvoice.isDefault) {
    list.forEach(item => {
      item.isDefault = false
    })
  }
  
  list.push(newInvoice)
  setStorage(STORAGE_KEYS.INVOICE_LIST, list)
  return newInvoice
}

const updateInvoice = (id, invoice) => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  const index = list.findIndex(item => item.id === id)
  
  if (index === -1) return null
  
  if (invoice.isDefault) {
    list.forEach(item => {
      item.isDefault = false
    })
  }
  
  list[index] = {
    ...list[index],
    ...invoice,
    updateTime: Date.now()
  }
  
  setStorage(STORAGE_KEYS.INVOICE_LIST, list)
  return list[index]
}

const deleteInvoice = (id) => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  const newList = list.filter(item => item.id !== id)
  setStorage(STORAGE_KEYS.INVOICE_LIST, newList)
  return true
}

const setDefaultInvoice = (id) => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  list.forEach(item => {
    item.isDefault = item.id === id
  })
  setStorage(STORAGE_KEYS.INVOICE_LIST, list)
  return true
}

const clearAllInvoices = () => {
  removeStorage(STORAGE_KEYS.INVOICE_LIST)
  return true
}

const getInvoiceCount = () => {
  const list = getStorage(STORAGE_KEYS.INVOICE_LIST) || []
  return list.length
}

module.exports = {
  getInvoiceList,
  getInvoiceById,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  setDefaultInvoice,
  clearAllInvoices,
  getInvoiceCount
}

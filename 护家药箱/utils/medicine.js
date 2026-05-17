const { getDaysFromNow } = require('./date.js')

function getMedicineStatus(expiryDate, remindDays = 30) {
  const daysLeft = getDaysFromNow(expiryDate)
  
  if (daysLeft < 0) {
    return 'expired'
  } else if (daysLeft <= remindDays) {
    return 'expiring'
  } else {
    return 'normal'
  }
}

function getStatusText(status) {
  const statusMap = {
    normal: '正常',
    expiring: '临期',
    expired: '已过期'
  }
  return statusMap[status] || '未知'
}

function getStatusColorClass(status) {
  const colorMap = {
    normal: 'text-success',
    expiring: 'text-warning',
    expired: 'text-danger'
  }
  return colorMap[status] || ''
}

function getStatusBgClass(status) {
  const bgMap = {
    normal: 'bg-success',
    expiring: 'bg-warning',
    expired: 'bg-danger'
  }
  return bgMap[status] || ''
}

function sortMedicinesByStatus(medicines, remindDays = 30) {
  const sorted = [...medicines].sort((a, b) => {
    const statusA = getMedicineStatus(a.expiryDate, remindDays)
    const statusB = getMedicineStatus(b.expiryDate, remindDays)
    
    const statusPriority = { expired: 0, expiring: 1, normal: 2 }
    
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusA] - statusPriority[statusB]
    }
    
    const daysLeftA = getDaysFromNow(a.expiryDate)
    const daysLeftB = getDaysFromNow(b.expiryDate)
    return daysLeftA - daysLeftB
  })
  
  return sorted
}

function getExpiringMedicines(medicines, remindDays = 30) {
  return medicines.filter(med => {
    const status = getMedicineStatus(med.expiryDate, remindDays)
    return status === 'expiring' || status === 'expired'
  })
}

function getCategoryIcon(category) {
  const iconMap = {
    '感冒': '🤧',
    '肠胃': '💊',
    '外用': '🩹',
    '退烧': '🌡️',
    '消炎': '🧪',
    '止痛': '😣',
    '维生素': '💪',
    '其他': '💊'
  }
  return iconMap[category] || '💊'
}

function batchProcessMedicines(medicines, remindDays = 30) {
  const processed = medicines.map(med => ({
    ...med,
    status: getMedicineStatus(med.expiryDate, remindDays),
    statusText: getStatusText(getMedicineStatus(med.expiryDate, remindDays)),
    categoryIcon: getCategoryIcon(med.category),
    daysLeft: getDaysFromNow(med.expiryDate)
  }))

  const sorted = [...processed].sort((a, b) => {
    const statusPriority = { expired: 0, expiring: 1, normal: 2 }
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }
    return a.daysLeft - b.daysLeft
  })

  const expiring = processed.filter(m => m.status === 'expiring' || m.status === 'expired')
  const counts = {
    total: processed.length,
    normal: processed.filter(m => m.status === 'normal').length,
    expiring: processed.filter(m => m.status === 'expiring').length,
    expired: processed.filter(m => m.status === 'expired').length
  }

  return { sorted, expiring, counts, processed }
}

module.exports = {
  getMedicineStatus,
  getStatusText,
  getStatusColorClass,
  getStatusBgClass,
  sortMedicinesByStatus,
  getExpiringMedicines,
  getCategoryIcon,
  batchProcessMedicines
}

const formatForText = (invoice) => {
  const lines = []
  lines.push(`公司名称：${invoice.companyName}`)
  lines.push(`纳税人识别号：${invoice.taxNumber}`)
  if (invoice.address) lines.push(`地址：${invoice.address}`)
  if (invoice.phone) lines.push(`电话：${invoice.phone}`)
  if (invoice.bank) lines.push(`开户行：${invoice.bank}`)
  if (invoice.account) lines.push(`账号：${invoice.account}`)
  return lines.join('\n')
}

const formatForJson = (invoice) => {
  return JSON.stringify({
    companyName: invoice.companyName,
    taxNumber: invoice.taxNumber,
    address: invoice.address || '',
    phone: invoice.phone || '',
    bank: invoice.bank || '',
    account: invoice.account || ''
  }, null, 2)
}

const formatForInvoice = (invoice) => {
  return `名称：${invoice.companyName}
纳税人识别号：${invoice.taxNumber}
地址：${invoice.address || ''}
电话：${invoice.phone || ''}
开户行：${invoice.bank || ''}
账号：${invoice.account || ''}`
}

const formatForWechat = (invoice) => {
  const parts = []
  parts.push(invoice.companyName)
  parts.push(invoice.taxNumber)
  if (invoice.address) parts.push(invoice.address)
  if (invoice.phone) parts.push(invoice.phone)
  if (invoice.bank) parts.push(invoice.bank)
  if (invoice.account) parts.push(invoice.account)
  return parts.join('，')
}

const formatListForExport = (invoiceList) => {
  const lines = ['=== 发票抬头信息 ===', '']
  
  invoiceList.forEach((invoice, index) => {
    lines.push(`--- 第 ${index + 1} 条 ---`)
    lines.push(`公司名称：${invoice.companyName}`)
    lines.push(`纳税人识别号：${invoice.taxNumber}`)
    if (invoice.address) lines.push(`地址：${invoice.address}`)
    if (invoice.phone) lines.push(`电话：${invoice.phone}`)
    if (invoice.bank) lines.push(`开户行：${invoice.bank}`)
    if (invoice.account) lines.push(`账号：${invoice.account}`)
    if (invoice.isDefault) lines.push(`备注：常用抬头`)
    lines.push('')
  })
  
  lines.push(`=== 共 ${invoiceList.length} 条抬头信息 ===`)
  lines.push(`导出时间：${new Date().toLocaleString()}`)
  
  return lines.join('\n')
}

module.exports = {
  formatForText,
  formatForJson,
  formatForInvoice,
  formatForWechat,
  formatListForExport
}

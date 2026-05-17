const storage = require('./utils/storage.js')
const { formatDate } = require('./utils/date.js')

App({
  onLaunch() {
    const medicines = storage.getMedicines()
    if (!medicines) {
      storage.saveMedicines(this.getSampleMedicines())
    }
    const records = storage.getRecords()
    if (!records) {
      storage.saveRecords(this.getSampleRecords())
    }
    const settings = storage.getSettings()
    if (!settings) {
      storage.saveSettings({
        remindDays: 30,
        familyMembers: ['爸爸', '妈妈', '爷爷', '奶奶']
      })
    }
    this.checkExpiringMedicines()
  },

  getSampleMedicines() {
    const today = new Date()
    const addDays = (days) => {
      const d = new Date(today)
      d.setDate(d.getDate() + days)
      return formatDate(d)
    }

    return [
      {
        id: '1',
        name: '感冒灵颗粒',
        category: '感冒',
        specification: '10g×10袋/盒',
        quantity: 8,
        unit: '袋',
        expiryDate: addDays(15),
        location: '客厅药箱',
        remark: '感冒时服用',
        createTime: Date.now() - 86400000 * 30
      },
      {
        id: '2',
        name: '布洛芬缓释胶囊',
        category: '退烧',
        specification: '0.3g×20粒/盒',
        quantity: 15,
        unit: '粒',
        expiryDate: addDays(365),
        location: '卧室抽屉',
        remark: '发烧、止痛用',
        createTime: Date.now() - 86400000 * 20
      },
      {
        id: '3',
        name: '健胃消食片',
        category: '肠胃',
        specification: '0.5g×36片/盒',
        quantity: 30,
        unit: '片',
        expiryDate: addDays(-10),
        location: '客厅药箱',
        remark: '消化不良时服用',
        createTime: Date.now() - 86400000 * 60
      },
      {
        id: '4',
        name: '碘伏消毒液',
        category: '外用',
        specification: '100ml/瓶',
        quantity: 2,
        unit: '瓶',
        expiryDate: addDays(180),
        location: '卫生间药柜',
        remark: '伤口消毒',
        createTime: Date.now() - 86400000 * 10
      },
      {
        id: '5',
        name: '维生素C片',
        category: '维生素',
        specification: '100mg×100片/瓶',
        quantity: 80,
        unit: '片',
        expiryDate: addDays(20),
        location: '客厅药箱',
        remark: '每日1片',
        createTime: Date.now() - 86400000 * 5
      }
    ]
  },

  getSampleRecords() {
    const now = Date.now()
    const oneDay = 86400000

    return [
      {
        id: '1',
        medicineId: '1',
        medicineName: '感冒灵颗粒',
        person: '爸爸',
        dosage: '每次1袋，每日3次',
        time: now - oneDay * 2,
        symptom: '感冒、流鼻涕',
        remark: '饭后服用',
        createTime: now - oneDay * 2
      },
      {
        id: '2',
        medicineId: '2',
        medicineName: '布洛芬缓释胶囊',
        person: '妈妈',
        dosage: '每次1粒',
        time: now - oneDay,
        symptom: '头痛',
        remark: '',
        createTime: now - oneDay
      },
      {
        id: '3',
        medicineId: '5',
        medicineName: '维生素C片',
        person: '爷爷',
        dosage: '每日1片',
        time: now,
        symptom: '日常补充',
        remark: '',
        createTime: now
      }
    ]
  },

  checkExpiringMedicines() {
    const { getDaysDiff } = require('./utils/date.js')
    const { getMedicineStatus } = require('./utils/medicine.js')
    const medicines = storage.getMedicines()
    const settings = storage.getSettings()
    const remindDays = settings.remindDays || 30

    const expiringMedicines = medicines.filter(med => {
      const status = getMedicineStatus(med.expiryDate, remindDays)
      return status === 'expiring' || status === 'expired'
    })

    if (expiringMedicines.length > 0) {
      this.globalData.expiringMedicines = expiringMedicines
    }
  },

  globalData: {
    expiringMedicines: [],
    categories: ['感冒', '肠胃', '外用', '退烧', '消炎', '止痛', '维生素', '其他']
  }
})

const storage = require('../../utils/storage.js')
const { formatDateTime } = require('../../utils/date.js')

Page({
  data: {
    medicines: [],
    medicineNames: [],
    medicineIndex: -1,
    familyMembers: [],
    timeRange: [],
    timeValue: [],
    form: {
      medicineId: '',
      medicineName: '',
      person: '',
      dosage: '',
      time: '',
      timeText: '',
      symptom: '',
      remark: ''
    }
  },

  onLoad(options) {
    const settings = storage.getSettings()
    const familyMembers = settings.familyMembers || ['本人', '家人1', '家人2', '家人3']
    
    const medicines = storage.getMedicines() || []
    const medicineNames = medicines.map(m => m.name)
    
    const now = new Date()
    const years = []
    const months = []
    const days = []
    const hours = []
    const minutes = []
    
    for (let i = 0; i < 5; i++) {
      years.push(String(now.getFullYear() + i))
    }
    for (let i = 1; i <= 12; i++) {
      months.push(String(i).padStart(2, '0'))
    }
    for (let i = 1; i <= 31; i++) {
      days.push(String(i).padStart(2, '0'))
    }
    for (let i = 0; i < 24; i++) {
      hours.push(String(i).padStart(2, '0'))
    }
    for (let i = 0; i < 60; i += 5) {
      minutes.push(String(i).padStart(2, '0'))
    }

    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const currentDay = String(now.getDate()).padStart(2, '0')
    const currentHour = String(now.getHours()).padStart(2, '0')
    const currentMinute = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0')

    let preselectedMedicineIndex = -1
    if (options.medicineId) {
      preselectedMedicineIndex = medicines.findIndex(m => m.id === options.medicineId)
    }

    this.setData({
      medicines,
      medicineNames,
      familyMembers,
      timeRange: [years, months, days, hours, minutes],
      timeValue: [0, parseInt(currentMonth) - 1, parseInt(currentDay) - 1, parseInt(currentHour), Math.floor(parseInt(currentMinute) / 5)],
      medicineIndex: preselectedMedicineIndex,
      'form.person': familyMembers[0],
      'form.medicineId': preselectedMedicineIndex >= 0 ? medicines[preselectedMedicineIndex].id : '',
      'form.medicineName': preselectedMedicineIndex >= 0 ? medicines[preselectedMedicineIndex].name : '',
      'form.time': now.getTime(),
      'form.timeText': formatDateTime(now.getTime())
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  onMedicineChange(e) {
    const index = e.detail.value
    const medicine = this.data.medicines[index]
    this.setData({
      medicineIndex: index,
      'form.medicineId': medicine.id,
      'form.medicineName': medicine.name
    })
  },

  selectPerson(e) {
    this.setData({
      'form.person': e.currentTarget.dataset.person
    })
  },

  onTimeChange(e) {
    const value = e.detail.value
    const [yearIdx, monthIdx, dayIdx, hourIdx, minuteIdx] = value
    const [years, months, days, hours, minutes] = this.data.timeRange
    
    const dateStr = `${years[yearIdx]}-${months[monthIdx]}-${days[dayIdx]} ${hours[hourIdx]}:${minutes[minuteIdx]}:00`
    const time = new Date(dateStr).getTime()
    const timeText = formatDateTime(time)
    
    this.setData({
      timeValue: value,
      'form.time': time,
      'form.timeText': timeText
    })
  },

  goBack() {
    wx.navigateBack()
  },

  goToAddMedicine() {
    wx.navigateTo({
      url: '/pages/medicine-edit/medicine-edit'
    })
  },

  submit() {
    const { form, medicineIndex } = this.data

    if (medicineIndex < 0) {
      wx.showToast({ title: '请选择药品', icon: 'none' })
      return
    }
    if (!form.person) {
      wx.showToast({ title: '请选择服用人', icon: 'none' })
      return
    }

    const recordData = {
      medicineId: form.medicineId,
      medicineName: form.medicineName,
      person: form.person,
      dosage: form.dosage.trim(),
      time: form.time,
      symptom: form.symptom.trim(),
      remark: form.remark.trim()
    }

    const success = storage.addRecord(recordData)

    if (success) {
      wx.showToast({
        title: '记录成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      wx.showToast({
        title: '记录失败',
        icon: 'error'
      })
    }
  }
})

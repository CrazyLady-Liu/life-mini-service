const util = require('./util.js')
const storage = require('./storage.js')

let reminderTimer = null
let lastRemindedCourses = new Set()

const startReminderCheck = () => {
  stopReminderCheck()
  
  checkReminders()
  
  reminderTimer = setInterval(() => {
    checkReminders()
  }, 60000)
}

const stopReminderCheck = () => {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

const checkReminders = () => {
  const settings = storage.getSettings()
  if (!settings.reminderEnabled) return

  const now = new Date()
  const currentWeek = util.getCurrentWeekNumber()
  const courses = storage.getCourses()

  const reminderMinutes = settings.reminderTime || 15

  courses.forEach(course => {
    if (!util.isWeekInRange(currentWeek, course.weekRange)) return

    const nextCourseTime = getNextCourseTime(course, now)
    if (!nextCourseTime) return

    const diffMinutes = (nextCourseTime.getTime() - now.getTime()) / (1000 * 60)

    if (diffMinutes >= reminderMinutes - 1 && diffMinutes <= reminderMinutes + 1) {
      const reminderKey = `${course.id}_${util.formatDate(nextCourseTime)}`
      if (lastRemindedCourses.has(reminderKey)) return

      showReminder(course, nextCourseTime, reminderMinutes)
      lastRemindedCourses.add(reminderKey)

      storage.addReminderLog({
        courseId: course.id,
        courseName: course.name,
        time: util.formatTime(nextCourseTime),
        remindedAt: util.formatTime(now),
        minutesBefore: reminderMinutes
      })

      setTimeout(() => {
        lastRemindedCourses.delete(reminderKey)
      }, 5 * 60 * 1000)
    }
  })
}

const getNextCourseTime = (course, fromDate) => {
  const today = fromDate.getDay() || 7
  const courseDate = new Date(fromDate)

  if (course.weekday >= today) {
    courseDate.setDate(courseDate.getDate() + (course.weekday - today))
  } else {
    courseDate.setDate(courseDate.getDate() + (7 - today + course.weekday))
  }

  const firstSection = Math.min.apply(null, course.sections)
  const timeSlot = util.getTimeSlot(firstSection - 1)
  const [hours, minutes] = timeSlot.start.split(':')
  courseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  if (courseDate.getTime() < fromDate.getTime()) {
    courseDate.setDate(courseDate.getDate() + 7)
  }

  return courseDate
}

const showReminder = (course, courseTime, minutesBefore) => {
  const settings = storage.getSettings()

  if (settings.reminderVibrate) {
    wx.vibrateLong({
      fail: () => {
        wx.vibrateShort({ type: 'heavy' })
      }
    })
  }

  if (settings.reminderSound) {
    playReminderSound(settings.reminderSoundType)
  }

  const firstSection = Math.min.apply(null, course.sections)
  const timeStr = util.formatDate(courseTime) + ' ' + util.getTimeSlot(firstSection - 1).start
  
  wx.showModal({
    title: '⏰ 上课提醒',
    content: `${minutesBefore}分钟后上课\n\n📚 ${course.name}\n📍 ${course.classroom || '待定'}\n👨‍🏫 ${course.teacher || '待定'}\n🕐 ${timeStr}`,
    showCancel: false,
    confirmText: '知道了',
    confirmColor: '#667eea'
  })

  if (wx.setTopBarText) {
    wx.setTopBarText({
      text: `${course.name} - ${minutesBefore}分钟后上课`
    })
  }
}

const playReminderSound = (soundType) => {
  try {
    const audioContext = wx.createInnerAudioContext()
    
    const soundFiles = {
      'default': '/sounds/reminder.mp3',
      'bell': '/sounds/bell.mp3',
      'chime': '/sounds/chime.mp3',
      'gentle': '/sounds/gentle.mp3'
    }
    
    audioContext.src = soundFiles[soundType] || soundFiles['default']
    audioContext.volume = 0.8
    
    audioContext.onError(() => {
      wx.vibrateShort({ type: 'medium' })
    })
    
    audioContext.play()
    
    setTimeout(() => {
      audioContext.destroy()
    }, 5000)
  } catch (e) {
    wx.vibrateShort({ type: 'medium' })
  }
}

const scheduleCourseReminder = (course) => {
  const settings = storage.getSettings()
  if (!settings.reminderEnabled) return false

  const reminderMinutes = settings.reminderTime || 15
  const nextCourseTime = getNextCourseTime(course, new Date())

  if (!nextCourseTime) return false

  const diffMs = nextCourseTime.getTime() - Date.now() - reminderMinutes * 60 * 1000

  if (diffMs > 0 && diffMs < 7 * 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      showReminder(course, nextCourseTime, reminderMinutes)
    }, diffMs)
    return true
  }

  return false
}

const getTodayReminders = () => {
  const settings = storage.getSettings()
  if (!settings.reminderEnabled) return []

  const today = new Date()
  const courses = storage.getCoursesByDate(today)
  const currentWeek = util.getCurrentWeekNumber()

  return courses
    .filter(course => util.isWeekInRange(currentWeek, course.weekRange))
    .map(course => {
      const firstSection = Math.min.apply(null, course.sections)
      const timeSlot = util.getTimeSlot(firstSection - 1)
      const reminderTime = new Date(today)
      const [hours, minutes] = timeSlot.start.split(':')
      reminderTime.setHours(parseInt(hours), parseInt(minutes) - settings.reminderTime, 0, 0)

      return {
        courseId: course.id,
        courseName: course.name,
        classroom: course.classroom,
        teacher: course.teacher,
        courseTime: timeSlot.start,
        reminderTime: util.formatTime(reminderTime),
        minutesBefore: settings.reminderTime
      }
    })
    .sort((a, b) => a.reminderTime.localeCompare(b.reminderTime))
}

const getUpcomingReminders = (limit = 5) => {
  const settings = storage.getSettings()
  if (!settings.reminderEnabled) return []

  const now = new Date()
  const courses = storage.getCourses()
  const currentWeek = util.getCurrentWeekNumber()
  const reminders = []

  courses.forEach(course => {
    if (!util.isWeekInRange(currentWeek, course.weekRange)) return

    const nextTime = getNextCourseTime(course, now)
    if (!nextTime) return

    const reminderTime = new Date(nextTime.getTime() - settings.reminderTime * 60 * 1000)
    if (reminderTime > now) {
      reminders.push({
        courseId: course.id,
        courseName: course.name,
        classroom: course.classroom,
        teacher: course.teacher,
        courseTime: util.formatTime(nextTime),
        reminderTime: util.formatTime(reminderTime),
        minutesBefore: settings.reminderTime
      })
    }
  })

  return reminders
    .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime))
    .slice(0, limit)
}

const testReminder = () => {
  const testCourse = {
    id: 'test',
    name: '测试课程',
    classroom: '教学楼A101',
    teacher: '张老师',
    sections: [1],
    weekday: 1
  }

  const courseTime = new Date()
  courseTime.setMinutes(courseTime.getMinutes() + 1)

  showReminder(testCourse, courseTime, 1)

  return true
}

module.exports = {
  startReminderCheck,
  stopReminderCheck,
  checkReminders,
  showReminder,
  scheduleCourseReminder,
  getTodayReminders,
  getUpcomingReminders,
  testReminder
}

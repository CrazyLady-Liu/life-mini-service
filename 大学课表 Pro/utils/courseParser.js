const util = require('./util.js')

const TEACHER_KEYWORDS = ['老师', '教授', '讲师', '助教', '教师']
const CLASSROOM_KEYWORDS = ['教室', '教学楼', '实验楼', '机房', '室', '楼', '堂', 'A座', 'B座', 'C座', 'D座']
const WEEK_KEYWORDS = ['周', '星期', '周次']
const SECTION_KEYWORDS = ['节', '节次', '第.*节', '-.*节']

const parseText = (text) => {
  if (!text || typeof text !== 'string') {
    return { success: false, courses: [], error: '输入内容为空' }
  }

  const lines = text.split(/[\n\r]+/).map(line => line.trim()).filter(line => line)
  const courses = []
  const errors = []

  lines.forEach((line, index) => {
    try {
      const course = parseSingleLine(line)
      if (course) {
        courses.push(course)
      }
    } catch (e) {
      errors.push(`第${index + 1}行解析失败: ${e.message}`)
    }
  })

  return {
    success: courses.length > 0,
    courses,
    errors,
    total: lines.length,
    parsed: courses.length
  }
}

const parseSingleLine = (line) => {
  if (!line || line.length < 2) return null

  const course = {
    name: '',
    teacher: '',
    classroom: '',
    weekday: null,
    sections: [],
    weekRange: [],
    raw: line
  }

  const tokens = tokenize(line)

  let nameParts = []
  tokens.forEach(token => {
    if (token.type === 'text' && !isLikelyTeacher(token.value) && !isLikelyClassroom(token.value)) {
      nameParts.push(token.value)
    }
  })
  course.name = nameParts.join(' ').trim()

  tokens.forEach(token => {
    if (token.type === 'teacher') {
      course.teacher = token.value
    } else if (token.type === 'classroom') {
      course.classroom = token.value
    } else if (token.type === 'weekday') {
      course.weekday = token.value
    } else if (token.type === 'sections') {
      course.sections = token.value
    } else if (token.type === 'weekRange') {
      course.weekRange = token.value
    }
  })

  if (!course.name && tokens.length > 0) {
    course.name = tokens[0].value
  }

  if (!course.weekday || course.sections.length === 0) {
    const weekdayMatch = line.match(/星期?([一二三四五六日1-7])/)
    if (weekdayMatch) {
      const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7 }
      course.weekday = map[weekdayMatch[1]] || 1
    }

    const sectionMatch = line.match(/第?\s*(\d+)\s*[-—~至]\s*(\d+)\s*节/)
    if (sectionMatch) {
      const start = parseInt(sectionMatch[1])
      const end = parseInt(sectionMatch[2])
      for (let i = start; i <= end; i++) {
        course.sections.push(i)
      }
    } else {
      const singleSectionMatch = line.match(/第?\s*(\d+)\s*节/)
      if (singleSectionMatch) {
        course.sections = [parseInt(singleSectionMatch[1])]
      }
    }
  }

  if (!course.weekRange || course.weekRange.length === 0) {
    const weekMatch = line.match(/(\d+)\s*[-—~至]\s*(\d+)\s*周/)
    if (weekMatch) {
      course.weekRange = [{
        type: 'continuous',
        value: [parseInt(weekMatch[1]), parseInt(weekMatch[2])]
      }]
    }
  }

  if (!course.name || !course.weekday || course.sections.length === 0) {
    return null
  }

  return course
}

const tokenize = (line) => {
  const tokens = []
  const parts = line.split(/[\s,，、]+/)

  parts.forEach(part => {
    if (part.length === 0) return

    const teacher = extractTeacher(part)
    if (teacher) {
      tokens.push({ type: 'teacher', value: teacher })
      return
    }

    const classroom = extractClassroom(part)
    if (classroom) {
      tokens.push({ type: 'classroom', value: classroom })
      return
    }

    const weekday = extractWeekday(part)
    if (weekday) {
      tokens.push({ type: 'weekday', value: weekday })
      return
    }

    const sections = extractSections(part)
    if (sections && sections.length > 0) {
      tokens.push({ type: 'sections', value: sections })
      return
    }

    const weekRange = extractWeekRange(part)
    if (weekRange && weekRange.length > 0) {
      tokens.push({ type: 'weekRange', value: weekRange })
      return
    }

    tokens.push({ type: 'text', value: part })
  })

  return tokens
}

const extractTeacher = (text) => {
  if (text.length > 10) return null

  for (const keyword of TEACHER_KEYWORDS) {
    if (text.includes(keyword)) {
      return text.replace(/老师|教授|讲师|助教|教师/g, '').trim() || text
    }
  }

  if (/^[\u4e00-\u9fa5]{2,4}$/.test(text) && !isLikelyClassroom(text)) {
    return text
  }

  return null
}

const extractClassroom = (text) => {
  if (text.length > 30) return null

  for (const keyword of CLASSROOM_KEYWORDS) {
    if (text.includes(keyword)) {
      return text
    }
  }

  if (/^[A-Za-z]?\d{3,5}[A-Za-z]?$/.test(text)) {
    return text
  }

  if (/^[\u4e00-\u9fa5]{1,3}\d{2,4}$/.test(text)) {
    return text
  }

  return null
}

const extractWeekday = (text) => {
  const map = {
    '周一': 1, '星期二': 2, '周三': 3, '星期四': 4, '周五': 5, '星期六': 6, '周日': 7,
    '星期1': 1, '星期2': 2, '星期3': 3, '星期4': 4, '星期5': 5, '星期6': 6, '星期7': 7,
    '星期一一': 1, '星期二二': 2, '星期三三': 3, '星期四四': 4, '星期五五': 5, '星期六六': 6, '星期日日': 7,
    '周1': 1, '周2': 2, '周3': 3, '周4': 4, '周5': 5, '周6': 6, '周7': 7,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7
  }

  const match = text.match(/星期?([一二三四五六日1-7])/)
  if (match) {
    const key = text.match(/星期?[一二三四五六日1-7]/)[0]
    return map[key] || map[match[1]] || null
  }

  return null
}

const extractSections = (text) => {
  const sections = []

  const rangeMatch = text.match(/(\d+)\s*[-—~至]\s*(\d+)\s*节?/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])
    if (start >= 1 && end <= 12 && start <= end) {
      for (let i = start; i <= end; i++) {
        sections.push(i)
      }
      return sections
    }
  }

  const multiMatch = text.match(/(\d+(?:\s*[,，、]\s*\d+)+)\s*节?/)
  if (multiMatch) {
    const nums = multiMatch[1].split(/[,，、]/).map(n => parseInt(n.trim()))
    nums.forEach(n => {
      if (n >= 1 && n <= 12) {
        sections.push(n)
      }
    })
    return [...new Set(sections)].sort((a, b) => a - b)
  }

  const singleMatch = text.match(/第?\s*(\d+)\s*节/)
  if (singleMatch) {
    const n = parseInt(singleMatch[1])
    if (n >= 1 && n <= 12) {
      return [n]
    }
  }

  return sections
}

const extractWeekRange = (text) => {
  const ranges = []

  const rangeMatch = text.match(/(\d+)\s*[-—~至]\s*(\d+)\s*周/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])
    if (start >= 1 && end <= 30 && start <= end) {
      ranges.push({ type: 'continuous', value: [start, end] })
      return ranges
    }
  }

  const multiMatch = text.match(/(\d+(?:\s*[,，、]\s*\d+)+)\s*周/)
  if (multiMatch) {
    const nums = multiMatch[1].split(/[,，、]/).map(n => parseInt(n.trim()))
    nums.forEach(n => {
      if (n >= 1 && n <= 30) {
        ranges.push({ type: 'single', value: n })
      }
    })
    return ranges
  }

  return ranges
}

const isLikelyTeacher = (text) => {
  if (!text) return false
  return TEACHER_KEYWORDS.some(keyword => text.includes(keyword)) || /^[\u4e00-\u9fa5]{2,4}$/.test(text)
}

const isLikelyClassroom = (text) => {
  if (!text) return false
  return CLASSROOM_KEYWORDS.some(keyword => text.includes(keyword)) || /^[A-Za-z]?\d{3,5}[A-Za-z]?$/.test(text)
}

const parseExcelData = (rows) => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return { success: false, courses: [], error: 'Excel数据为空' }
  }

  const courses = []
  const headers = rows[0].map(h => (h || '').toString().trim())
  
  const nameIndex = findColumnIndex(headers, ['课程名', '课程名称', '课程', '名称', 'name', 'course'])
  const teacherIndex = findColumnIndex(headers, ['教师', '老师', '授课教师', '讲师', 'teacher', 'professor'])
  const classroomIndex = findColumnIndex(headers, ['教室', '地点', '上课地点', '教学楼', 'classroom', 'location', 'room'])
  const weekdayIndex = findColumnIndex(headers, ['星期', '周几', '星期几', 'weekday', 'day'])
  const sectionIndex = findColumnIndex(headers, ['节次', '节', '第几节', 'section', 'period'])
  const weekRangeIndex = findColumnIndex(headers, ['周次', '周', '上课周', 'week', 'weeks'])
  const timeIndex = findColumnIndex(headers, ['时间', '上课时间', 'time'])

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(cell => !cell)) continue

    const course = {
      name: getCellValue(row, nameIndex, ''),
      teacher: getCellValue(row, teacherIndex, ''),
      classroom: getCellValue(row, classroomIndex, ''),
      weekday: null,
      sections: [],
      weekRange: [],
      raw: row.join(',')
    }

    const weekdayValue = getCellValue(row, weekdayIndex, '')
    if (weekdayValue) {
      const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7 }
      const match = weekdayValue.toString().match(/[一二三四五六日1-7]/)
      if (match) {
        course.weekday = map[match[0]] || 1
      }
    }

    const sectionValue = getCellValue(row, sectionIndex, '')
    if (sectionValue) {
      course.sections = extractSections(sectionValue.toString())
    }

    const weekRangeValue = getCellValue(row, weekRangeIndex, '')
    if (weekRangeValue) {
      course.weekRange = util.parseWeekRange(weekRangeValue.toString())
    }

    const timeValue = getCellValue(row, timeIndex, '')
    if (timeValue && (!course.sections || course.sections.length === 0)) {
      course.sections = guessSectionsFromTime(timeValue.toString())
    }

    if (course.name && course.weekday && course.sections.length > 0) {
      courses.push(course)
    }
  }

  return {
    success: courses.length > 0,
    courses,
    total: rows.length - 1,
    parsed: courses.length
  }
}

const findColumnIndex = (headers, keywords) => {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase()
    if (keywords.some(keyword => header.includes(keyword.toLowerCase()))) {
      return i
    }
  }
  return -1
}

const getCellValue = (row, index, defaultValue) => {
  if (index < 0 || index >= row.length) return defaultValue
  return row[index] !== undefined && row[index] !== null ? row[index] : defaultValue
}

const guessSectionsFromTime = (timeStr) => {
  const sections = []
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    const hour = parseInt(timeMatch[1])
    const minute = parseInt(timeMatch[2])
    const totalMinutes = hour * 60 + minute

    const timeSlots = [
      { start: 480, end: 525, section: 1 },
      { start: 535, end: 580, section: 2 },
      { start: 600, end: 645, section: 3 },
      { start: 655, end: 700, section: 4 },
      { start: 840, end: 885, section: 5 },
      { start: 895, end: 940, section: 6 },
      { start: 960, end: 1005, section: 7 },
      { start: 1015, end: 1060, section: 8 },
      { start: 1140, end: 1185, section: 9 },
      { start: 1195, end: 1240, section: 10 },
      { start: 1250, end: 1295, section: 11 }
    ]

    for (const slot of timeSlots) {
      if (totalMinutes >= slot.start && totalMinutes <= slot.end) {
        sections.push(slot.section)
        break
      }
    }
  }
  return sections
}

const validateCourse = (course) => {
  const errors = []

  if (!course.name || course.name.trim() === '') {
    errors.push('课程名称不能为空')
  }

  if (!course.weekday || course.weekday < 1 || course.weekday > 7) {
    errors.push('请选择星期')
  }

  if (!course.sections || course.sections.length === 0) {
    errors.push('请选择节次')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

module.exports = {
  parseText,
  parseSingleLine,
  parseExcelData,
  validateCourse,
  tokenize,
  extractTeacher,
  extractClassroom,
  extractWeekday,
  extractSections,
  extractWeekRange
}

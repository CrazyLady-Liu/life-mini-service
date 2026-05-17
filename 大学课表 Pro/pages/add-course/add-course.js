const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')
const courseParser = require('../../utils/courseParser.js')

Page({
  data: {
    isEdit: false,
    courseId: '',
    name: '',
    teacher: '',
    classroom: '',
    weekday: 1,
    weekdayOptions: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    sections: [],
    sectionOptions: [
      { value: 1, _selected: false },
      { value: 2, _selected: false },
      { value: 3, _selected: false },
      { value: 4, _selected: false },
      { value: 5, _selected: false },
      { value: 6, _selected: false },
      { value: 7, _selected: false },
      { value: 8, _selected: false },
      { value: 9, _selected: false },
      { value: 10, _selected: false },
      { value: 11, _selected: false }
    ],
    weekRangeInput: '1-20',
    weekRange: [],
    color: '',
    colorOptions: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00'
    ],
    note: ''
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        courseId: options.id
      })
      wx.setNavigationBarTitle({ title: '编辑课程' })
      this.loadCourse(options.id)
    } else {
      this.setData({
        weekRange: [{ type: 'continuous', value: [1, 20] }],
        color: this.data.colorOptions[0]
      })
    }
  },

  loadCourse: function (id) {
    const course = storage.getCourseById(id)
    if (course) {
      const sections = course.sections || []
      const sectionOptions = this.data.sectionOptions.map(opt => ({
        ...opt,
        _selected: sections.indexOf(opt.value) > -1
      }))
      
      this.setData({
        name: course.name || '',
        teacher: course.teacher || '',
        classroom: course.classroom || '',
        weekday: course.weekday || 1,
        sections,
        sectionOptions,
        weekRangeInput: util.weekRangeToString(course.weekRange),
        weekRange: course.weekRange || [],
        color: storage.getCourseColor(course.name),
        note: course.note || ''
      })
    }
  },

  onNameInput: function (e) {
    this.setData({ name: e.detail.value })
  },

  onTeacherInput: function (e) {
    this.setData({ teacher: e.detail.value })
  },

  onClassroomInput: function (e) {
    this.setData({ classroom: e.detail.value })
  },

  onWeekdayChange: function (e) {
    this.setData({ weekday: parseInt(e.detail.value) + 1 })
  },

  onSectionToggle: function (e) {
    const index = parseInt(e.currentTarget.dataset.value)
    const sectionOptions = [...this.data.sectionOptions]
    const sections = [...this.data.sections]
    
    sectionOptions[index]._selected = !sectionOptions[index]._selected
    
    const section = sectionOptions[index].value
    const idx = sections.indexOf(section)
    if (idx > -1) {
      sections.splice(idx, 1)
    } else {
      sections.push(section)
    }
    
    this.setData({ 
      sections: sections.sort((a, b) => a - b),
      sectionOptions
    })
  },

  onWeekRangeInput: function (e) {
    const input = e.detail.value
    const weekRange = util.parseWeekRange(input)
    this.setData({
      weekRangeInput: input,
      weekRange
    })
  },

  onColorSelect: function (e) {
    const color = e.currentTarget.dataset.color
    this.setData({ color })
  },

  onNoteInput: function (e) {
    this.setData({ note: e.detail.value })
  },

  onSave: function () {
    const { name, teacher, classroom, weekday, sections, weekRange, color, note, isEdit, courseId } = this.data

    if (!name || name.trim() === '') {
      util.showToast('请输入课程名称')
      return
    }

    if (sections.length === 0) {
      util.showToast('请选择节次')
      return
    }

    const courseData = {
      name: name.trim(),
      teacher: teacher.trim(),
      classroom: classroom.trim(),
      weekday,
      sections: sections.sort((a, b) => a - b),
      weekRange,
      note
    }

    const validation = courseParser.validateCourse(courseData)
    if (!validation.valid) {
      util.showToast(validation.errors[0])
      return
    }

    if (isEdit) {
      storage.updateCourse(courseId, courseData)
      util.showToast('修改成功', 'success')
    } else {
      storage.addCourse(courseData)
      util.showToast('添加成功', 'success')
    }

    if (color) {
      storage.setCourseColor(name.trim(), color)
    }

    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  },

  onDelete: function () {
    if (!this.data.isEdit) return

    wx.showModal({
      title: '删除确认',
      content: '确定要删除这门课程吗？',
      confirmColor: '#ee0a24',
      success: (res) => {
        if (res.confirm) {
          storage.deleteCourse(this.data.courseId)
          util.showToast('删除成功', 'success')
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        }
      }
    })
  },

  onQuickFill: function () {
    wx.showModal({
      title: '快捷输入',
      editable: true,
      placeholderText: '如：高等数学 周一 1-2节 张老师 教学楼A101',
      success: (res) => {
        if (res.confirm && res.content) {
          const parsed = courseParser.parseSingleLine(res.content)
          if (parsed) {
            this.setData({
              name: parsed.name || this.data.name,
              teacher: parsed.teacher || this.data.teacher,
              classroom: parsed.classroom || this.data.classroom,
              weekday: parsed.weekday || this.data.weekday,
              sections: parsed.sections || this.data.sections,
              weekRange: parsed.weekRange || this.data.weekRange,
              weekRangeInput: util.weekRangeToString(parsed.weekRange) || this.data.weekRangeInput
            })
            util.showToast('已自动填充', 'success')
          } else {
            util.showToast('未能识别课程信息')
          }
        }
      }
    })
  }
})

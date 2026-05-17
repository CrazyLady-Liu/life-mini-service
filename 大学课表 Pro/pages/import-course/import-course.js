const util = require('../../utils/util.js')
const storage = require('../../utils/storage.js')
const courseParser = require('../../utils/courseParser.js')

Page({
  data: {
    importType: 'text',
    inputText: '',
    parsedCourses: [],
    selectedCourses: [],
    courseColors: {},
    isParsed: false,
    parseResult: null
  },

  onLoad: function () {},

  onTypeChange: function (e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      importType: type,
      isParsed: false,
      parsedCourses: [],
      selectedCourses: []
    })
  },

  onTextInput: function (e) {
    this.setData({ inputText: e.detail.value })
  },

  onParseText: function () {
    const { inputText } = this.data
    
    if (!inputText || inputText.trim() === '') {
      util.showToast('请输入课表内容')
      return
    }

    const result = courseParser.parseText(inputText)
    
    if (!result.success) {
      util.showToast(result.errors[0] || '未能解析出课程')
      return
    }

    const courseColors = {}
    const parsedCourses = result.courses.map((course, index) => {
      if (!courseColors[course.name]) {
        courseColors[course.name] = storage.getCourseColor(course.name)
      }
      return {
        ...course,
        _index: index,
        _selected: true
      }
    })

    const selectedCourses = result.courses.map((_, index) => index)

    this.setData({
      parsedCourses,
      selectedCourses,
      courseColors,
      isParsed: true,
      parseResult: result
    })

    util.showToast(`解析成功 ${result.parsed} 门课程`, 'success')
  },

  onCourseToggle: function (e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const selected = [...this.data.selectedCourses]
    const idx = selected.indexOf(index)
    
    const parsedCourses = [...this.data.parsedCourses]
    parsedCourses[index]._selected = !parsedCourses[index]._selected
    
    if (idx > -1) {
      selected.splice(idx, 1)
    } else {
      selected.push(index)
    }
    
    this.setData({ 
      selectedCourses: selected.sort((a, b) => a - b),
      parsedCourses
    })
  },

  onSelectAll: function () {
    const parsedCourses = [...this.data.parsedCourses]
    let selectedCourses = []
    
    if (this.data.selectedCourses.length === this.data.parsedCourses.length) {
      parsedCourses.forEach(c => c._selected = false)
    } else {
      parsedCourses.forEach((c, i) => {
        c._selected = true
        selectedCourses.push(i)
      })
    }
    
    this.setData({ 
      selectedCourses,
      parsedCourses
    })
  },

  onImport: function () {
    const { parsedCourses, selectedCourses } = this.data
    
    if (selectedCourses.length === 0) {
      util.showToast('请选择要导入的课程')
      return
    }

    const coursesToImport = selectedCourses.map(i => parsedCourses[i])
    
    let successCount = 0
    coursesToImport.forEach(course => {
      const validation = courseParser.validateCourse(course)
      if (validation.valid) {
        storage.addCourse(course)
        successCount++
      }
    })

    if (successCount > 0) {
      util.showToast(`成功导入 ${successCount} 门课程`, 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      util.showToast('没有可导入的课程')
    }
  },

  onChooseFile: function () {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['xls', 'xlsx', 'csv'],
      success: (res) => {
        const file = res.tempFiles[0]
        this.readExcelFile(file)
      },
      fail: () => {
        util.showToast('选择文件失败')
      }
    })
  },

  readExcelFile: function (file) {
    wx.showLoading({ title: '解析中...' })
    
    wx.getFileSystemManager().readFile({
      filePath: file.path,
      encoding: 'utf-8',
      success: (res) => {
        this.parseCsvData(res.data)
      },
      fail: () => {
        wx.hideLoading()
        util.showToast('文件读取失败，请尝试CSV格式')
      }
    })
  },

  parseCsvData: function (content) {
    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim())
      const rows = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')))
      
      const result = courseParser.parseExcelData(rows)
      wx.hideLoading()
      
      if (!result.success) {
        util.showToast(result.error || '未能解析出课程')
        return
      }

      const courseColors = {}
      const parsedCourses = result.courses.map((course, index) => {
        if (!courseColors[course.name]) {
          courseColors[course.name] = storage.getCourseColor(course.name)
        }
        return {
          ...course,
          _index: index,
          _selected: true
        }
      })

      const selectedCourses = result.courses.map((_, index) => index)

      this.setData({
        parsedCourses,
        selectedCourses,
        courseColors,
        isParsed: true,
        parseResult: result
      })

      util.showToast(`解析成功 ${result.parsed} 门课程`, 'success')
    } catch (e) {
      wx.hideLoading()
      util.showToast('文件解析失败')
    }
  },

  onPasteFromClipboard: function () {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          this.setData({ inputText: res.data })
          util.showToast('已粘贴', 'success')
        } else {
          util.showToast('剪贴板为空')
        }
      }
    })
  },

  onClearInput: function () {
    this.setData({ inputText: '' })
  },

  onDemoData: function () {
    const demoText = `高等数学 周一 1-2节 张老师 教学楼A101 1-16周
大学英语 周三 3-4节 李老师 外语楼B202 1-16周
程序设计 周五 5-6节 王老师 计算机楼C301 1-16周
物理实验 周二 7-8节 刘老师 实验楼D102 1-8周
体育 周四 9-10节 陈老师 体育馆 1-16周`
    
    this.setData({ inputText: demoText })
    util.showToast('已加载示例数据', 'success')
  }
})

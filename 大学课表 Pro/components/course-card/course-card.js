const util = require('../../utils/util.js')

Component({
  properties: {
    course: {
      type: Object,
      value: {}
    },
    color: {
      type: String,
      value: '#667eea'
    },
    showWeekRange: {
      type: Boolean,
      value: true
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  data: {
    timeSlot: '',
    sectionsDisplay: '',
    weekRangeDisplay: ''
  },

  lifetimes: {
    attached: function () {
      this.updateDisplay()
    }
  },

  observers: {
    'course': function (course) {
      this.updateDisplay()
    }
  },

  methods: {
    updateDisplay: function () {
      const { course } = this.properties
      if (!course || !course.sections) return

      const firstSection = Math.min.apply(null, course.sections)
      const timeSlot = util.getTimeSlot(firstSection - 1)
      const sectionsDisplay = util.getSectionsDisplay(course.sections)
      const weekRangeDisplay = util.getWeekRangeDisplay(course.weekRange)

      this.setData({
        timeSlot: timeSlot ? `${timeSlot.start}-${timeSlot.end}` : '',
        sectionsDisplay,
        weekRangeDisplay
      })
    },

    onTap: function () {
      this.triggerEvent('tap', { course: this.properties.course })
    },

    onLongPress: function () {
      this.triggerEvent('longpress', { course: this.properties.course })
    }
  }
})

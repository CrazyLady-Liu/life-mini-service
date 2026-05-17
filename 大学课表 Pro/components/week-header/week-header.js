const util = require('../../utils/util.js')

Component({
  properties: {
    selectedDate: {
      type: String,
      value: ''
    },
    weekNumber: {
      type: Number,
      value: 1
    },
    showWeekNumber: {
      type: Boolean,
      value: true
    }
  },

  data: {
    weekDates: [],
    today: ''
  },

  lifetimes: {
    attached: function () {
      this.initWeekDates()
    }
  },

  observers: {
    'selectedDate': function (selectedDate) {
      if (selectedDate) {
        this.initWeekDates(new Date(selectedDate))
      }
    }
  },

  methods: {
    initWeekDates: function (baseDate) {
      const date = baseDate ? new Date(baseDate) : new Date()
      const weekDates = util.getWeekDates(date)
      const today = util.formatDate(new Date())

      this.setData({
        weekDates,
        today
      })
    },

    onDateTap: function (e) {
      const date = e.currentTarget.dataset.date
      this.triggerEvent('datechange', { date })
    },

    onPrevWeek: function () {
      const current = this.data.weekDates[0] ? new Date(this.data.weekDates[0].date) : new Date()
      current.setDate(current.getDate() - 7)
      this.initWeekDates(current)
      this.triggerEvent('weekchange', { date: util.formatDate(current) })
    },

    onNextWeek: function () {
      const current = this.data.weekDates[0] ? new Date(this.data.weekDates[0].date) : new Date()
      current.setDate(current.getDate() + 7)
      this.initWeekDates(current)
      this.triggerEvent('weekchange', { date: util.formatDate(current) })
    },

    onBackToday: function () {
      const today = new Date()
      this.initWeekDates(today)
      this.triggerEvent('datechange', { date: util.formatDate(today) })
    }
  }
})

"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_checkin = require("../../stores/checkin.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const currentYear = common_vendor.ref((/* @__PURE__ */ new Date()).getFullYear());
    const currentMonth = common_vendor.ref((/* @__PURE__ */ new Date()).getMonth());
    const selectedDate = common_vendor.ref("");
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const calendarDates = common_vendor.computed(() => {
      const result = [];
      const firstDay = new Date(currentYear.value, currentMonth.value, 1);
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
      const today = /* @__PURE__ */ new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const startPadding = firstDay.getDay();
      const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
      for (let i = startPadding - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const month = currentMonth.value - 1;
        const year = month < 0 ? currentYear.value - 1 : currentYear.value;
        const actualMonth = month < 0 ? 11 : month;
        const dateStr = `${year}-${String(actualMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const record = stores_checkin.checkinStore.records[dateStr];
        result.push({
          day,
          dateStr,
          currentMonth: false,
          isToday: false,
          completed: (record == null ? void 0 : record.completedCount) > 0 || false,
          completedCount: (record == null ? void 0 : record.completedCount) || 0,
          totalCount: (record == null ? void 0 : record.totalCount) || 5
        });
      }
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const record = stores_checkin.checkinStore.records[dateStr];
        result.push({
          day,
          dateStr,
          currentMonth: true,
          isToday: dateStr === todayStr,
          completed: (record == null ? void 0 : record.completedCount) > 0 || false,
          completedCount: (record == null ? void 0 : record.completedCount) || 0,
          totalCount: (record == null ? void 0 : record.totalCount) || 5
        });
      }
      const remaining = 42 - result.length;
      for (let day = 1; day <= remaining; day++) {
        const month = currentMonth.value + 1;
        const year = month > 11 ? currentYear.value + 1 : currentYear.value;
        const actualMonth = month > 11 ? 0 : month;
        const dateStr = `${year}-${String(actualMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const record = stores_checkin.checkinStore.records[dateStr];
        result.push({
          day,
          dateStr,
          currentMonth: false,
          isToday: false,
          completed: (record == null ? void 0 : record.completedCount) > 0 || false,
          completedCount: (record == null ? void 0 : record.completedCount) || 0,
          totalCount: (record == null ? void 0 : record.totalCount) || 5
        });
      }
      return result;
    });
    const monthlyRecords = common_vendor.computed(() => {
      return stores_checkin.checkinStore.getRecordsByMonth(currentYear.value, currentMonth.value);
    });
    const monthCompletionRate = common_vendor.computed(() => {
      if (monthlyRecords.value.length === 0)
        return 0;
      const total = monthlyRecords.value.reduce((acc, r) => acc + r.totalCount, 0);
      const completed = monthlyRecords.value.reduce((acc, r) => acc + r.completedCount, 0);
      return total > 0 ? Math.round(completed / total * 100) : 0;
    });
    const checkinDaysInMonth = common_vendor.computed(() => {
      return monthlyRecords.value.filter((r) => r.completedCount > 0).length;
    });
    const selectedRecord = common_vendor.computed(() => {
      if (!selectedDate.value)
        return null;
      return stores_checkin.checkinStore.records[selectedDate.value] || null;
    });
    const selectedDateLabel = common_vendor.computed(() => {
      if (!selectedDate.value)
        return "";
      const [, month, day] = selectedDate.value.split("-");
      return `${parseInt(month)}月${parseInt(day)}日`;
    });
    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else {
        currentMonth.value--;
      }
      selectedDate.value = "";
    };
    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else {
        currentMonth.value++;
      }
      selectedDate.value = "";
    };
    const selectDate = (date) => {
      if (date.currentMonth) {
        selectedDate.value = date.dateStr;
      }
    };
    const getBarHeight = (record) => {
      if (record.totalCount === 0)
        return 0;
      return record.completedCount / record.totalCount * 100;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(prevMonth),
        b: common_vendor.t(currentYear.value),
        c: common_vendor.t(currentMonth.value + 1),
        d: common_vendor.o(nextMonth),
        e: common_vendor.t(common_vendor.unref(monthCompletionRate)),
        f: common_vendor.t(common_vendor.unref(checkinDaysInMonth)),
        g: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).currentStreak),
        h: common_vendor.f(weekdays, (day, k0, i0) => {
          return {
            a: common_vendor.t(day),
            b: day
          };
        }),
        i: common_vendor.f(common_vendor.unref(calendarDates), (date, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(date.day),
            b: date.completed
          }, date.completed ? {} : {}, {
            c: index,
            d: !date.currentMonth ? 1 : "",
            e: date.isToday ? 1 : "",
            f: date.completed ? 1 : "",
            g: date.dateStr === selectedDate.value ? 1 : "",
            h: common_vendor.o(($event) => selectDate(date), index)
          });
        }),
        j: common_vendor.unref(selectedRecord)
      }, common_vendor.unref(selectedRecord) ? {
        k: common_vendor.t(common_vendor.unref(selectedDateLabel)),
        l: common_vendor.t(common_vendor.unref(selectedRecord).completedCount),
        m: common_vendor.t(common_vendor.unref(selectedRecord).totalCount),
        n: common_vendor.f(common_vendor.unref(selectedRecord).items, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.completed ? "✓ 已完成" : "✗ 未完成"),
            d: item.id,
            e: item.completed ? 1 : ""
          };
        })
      } : {}, {
        o: common_vendor.f(common_vendor.unref(monthlyRecords), (record, index, i0) => {
          return {
            a: getBarHeight(record) + "%",
            b: getBarHeight(record) < 50 ? 1 : "",
            c: getBarHeight(record) >= 50 && getBarHeight(record) < 80 ? 1 : "",
            d: getBarHeight(record) >= 80 ? 1 : "",
            e: common_vendor.t(record.date.split("-")[2]),
            f: index
          };
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-03f4b073"], ["__file", "C:/Users/xuejun/Documents/trae_projects/life-mini-service/自律时光记/src/pages/calendar/index.vue"]]);
wx.createPage(MiniProgramPage);

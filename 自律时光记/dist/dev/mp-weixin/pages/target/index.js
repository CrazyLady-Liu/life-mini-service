"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_checkin = require("../../stores/checkin.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const schedule = common_vendor.reactive({
      wakeUp: "06:30",
      sleep: "22:30"
    });
    const reminders = common_vendor.reactive({
      checkin: true,
      checkinTime: "09:00",
      sleep: true,
      sleepTime: "22:00"
    });
    const toggleTarget = (id) => {
      stores_checkin.checkinStore.toggleTarget(id);
    };
    const toggleReminder = (type) => {
      reminders[type] = !reminders[type];
    };
    const onCheckinTimeChange = (e) => {
      reminders.checkinTime = e.detail.value;
    };
    const onSleepTimeChange = (e) => {
      reminders.sleepTime = e.detail.value;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(common_vendor.unref(stores_checkin.checkinStore).targets, (target, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(target.icon),
            b: target.enabled ? target.color + "20" : "#f3f4f6",
            c: common_vendor.t(target.name),
            d: target.reminderTime
          }, target.reminderTime ? {
            e: common_vendor.t(target.reminderTime)
          } : {}, {
            f: target.enabled ? 1 : "",
            g: common_vendor.o(($event) => toggleTarget(target.id), target.id),
            h: target.id,
            i: common_vendor.o(($event) => toggleTarget(target.id), target.id)
          });
        }),
        b: common_vendor.t(schedule.wakeUp),
        c: common_vendor.t(schedule.sleep),
        d: reminders.checkin ? 1 : "",
        e: common_vendor.o(($event) => toggleReminder("checkin")),
        f: reminders.checkin
      }, reminders.checkin ? {
        g: common_vendor.t(reminders.checkinTime),
        h: reminders.checkinTime,
        i: common_vendor.o(onCheckinTimeChange)
      } : {}, {
        j: reminders.sleep ? 1 : "",
        k: common_vendor.o(($event) => toggleReminder("sleep")),
        l: reminders.sleep
      }, reminders.sleep ? {
        m: common_vendor.t(reminders.sleepTime),
        n: reminders.sleepTime,
        o: common_vendor.o(onSleepTimeChange)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-15b7c927"], ["__file", "C:/Users/xuejun/Documents/trae_projects/life-mini-service/自律时光记/src/pages/target/index.vue"]]);
wx.createPage(MiniProgramPage);

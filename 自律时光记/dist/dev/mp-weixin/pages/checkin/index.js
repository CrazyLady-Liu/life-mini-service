"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_checkin = require("../../stores/checkin.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const currentDate = common_vendor.computed(() => {
      const date = /* @__PURE__ */ new Date();
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    });
    const weekday = common_vendor.computed(() => {
      const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      return days[(/* @__PURE__ */ new Date()).getDay()];
    });
    const completionHint = common_vendor.computed(() => {
      const rate = stores_checkin.checkinStore.completionRate;
      if (rate === 0)
        return "开始今天的打卡吧！";
      if (rate < 50)
        return "加油，继续努力！";
      if (rate < 100)
        return "太棒了，差一点就完成了！";
      return "🎉 全部完成！";
    });
    const showMotivation = common_vendor.computed(() => stores_checkin.checkinStore.completionRate === 100);
    const motivationQuotes = [
      "坚持就是胜利！",
      "自律给你自由！",
      "今天的努力是明天的底气！",
      "你真的很棒！",
      "每一天都是新的开始！"
    ];
    const motivationQuote = common_vendor.computed(() => {
      return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
    });
    const handleCheckin = (item) => {
      if (!item.completed) {
        stores_checkin.checkinStore.checkin(item.id);
        common_vendor.index.showToast({
          title: `${item.name}打卡成功！`,
          icon: "success"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(currentDate)),
        b: common_vendor.t(common_vendor.unref(weekday)),
        c: common_vendor.unref(stores_checkin.checkinStore).currentStreak > 0
      }, common_vendor.unref(stores_checkin.checkinStore).currentStreak > 0 ? {
        d: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).currentStreak)
      } : {}, {
        e: common_vendor.unref(stores_checkin.checkinStore).completionRate,
        f: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).completionRate),
        g: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).completedCount),
        h: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).totalCount),
        i: common_vendor.t(common_vendor.unref(completionHint)),
        j: common_vendor.f(common_vendor.unref(stores_checkin.checkinStore).today.items, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.icon),
            b: item.completed ? item.color + "20" : "#f3f4f6",
            c: common_vendor.t(item.name),
            d: common_vendor.t(item.completed ? "已完成" : "未完成"),
            e: item.completed
          }, item.completed ? {} : {}, {
            f: item.completed ? 1 : "",
            g: item.id,
            h: item.completed ? 1 : "",
            i: common_vendor.o(($event) => handleCheckin(item), item.id)
          });
        }),
        k: common_vendor.unref(showMotivation)
      }, common_vendor.unref(showMotivation) ? {
        l: common_vendor.t(common_vendor.unref(motivationQuote))
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a8aeee56"], ["__file", "C:/Users/xuejun/Documents/trae_projects/life-mini-service/自律时光记/src/pages/checkin/index.vue"]]);
wx.createPage(MiniProgramPage);

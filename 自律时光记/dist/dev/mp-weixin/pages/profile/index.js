"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const stores_checkin = require("../../stores/checkin.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userLevel = common_vendor.computed(() => {
      const days = stores_checkin.checkinStore.totalCheckinDays;
      if (days >= 100)
        return 10;
      if (days >= 50)
        return 5;
      if (days >= 30)
        return 3;
      if (days >= 10)
        return 2;
      return 1;
    });
    const averageCompletionRate = common_vendor.computed(() => {
      const records = Object.values(stores_checkin.checkinStore.records);
      if (records.length === 0)
        return 0;
      const totalRate = records.reduce((acc, r) => {
        return acc + (r.totalCount > 0 ? r.completedCount / r.totalCount * 100 : 0);
      }, 0);
      return Math.round(totalRate / records.length);
    });
    const achievements = common_vendor.computed(() => [
      { id: 1, icon: "🌱", name: "初出茅庐", unlocked: stores_checkin.checkinStore.totalCheckinDays >= 1 },
      { id: 2, icon: "🔥", name: "连续7天", unlocked: stores_checkin.checkinStore.currentStreak >= 7 },
      { id: 3, icon: "💪", name: "连续30天", unlocked: stores_checkin.checkinStore.currentStreak >= 30 },
      { id: 4, icon: "🏆", name: "月度冠军", unlocked: stores_checkin.checkinStore.totalCheckinDays >= 30 },
      { id: 5, icon: "⭐", name: "完美一周", unlocked: stores_checkin.checkinStore.totalCheckinDays >= 7 },
      { id: 6, icon: "🌟", name: "百天打卡", unlocked: stores_checkin.checkinStore.totalCheckinDays >= 100 }
    ]);
    const goToHistory = () => {
      common_vendor.index.navigateTo({ url: "/pages/calendar/index" });
    };
    const goToStats = () => {
      common_vendor.index.navigateTo({ url: "/pages/calendar/index" });
    };
    const goToSettings = () => {
      common_vendor.index.navigateTo({ url: "/pages/target/index" });
    };
    const goToHelp = () => {
      common_vendor.index.showToast({
        title: "帮助与反馈功能开发中",
        icon: "none"
      });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？所有数据将被清除。",
        success: (res) => {
          if (res.confirm) {
            stores_user.userStore.logout();
            common_vendor.index.reLaunch({ url: "/pages/checkin/index" });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(stores_user.userStore).profile.nickname.charAt(0)),
        b: common_vendor.t(common_vendor.unref(stores_user.userStore).profile.nickname),
        c: common_vendor.t(common_vendor.unref(userLevel)),
        d: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).totalCheckinDays),
        e: common_vendor.t(common_vendor.unref(stores_checkin.checkinStore).currentStreak),
        f: common_vendor.t(common_vendor.unref(averageCompletionRate)),
        g: common_vendor.o(goToHistory),
        h: common_vendor.o(goToStats),
        i: common_vendor.o(goToSettings),
        j: common_vendor.o(goToHelp),
        k: common_vendor.f(common_vendor.unref(achievements), (achievement, k0, i0) => {
          return {
            a: common_vendor.t(achievement.icon),
            b: common_vendor.t(achievement.name),
            c: achievement.id,
            d: achievement.unlocked ? 1 : ""
          };
        }),
        l: common_vendor.o(handleLogout)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f97f9319"], ["__file", "C:/Users/xuejun/Documents/trae_projects/life-mini-service/自律时光记/src/pages/profile/index.vue"]]);
wx.createPage(MiniProgramPage);

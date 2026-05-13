"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const nickname = common_vendor.ref("");
    common_vendor.onMounted(() => {
      if (stores_user.userStore.checkLoginStatus()) {
        common_vendor.index.switchTab({
          url: "/pages/checkin/index"
        });
      }
    });
    const handleLogin = () => {
      if (!nickname.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return;
      }
      stores_user.userStore.updateProfile({ nickname: nickname.value.trim() });
      stores_user.userStore.login();
      common_vendor.index.showToast({
        title: "登录成功",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/checkin/index"
        });
      }, 1500);
    };
    const guestLogin = () => {
      stores_user.userStore.login();
      common_vendor.index.showToast({
        title: "游客登录成功",
        icon: "success"
      });
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/checkin/index"
        });
      }, 1500);
    };
    return (_ctx, _cache) => {
      return {
        a: nickname.value,
        b: common_vendor.o(($event) => nickname.value = $event.detail.value),
        c: !nickname.value.trim() ? 1 : "",
        d: common_vendor.o(handleLogin),
        e: common_vendor.o(guestLogin)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-45258083"], ["__file", "C:/Users/xuejun/Documents/trae_projects/life-mini-service/自律时光记/src/pages/login/index.vue"]]);
wx.createPage(MiniProgramPage);

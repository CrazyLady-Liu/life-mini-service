"use strict";
const common_vendor = require("../common/vendor.js");
const DEFAULT_PROFILE = {
  nickname: "自律达人",
  avatar: "",
  totalCheckinDays: 0,
  currentStreak: 0
};
const state = common_vendor.reactive({
  profile: (() => {
    const saved = common_vendor.index.getStorageSync("profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  })(),
  isLoggedIn: (() => {
    const saved = common_vendor.index.getStorageSync("isLoggedIn");
    return saved ? JSON.parse(saved) : false;
  })()
});
function updateProfile(updates) {
  Object.assign(state.profile, updates);
  common_vendor.index.setStorageSync("profile", JSON.stringify(state.profile));
}
function logout() {
  state.isLoggedIn = false;
  common_vendor.index.setStorageSync("isLoggedIn", JSON.stringify(false));
  common_vendor.index.removeStorageSync("profile");
  common_vendor.index.removeStorageSync("records");
  common_vendor.index.removeStorageSync("targets");
}
function login() {
  state.isLoggedIn = true;
  common_vendor.index.setStorageSync("isLoggedIn", JSON.stringify(true));
}
function checkLoginStatus() {
  return state.isLoggedIn;
}
const userStore = {
  get profile() {
    return state.profile;
  },
  get isLoggedIn() {
    return state.isLoggedIn;
  },
  updateProfile,
  logout,
  login,
  checkLoginStatus
};
exports.userStore = userStore;

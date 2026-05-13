"use strict";
const common_vendor = require("../common/vendor.js");
const DEFAULT_TARGETS = [
  { id: "early", name: "早起", icon: "🌅", color: "#f59e0b", enabled: true, reminderTime: "06:30" },
  { id: "early_sleep", name: "早睡", icon: "🌙", color: "#6366f1", enabled: true, reminderTime: "22:30" },
  { id: "exercise", name: "运动", icon: "💪", color: "#10b981", enabled: true, reminderTime: "19:00" },
  { id: "water", name: "喝水", icon: "💧", color: "#3b82f6", enabled: true, reminderTime: null },
  { id: "study", name: "学习", icon: "📚", color: "#8b5cf6", enabled: true, reminderTime: "20:00" }
];
function getTodayString() {
  const today2 = /* @__PURE__ */ new Date();
  return `${today2.getFullYear()}-${String(today2.getMonth() + 1).padStart(2, "0")}-${String(today2.getDate()).padStart(2, "0")}`;
}
function generateMockRecords() {
  const records = {};
  const today2 = /* @__PURE__ */ new Date();
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today2);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const items = DEFAULT_TARGETS.map((target) => ({
      id: target.id,
      name: target.name,
      icon: target.icon,
      color: target.color,
      completed: Math.random() > 0.3
    }));
    records[dateStr] = {
      date: dateStr,
      items,
      completedCount: items.filter((i2) => i2.completed).length,
      totalCount: items.length
    };
  }
  return records;
}
const state = common_vendor.reactive({
  targets: (() => {
    const saved = common_vendor.index.getStorageSync("targets");
    return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
  })(),
  records: (() => {
    const saved = common_vendor.index.getStorageSync("records");
    return saved ? JSON.parse(saved) : generateMockRecords();
  })()
});
const today = common_vendor.computed(() => {
  const dateStr = getTodayString();
  if (!state.records[dateStr]) {
    state.records[dateStr] = {
      date: dateStr,
      items: state.targets.filter((t) => t.enabled).map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        color: t.color,
        completed: false
      })),
      completedCount: 0,
      totalCount: state.targets.filter((t) => t.enabled).length
    };
  }
  return state.records[dateStr];
});
const completedCount = common_vendor.computed(() => today.value.completedCount);
const totalCount = common_vendor.computed(() => today.value.totalCount);
const completionRate = common_vendor.computed(() => {
  if (totalCount.value === 0)
    return 0;
  return Math.round(completedCount.value / totalCount.value * 100);
});
const currentStreak = common_vendor.computed(() => {
  let streak = 0;
  const today2 = /* @__PURE__ */ new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today2);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const record = state.records[dateStr];
    if (record && record.completedCount > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
});
const totalCheckinDays = common_vendor.computed(() => {
  return Object.values(state.records).filter((r) => r.completedCount > 0).length;
});
function checkin(itemId) {
  const item = today.value.items.find((i) => i.id === itemId);
  if (item && !item.completed) {
    item.completed = true;
    today.value.completedCount++;
    saveRecords();
  }
}
function updateTarget(id, updates) {
  const target = state.targets.find((t) => t.id === id);
  if (target) {
    Object.assign(target, updates);
    saveTargets();
    const dateStr = getTodayString();
    if (state.records[dateStr]) {
      const item = state.records[dateStr].items.find((i) => i.id === id);
      if (item) {
        Object.assign(item, {
          name: updates.name || item.name,
          icon: updates.icon || item.icon,
          color: updates.color || item.color
        });
      }
    }
  }
}
function toggleTarget(id) {
  const target = state.targets.find((t) => t.id === id);
  if (target) {
    target.enabled = !target.enabled;
    saveTargets();
    const dateStr = getTodayString();
    if (state.records[dateStr]) {
      const existingItem = state.records[dateStr].items.find((i) => i.id === id);
      if (target.enabled && !existingItem) {
        state.records[dateStr].items.push({
          id: target.id,
          name: target.name,
          icon: target.icon,
          color: target.color,
          completed: false
        });
        state.records[dateStr].totalCount++;
      } else if (!target.enabled && existingItem) {
        const index = state.records[dateStr].items.indexOf(existingItem);
        if (index > -1) {
          state.records[dateStr].items.splice(index, 1);
          state.records[dateStr].totalCount--;
        }
      }
      saveRecords();
    }
  }
}
function getRecordsByMonth(year, month) {
  const result = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const record = state.records[dateStr];
    if (record) {
      result.push(record);
    }
  }
  return result;
}
function saveTargets() {
  common_vendor.index.setStorageSync("targets", JSON.stringify(state.targets));
}
function saveRecords() {
  common_vendor.index.setStorageSync("records", JSON.stringify(state.records));
}
const checkinStore = {
  get targets() {
    return state.targets;
  },
  get records() {
    return state.records;
  },
  today,
  completedCount,
  totalCount,
  completionRate,
  currentStreak,
  totalCheckinDays,
  checkin,
  updateTarget,
  toggleTarget,
  getRecordsByMonth
};
exports.checkinStore = checkinStore;

<template>
  <div class="growth-page">
    <van-nav-bar title="身高体重" />

    <div class="content">
      <div class="latest-growth" v-if="growthStore.latestGrowth">
        <div class="growth-header">
          <span class="label">最新记录</span>
          <span class="date">{{ formatDate(growthStore.latestGrowth.date) }}</span>
        </div>
        <div class="growth-data">
          <div class="data-item">
            <span class="data-value">{{ growthStore.latestGrowth.height }}</span>
            <span class="data-unit">cm</span>
            <span class="data-label">身高</span>
          </div>
          <div class="data-divider"></div>
          <div class="data-item">
            <span class="data-value">{{ growthStore.latestGrowth.weight }}</span>
            <span class="data-unit">kg</span>
            <span class="data-label">体重</span>
          </div>
        </div>
      </div>

      <div class="record-list" v-if="growthStore.growthRecords.length > 0">
        <div class="record-card" v-for="r in sortedRecords" :key="r.id">
          <div class="record-date">{{ formatDate(r.date) }}</div>
          <div class="record-data">
            <span class="record-item">身高 {{ r.height }} cm</span>
            <span class="record-divider">|</span>
            <span class="record-item">体重 {{ r.weight }} kg</span>
          </div>
          <van-icon name="cross" @click="deleteGrowth(r.id)" />
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">📊</div>
        <p>还没有身高体重记录</p>
      </div>
    </div>

    <van-fab icon="plus" @click="showAddDialog = true" />

    <van-dialog
      v-model:show="showAddDialog"
      title="记录身高体重"
      show-cancel-button
      @confirm="addGrowth"
    >
      <div class="dialog-form">
        <van-field
          v-model="newGrowth.height"
          type="number"
          placeholder="请输入身高（cm）"
        />
        <van-field
          v-model="newGrowth.weight"
          type="number"
          placeholder="请输入体重（kg）"
        />
        <van-field
          v-model="newGrowth.date"
          type="date"
          placeholder="选择测量日期"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGrowthStore } from '@/stores/growth'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const growthStore = useGrowthStore()
const showAddDialog = ref(false)
const newGrowth = ref({
  height: '',
  weight: '',
  date: dayjs().format('YYYY-MM-DD')
})

const sortedRecords = computed(() => {
  return [...growthStore.growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const addGrowth = () => {
  if (!newGrowth.value.height) {
    showToast('请输入身高')
    return
  }
  if (!newGrowth.value.weight) {
    showToast('请输入体重')
    return
  }
  if (!newGrowth.value.date) {
    showToast('请选择测量日期')
    return
  }
  growthStore.addGrowthRecord(newGrowth.value)
  showToast('添加成功')
  newGrowth.value = {
    height: '',
    weight: '',
    date: dayjs().format('YYYY-MM-DD')
  }
  showAddDialog.value = false
}

const deleteGrowth = (id) => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除这条记录吗？'
  }).then(() => {
    growthStore.deleteGrowthRecord(id)
    showToast('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.growth-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 15px;
}

.latest-growth {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.growth-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: white;
  opacity: 0.9;
  font-size: 14px;
}

.growth-data {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.data-item {
  text-align: center;
  color: white;
}

.data-value {
  font-size: 36px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.data-unit {
  font-size: 16px;
  opacity: 0.9;
  margin-right: 5px;
}

.data-label {
  font-size: 14px;
  opacity: 0.8;
  display: block;
}

.data-divider {
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
}

.record-list {
  margin-top: 15px;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-date {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.record-data {
  font-size: 14px;
  color: #666;
}

.record-divider {
  margin: 0 10px;
  color: #ddd;
}

.record-card .van-icon {
  color: #999;
  font-size: 20px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  color: #999;
  font-size: 15px;
}

.dialog-form {
  padding: 10px 0;
}

:deep(.van-dialog__content) {
  width: 90% !important;
  max-width: 400px !important;
}
</style>

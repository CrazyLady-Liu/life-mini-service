<template>
  <div class="record-page">
    <van-nav-bar title="成长记录" />

    <div class="content">
      <div class="record-list" v-if="recordStore.records.length > 0">
        <div class="record-card" v-for="r in recordStore.records" :key="r.id">
          <div class="record-header">
            <span class="record-date">{{ formatDate(r.createTime) }}</span>
            <van-icon name="cross" @click="deleteRecord(r.id)" />
          </div>
          <div class="record-content">{{ r.content }}</div>
          <div class="record-remark" v-if="r.remark">
            <span class="remark-label">备注：</span>{{ r.remark }}
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">📝</div>
        <p>还没有成长记录</p>
      </div>
    </div>

    <van-fab icon="plus" @click="showAddDialog = true" />

    <van-dialog
      v-model:show="showAddDialog"
      title="添加成长记录"
      show-cancel-button
      @confirm="addRecord"
    >
      <div class="dialog-form">
        <van-field
          v-model="newRecord.content"
          type="textarea"
          rows="4"
          placeholder="记录宝宝的成长瞬间..."
        />
        <van-field
          v-model="newRecord.remark"
          type="textarea"
          rows="2"
          placeholder="添加备注（可选）"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRecordStore } from '@/stores/record'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const recordStore = useRecordStore()
const showAddDialog = ref(false)
const newRecord = ref({
  content: '',
  remark: ''
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm')
}

const addRecord = () => {
  if (!newRecord.value.content.trim()) {
    showToast('请输入记录内容')
    return
  }
  recordStore.addRecord(newRecord.value)
  showToast('添加成功')
  newRecord.value = { content: '', remark: '' }
  showAddDialog.value = false
}

const deleteRecord = (id) => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除这条记录吗？'
  }).then(() => {
    recordStore.deleteRecord(id)
    showToast('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.record-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 15px;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-date {
  font-size: 13px;
  color: #999;
}

.record-header .van-icon {
  color: #999;
  font-size: 18px;
  cursor: pointer;
}

.record-content {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
}

.record-remark {
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
}

.remark-label {
  color: #999;
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

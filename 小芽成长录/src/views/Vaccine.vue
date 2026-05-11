<template>
  <div class="vaccine-page">
    <van-nav-bar title="疫苗提醒" />

    <div class="content">
      <van-tabs v-model:active="activeTab">
        <van-tab title="待接种">
          <div class="vaccine-list" v-if="pendingVaccines.length > 0">
            <div class="vaccine-card" v-for="v in pendingVaccines" :key="v.id">
            <div class="vaccine-info">
              <div class="vaccine-name">{{ v.name }}</div>
              <div class="vaccine-date">{{ formatDate(v.date) }}</div>
            </div>
            <div class="vaccine-actions">
              <van-button size="small" type="success" @click="toggleVaccinated(v.id)">已接种</van-button>
              <van-icon name="cross" @click="deleteVaccine(v.id)" />
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">💉</div>
          <p>暂无待接种疫苗</p>
        </div>
        </van-tab>
        <van-tab title="已接种">
          <div class="vaccine-list" v-if="completedVaccines.length > 0">
            <div class="vaccine-card completed" v-for="v in completedVaccines" :key="v.id">
            <div class="vaccine-info">
              <div class="vaccine-name">{{ v.name }}</div>
              <div class="vaccine-date">{{ formatDate(v.date) }}</div>
            </div>
            <div class="vaccine-status">
              <van-icon name="checked" />
              <span>已接种</span>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">✅</div>
          <p>暂无已接种记录</p>
        </div>
        </van-tab>
      </van-tabs>
    </div>

    <van-fab icon="plus" @click="showAddDialog = true" />

    <van-dialog
      v-model:show="showAddDialog"
      title="添加疫苗提醒"
      show-cancel-button
      @confirm="addVaccine"
    >
      <div class="dialog-form">
        <van-field
          v-model="newVaccine.name"
          placeholder="请输入疫苗名称"
        />
        <van-field
          v-model="newVaccine.date"
          type="date"
          placeholder="选择接种日期"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVaccineStore } from '@/stores/vaccine'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const vaccineStore = useVaccineStore()
const activeTab = ref(0)
const showAddDialog = ref(false)
const newVaccine = ref({
  name: '',
  date: '',
  vaccinated: false
})

const pendingVaccines = computed(() => {
  return vaccineStore.vaccines.filter(v => !v.vaccinated)
})

const completedVaccines = computed(() => {
  return vaccineStore.vaccines.filter(v => v.vaccinated)
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const addVaccine = () => {
  if (!newVaccine.value.name.trim()) {
    showToast('请输入疫苗名称')
    return
  }
  if (!newVaccine.value.date) {
    showToast('请选择接种日期')
    return
  }
  vaccineStore.addVaccine(newVaccine.value)
  showToast('添加成功')
  newVaccine.value = { name: '', date: '', vaccinated: false }
  showAddDialog.value = false
}

const toggleVaccinated = (id) => {
  vaccineStore.toggleVaccinated(id)
  showToast('已标记为已接种')
}

const deleteVaccine = (id) => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除这条疫苗提醒吗？'
  }).then(() => {
    vaccineStore.deleteVaccine(id)
    showToast('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.vaccine-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 15px;
}

.vaccine-list {
  padding-top: 10px;
}

.vaccine-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vaccine-card.completed {
  opacity: 0.7;
}

.vaccine-info {
  flex: 1;
}

.vaccine-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.vaccine-date {
  font-size: 13px;
  color: #666;
}

.vaccine-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.vaccine-actions .van-icon {
  color: #999;
  font-size: 20px;
  cursor: pointer;
}

.vaccine-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #07c160;
  font-size: 14px;
}

.vaccine-status .van-icon {
  font-size: 18px;
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

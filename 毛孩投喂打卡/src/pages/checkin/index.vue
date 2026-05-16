<template>
  <view class="page">
    <view class="header">
      <view class="date-section">
        <text class="date-text">{{ currentDate }}</text>
        <text class="weekday-text">{{ weekday }}</text>
      </view>
      <view class="streak-badge" v-if="feedingStore.feedingStats.currentStreak > 0">
        <text class="streak-icon">🔥</text>
        <text class="streak-text">连续{{ feedingStore.feedingStats.currentStreak }}天</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ feedingStore.feedingStats.totalFeedings }}</text>
          <text class="stat-label">累计投喂</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ feedingStore.feedingStats.totalDays }}</text>
          <text class="stat-label">投喂天数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ feedingStore.todayRecords.length }}</text>
          <text class="stat-label">今日投喂</text>
        </view>
      </view>
    </view>

    <view class="form-card">
      <view class="form-header">
        <text class="form-title">📝 快速打卡</text>
        <text class="form-subtitle">点选标签，1秒完成打卡</text>
      </view>

      <view class="quick-section">
        <text class="section-label">📍 投喂地点</text>
        <view class="tag-group">
          <view
            v-for="loc in locationTags"
            :key="loc"
            class="tag-item"
            :class="{ active: formData.location === loc }"
            @click="selectLocation(loc)"
          >
            <text class="tag-text">{{ loc }}</text>
          </view>
          <view class="tag-item add-tag" @click="showAddLocation = true">
            <text class="tag-text">+ 添加</text>
          </view>
        </view>
      </view>

      <view class="quick-section">
        <text class="section-label">🐾 动物类型</text>
        <view class="animal-options">
          <view
            v-for="animal in animalOptions"
            :key="animal.value"
            class="animal-option"
            :class="{ active: formData.animalType === animal.value }"
            @click="selectAnimal(animal.value)"
          >
            <text class="animal-icon">{{ animal.icon }}</text>
            <text class="animal-label">{{ animal.label }}</text>
          </view>
        </view>
      </view>

      <view class="quick-section">
        <text class="section-label">🍖 投喂食物</text>
        <view class="tag-group">
          <view
            v-for="food in foodTags"
            :key="food"
            class="tag-item"
            :class="{ active: formData.food === food }"
            @click="selectFood(food)"
          >
            <text class="tag-text">{{ food }}</text>
          </view>
        </view>
      </view>

      <view class="quick-section photo-section">
        <view class="section-header">
          <text class="section-label">📷 照片（可选）</text>
          <text class="section-hint">上传现场实拍</text>
        </view>
        <view class="photo-upload" @click="chooseImage">
          <view v-if="formData.photo" class="photo-preview">
            <image :src="formData.photo" class="preview-image" mode="aspectFill" />
            <view class="remove-btn" @click.stop="removePhoto">
              <text class="remove-icon">×</text>
            </view>
          </view>
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击拍照或上传</text>
          </view>
        </view>
      </view>

      <view class="quick-section">
        <view class="section-header">
          <text class="section-label">📝 备注（可选）</text>
          <text class="section-hint">记录投喂情况</text>
        </view>
        <view class="quick-notes">
          <view
            v-for="note in quickNotes"
            :key="note"
            class="note-chip"
            :class="{ active: formData.notes === note }"
            @click="selectNote(note)"
          >
            <text class="note-text">{{ note }}</text>
          </view>
        </view>
        <input
          v-model="formData.notes"
          class="form-input mt-16"
          placeholder="或输入自定义备注..."
          maxlength="50"
        />
      </view>

      <view class="submit-section">
        <view
          class="submit-btn"
          :class="{ disabled: !canSubmit || isSubmitting }"
          @click="submitCheckin"
        >
          <text v-if="!isSubmitting" class="submit-text">🐾 一键打卡</text>
          <text v-else class="submit-text">提交中...</text>
        </view>
        <text class="submit-hint" v-if="canSubmit && !isSubmitting">点击提交，完成本次投喂记录</text>
      </view>
    </view>

    <view class="success-modal" v-if="showSuccess">
      <view class="success-content">
        <view class="success-icon">🎉</view>
        <text class="success-title">打卡成功！</text>
        <text class="success-message">感谢您对流浪毛孩的关爱 ❤️</text>
        <view class="success-info">
          <text class="info-item">{{ getAnimalIcon(formData.animalType) }} {{ getAnimalLabel(formData.animalType) }}</text>
          <text class="info-item">📍 {{ formData.location }}</text>
          <text class="info-item">🍖 {{ formData.food }}</text>
        </view>
        <view class="success-btn" @click="closeSuccess">
          <text class="success-btn-text">我知道了</text>
        </view>
      </view>
    </view>

    <view class="add-modal" v-if="showAddLocation" @click.self="showAddLocation = false">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">添加常用地点</text>
        </view>
        <input
          v-model="newLocation"
          class="modal-input"
          placeholder="请输入地点名称"
          maxlength="20"
          @confirm="addNewLocation"
        />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showAddLocation = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="addNewLocation">
            <text class="modal-btn-text">添加</text>
          </view>
        </view>
      </view>
    </view>

    <view class="today-records" v-if="feedingStore.todayRecords.length > 0">
      <view class="records-header">
        <text class="records-title">📋 今日投喂记录</text>
        <text class="records-count">{{ feedingStore.todayRecords.length }}条</text>
      </view>
      <view class="records-list">
        <view
          v-for="record in feedingStore.todayRecords"
          :key="record.id"
          class="record-card"
        >
          <view class="record-time">
            <text class="time-text">{{ record.time }}</text>
          </view>
          <view class="record-content">
            <view class="record-animal">
              <text class="animal-type-icon">{{ getAnimalIcon(record.animalType) }}</text>
              <text class="animal-type-label">{{ record.animalTypeLabel }}</text>
            </view>
            <text class="record-food">{{ record.food }}</text>
            <text class="record-location">📍 {{ record.location }}</text>
            <text v-if="record.notes" class="record-notes">📝 {{ record.notes }}</text>
          </view>
          <image v-if="record.photo" :src="record.photo" class="record-photo" mode="aspectFill" />
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🐾</text>
      <text class="empty-text">今天还没有投喂记录哦</text>
      <text class="empty-hint">快开始你的第一次投喂打卡吧！</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { feedingStore } from '@/stores/feeding'
import type { AnimalType } from '@/types'

const LOCATION_STORAGE_KEY = 'pet_location_tags'

const animalOptions = [
  { value: 'cat' as AnimalType, label: '猫咪', icon: '🐱' },
  { value: 'dog' as AnimalType, label: '狗狗', icon: '🐶' },
  { value: 'other' as AnimalType, label: '其他', icon: '🐾' }
]

const defaultLocations = ['小区花园', '楼下便利店', '公园长椅', '停车场入口', '学校后门']
const foodTags = ['猫粮', '狗粮', '火腿肠', '剩饭', '专用罐头', '鸡胸肉', '小鱼干']
const quickNotes = ['吃得很香', '小橘猫很亲人', '今天带了罐头', '喂了三只小猫', '明天还要来']

const locationTags = ref<string[]>([])

const showSuccess = ref(false)
const showAddLocation = ref(false)
const newLocation = ref('')
const isSubmitting = ref(false)

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

const weekday = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})

const formData = reactive({
  location: '',
  animalType: 'cat' as AnimalType,
  food: '',
  photo: '',
  notes: ''
})

const canSubmit = computed(() => {
  return formData.location.trim() !== '' && formData.food.trim() !== ''
})

onMounted(() => {
  loadLocationTags()
})

function loadLocationTags() {
  try {
    const saved = uni.getStorageSync(LOCATION_STORAGE_KEY)
    if (saved) {
      locationTags.value = JSON.parse(saved)
    } else {
      locationTags.value = [...defaultLocations]
    }
  } catch {
    locationTags.value = [...defaultLocations]
  }
}

function saveLocationTags() {
  try {
    uni.setStorageSync(LOCATION_STORAGE_KEY, JSON.stringify(locationTags.value))
  } catch (e) {
    console.warn('Failed to save location tags')
  }
}

const selectLocation = (loc: string) => {
  formData.location = loc
}

const addNewLocation = () => {
  const loc = newLocation.value.trim()
  if (!loc) {
    uni.showToast({ title: '请输入地点名称', icon: 'none' })
    return
  }
  if (locationTags.value.includes(loc)) {
    uni.showToast({ title: '地点已存在', icon: 'none' })
    return
  }
  if (locationTags.value.length >= 10) {
    uni.showToast({ title: '最多添加10个地点', icon: 'none' })
    return
  }
  
  locationTags.value.push(loc)
  saveLocationTags()
  formData.location = loc
  newLocation.value = ''
  showAddLocation.value = false
  
  uni.showToast({ title: '添加成功', icon: 'success' })
}

const selectAnimal = (type: AnimalType) => {
  formData.animalType = type
}

const selectFood = (food: string) => {
  formData.food = food
}

const selectNote = (note: string) => {
  formData.notes = formData.notes === note ? '' : note
}

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.photo = res.tempFilePaths[0]
    }
  })
}

const removePhoto = () => {
  formData.photo = ''
}

const getAnimalIcon = (type: AnimalType): string => {
  const icons: Record<AnimalType, string> = {
    cat: '🐱',
    dog: '🐶',
    other: '🐾'
  }
  return icons[type]
}

const getAnimalLabel = (type: AnimalType): string => {
  const labels: Record<AnimalType, string> = {
    cat: '猫咪',
    dog: '狗狗',
    other: '其他'
  }
  return labels[type]
}

const resetForm = () => {
  formData.location = ''
  formData.animalType = 'cat'
  formData.food = ''
  formData.photo = ''
  formData.notes = ''
}

const submitCheckin = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请选择地点和食物',
      icon: 'none'
    })
    return
  }
  
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    feedingStore.addRecord({
      location: formData.location.trim(),
      animalType: formData.animalType,
      food: formData.food.trim(),
      photo: formData.photo || undefined,
      notes: formData.notes.trim()
    })
    
    showSuccess.value = true
    
  } catch (e) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccess = () => {
  showSuccess.value = false
  resetForm()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f97316 0%, #f5f5f5 30%);
  padding: 32rpx;
  padding-bottom: 180rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.date-section {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #fff;
}

.weekday-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.streak-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 40rpx;
}

.streak-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.streak-text {
  font-size: 24rpx;
  color: #fff;
}

.stats-section {
  margin-bottom: 32rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(249, 115, 22, 0.15);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #f97316;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  height: 64rpx;
  background: #e5e7eb;
}

.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.form-header {
  margin-bottom: 28rpx;
}

.form-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.form-subtitle {
  font-size: 24rpx;
  color: #9ca3af;
}

.quick-section {
  margin-bottom: 28rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  color: #374151;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.section-hint {
  font-size: 22rpx;
  color: #9ca3af;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 16rpx 28rpx;
  background: #f9fafb;
  border-radius: 40rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease-out;
  
  &.active {
    background: #fff7ed;
    border-color: #f97316;
  }
  
  &.add-tag {
    background: #f0fdf4;
    border: 2rpx dashed #10b981;
    
    .tag-text {
      color: #10b981;
    }
    
    &:active {
      background: #dcfce7;
    }
  }
  
  &:active:not(.add-tag) {
    transform: scale(0.98);
  }
}

.tag-text {
  font-size: 26rpx;
  color: #374151;
  
  .active & {
    color: #f97316;
    font-weight: 500;
  }
}

.animal-options {
  display: flex;
  gap: 20rpx;
}

.animal-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  border: 3rpx solid transparent;
  transition: all 0.2s ease-out;
  
  &.active {
    background: #fff7ed;
    border-color: #f97316;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.animal-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.animal-label {
  font-size: 26rpx;
  color: #374151;
}

.photo-section {
  .photo-upload {
    width: 200rpx;
    height: 200rpx;
  }
}

.quick-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.note-chip {
  padding: 12rpx 24rpx;
  background: #f9fafb;
  border-radius: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease-out;
  
  &.active {
    background: #fef3c7;
    border-color: #f59e0b;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.note-text {
  font-size: 24rpx;
  color: #374151;
  
  .active & {
    color: #b45309;
    font-weight: 500;
  }
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.photo-upload {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  background: #f9fafb;
  border: 2rpx dashed #d1d5db;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  font-size: 28rpx;
  color: #fff;
  line-height: 1;
}

.submit-section {
  margin-top: 32rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.disabled {
    opacity: 0.5;
  }
  
  &:active:not(.disabled) {
    opacity: 0.85;
  }
}

.submit-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.submit-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 12rpx;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-content {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.success-message {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 32rpx;
}

.success-info {
  width: 100%;
  background: #f9fafb;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.info-item {
  display: block;
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.success-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.85;
  }
}

.success-btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 560rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #e5e7eb;
}

.modal-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.modal-input {
  margin: 32rpx;
  width: calc(100% - 64rpx);
  height: 88rpx;
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  border-top: 1rpx solid #e5e7eb;
}

.modal-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.cancel {
    border-right: 1rpx solid #e5e7eb;
  }
  
  &.confirm {
    background: #f97316;
  }
  
  &:active {
    opacity: 0.85;
  }
}

.modal-btn-text {
  font-size: 30rpx;
  
  .cancel & {
    color: #6b7280;
  }
  
  .confirm & {
    color: #fff;
    font-weight: 500;
  }
}



.today-records {
  margin-top: 32rpx;
}

.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.records-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f2937;
}

.records-count {
  font-size: 26rpx;
  color: #6b7280;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.record-time {
  flex-shrink: 0;
  width: 100rpx;
}

.time-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #f97316;
}

.record-content {
  flex: 1;
  margin-left: 16rpx;
}

.record-animal {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.animal-type-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.animal-type-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.record-food {
  display: block;
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 4rpx;
}

.record-location {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 4rpx;
}

.record-notes {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
}

.record-photo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 32rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #9ca3af;
}

.mt-16 {
  margin-top: 16rpx;
}
</style>

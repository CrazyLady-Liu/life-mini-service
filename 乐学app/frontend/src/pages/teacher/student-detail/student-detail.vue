<template>
  <view class="student-detail-page">
    <view v-if="profile" class="profile-header">
      <view class="avatar">{{ profile.student?.name?.charAt(0) || '学' }}</view>
      <view class="info">
        <text class="name">{{ profile.student?.name }}</text>
        <text class="meta">{{ profile.grade || '未设置' }}年级 {{ profile.className || '未分班' }}</text>
        <text class="meta">学号: {{ profile.studentNo || '未设置' }}</text>
      </view>
      <view class="score-badge">
        <text class="score">{{ profile.averageScore }}</text>
        <text class="score-label">平均分</text>
      </view>
    </view>

    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'profile' }"
        @click="currentTab = 'profile'"
      >
        档案
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'records' }"
        @click="currentTab = 'records'"
      >
        记录
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'analysis' }"
        @click="goToAnalysis"
      >
        分析报告
      </view>
    </view>

    <view v-if="currentTab === 'profile' && profile" class="tab-content">
      <view class="card">
        <view class="card-title">基本信息</view>
        <view class="info-grid">
          <view class="info-item">
            <text class="label">性别</text>
            <text class="value">{{ profile.gender || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">生日</text>
            <text class="value">{{ profile.birthday || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系电话</text>
            <text class="value">{{ profile.student?.phone || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">监护人</text>
            <text class="value">{{ profile.guardianName || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">监护人电话</text>
            <text class="value">{{ profile.guardianPhone || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">家庭住址</text>
            <text class="value">{{ profile.address || '未设置' }}</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">学习情况</view>
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value">{{ profile.totalHomework }}</text>
            <text class="stat-label">总作业数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ profile.completedHomework }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ Math.floor(profile.totalListeningTime / 60) }}分钟</text>
            <text class="stat-label">听力时长</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">学习特点</view>
        <view class="section">
          <text class="section-label">学习风格</text>
          <text class="section-content">{{ profile.learningStyle || '暂无记录' }}</text>
        </view>
        <view class="section">
          <text class="section-label">优势</text>
          <text class="section-content success">{{ profile.strengths || '暂无记录' }}</text>
        </view>
        <view class="section">
          <text class="section-label">待提升</text>
          <text class="section-content warning">{{ profile.weaknesses || '暂无记录' }}</text>
        </view>
        <view class="section">
          <text class="section-label">健康状况</text>
          <text class="section-content">{{ profile.healthStatus || '暂无记录' }}</text>
        </view>
        <view class="section">
          <text class="section-label">备注</text>
          <text class="section-content">{{ profile.notes || '暂无记录' }}</text>
        </view>
      </view>

      <button class="edit-btn" @click="showEditModal = true">编辑档案</button>
    </view>

    <view v-if="currentTab === 'records'" class="tab-content">
      <view class="record-types">
        <view 
          v-for="type in recordTypes" 
          :key="type.value"
          class="type-btn"
          :class="{ active: recordType === type.value }"
          @click="recordType = type.value; loadRecords()"
        >
          {{ type.label }}
        </view>
      </view>

      <view class="record-list">
        <view v-for="record in records" :key="record.id" class="record-card">
          <view class="record-header">
            <view class="record-type" :class="record.type">
              {{ getRecordTypeLabel(record.type) }}
            </view>
            <text class="record-date">{{ formatDate(record.createdAt) }}</text>
          </view>
          <text class="record-title">{{ record.title }}</text>
          <text class="record-content">{{ record.content }}</text>
          <view v-if="record.score" class="record-score">
            得分: {{ record.score }}分
          </view>
          <text class="record-teacher">记录人: {{ record.teacher?.name }}</text>
        </view>
      </view>

      <view v-if="records.length === 0" class="empty">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无记录</text>
      </view>

      <button class="add-record-btn" @click="showAddRecordModal = true">添加记录</button>
    </view>

    <u-modal v-model="showEditModal" title="编辑档案" width="650">
      <view class="modal-form">
        <u-input v-model="editForm.grade" placeholder="年级" type="number" border="surround"></u-input>
        <u-input v-model="editForm.className" placeholder="班级" border="surround"></u-input>
        <u-input v-model="editForm.studentNo" placeholder="学号" border="surround"></u-input>
        <u-input v-model="editForm.gender" placeholder="性别" border="surround"></u-input>
        <u-input v-model="editForm.guardianName" placeholder="监护人姓名" border="surround"></u-input>
        <u-input v-model="editForm.guardianPhone" placeholder="监护人电话" border="surround"></u-input>
        <u-input v-model="editForm.strengths" placeholder="优势" type="textarea" border="surround"></u-input>
        <u-input v-model="editForm.weaknesses" placeholder="待提升" type="textarea" border="surround"></u-input>
        <u-input v-model="editForm.notes" placeholder="备注" type="textarea" border="surround"></u-input>
        <button class="submit-btn" @click="saveProfile">保存</button>
      </view>
    </u-modal>

    <u-modal v-model="showAddRecordModal" title="添加记录" width="650">
      <view class="modal-form">
        <picker :range="recordTypeOptions" @change="onRecordTypeChange">
          <u-input 
            v-model="addRecordForm.typeLabel" 
            placeholder="选择记录类型" 
            border="surround"
            readonly
          ></u-input>
        </picker>
        <u-input v-model="addRecordForm.title" placeholder="记录标题" border="surround"></u-input>
        <u-input v-model="addRecordForm.content" placeholder="记录内容" type="textarea" border="surround"></u-input>
        <u-input v-model="addRecordForm.score" placeholder="分数（可选）" type="number" border="surround"></u-input>
        <button class="submit-btn" @click="addRecord">保存</button>
      </view>
    </u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { studentApi } from '@/api/student';
import type { StudentProfile, StudentRecord, RecordType } from '@/types';

const studentId = ref('');
const profile = ref<StudentProfile | null>(null);
const currentTab = ref<'profile' | 'records'>('profile');
const records = ref<StudentRecord[]>([]);
const recordType = ref<RecordType | ''>('');
const showEditModal = ref(false);
const showAddRecordModal = ref(false);

const editForm = reactive({
  grade: 1,
  className: '',
  studentNo: '',
  gender: '',
  guardianName: '',
  guardianPhone: '',
  strengths: '',
  weaknesses: '',
  notes: '',
});

const addRecordForm = reactive({
  type: 'academic' as RecordType,
  typeLabel: '学习记录',
  title: '',
  content: '',
  score: undefined as number | undefined,
});

const recordTypes = [
  { label: '全部', value: '' },
  { label: '学习记录', value: 'academic' },
  { label: '行为记录', value: 'behavior' },
  { label: '考勤记录', value: 'attendance' },
  { label: '获奖记录', value: 'award' },
  { label: '其他', value: 'other' },
];

const recordTypeOptions = ['学习记录', '行为记录', '考勤记录', '获奖记录', '其他'];

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  studentId.value = currentPage.options.studentId;
  loadProfile();
  loadRecords();
});

async function loadProfile() {
  try {
    profile.value = await studentApi.getProfile(studentId.value);
    Object.assign(editForm, {
      grade: profile.value.grade || 1,
      className: profile.value.className || '',
      studentNo: profile.value.studentNo || '',
      gender: profile.value.gender || '',
      guardianName: profile.value.guardianName || '',
      guardianPhone: profile.value.guardianPhone || '',
      strengths: profile.value.strengths || '',
      weaknesses: profile.value.weaknesses || '',
      notes: profile.value.notes || '',
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadRecords() {
  try {
    records.value = await studentApi.getStudentRecords(
      studentId.value, 
      recordType.value as RecordType || undefined
    );
  } catch (e) {
    console.error(e);
  }
}

function getRecordTypeLabel(type: string): string {
  const map: Record<string, string> = {
    academic: '学习',
    behavior: '行为',
    attendance: '考勤',
    award: '获奖',
    other: '其他',
  };
  return map[type] || type;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

function onRecordTypeChange(e: any) {
  const index = e.detail.value;
  addRecordForm.typeLabel = recordTypeOptions[index];
  const typeMap = ['academic', 'behavior', 'attendance', 'award', 'other'];
  addRecordForm.type = typeMap[index] as RecordType;
}

async function saveProfile() {
  try {
    await studentApi.updateProfile(studentId.value, editForm);
    showEditModal.value = false;
    loadProfile();
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

async function addRecord() {
  try {
    await studentApi.addRecord({
      studentId: studentId.value,
      type: addRecordForm.type,
      title: addRecordForm.title,
      content: addRecordForm.content,
      score: addRecordForm.score,
    });
    showAddRecordModal.value = false;
    addRecordForm.title = '';
    addRecordForm.content = '';
    addRecordForm.score = undefined;
    loadRecords();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

function goToAnalysis() {
  uni.navigateTo({ 
    url: `/pages/teacher/student-analysis/student-analysis?studentId=${studentId.value}` 
  });
}
</script>

<style lang="scss" scoped>
.student-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  align-items: center;
  color: #fff;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    font-weight: bold;
    margin-right: 24rpx;
  }

  .info {
    flex: 1;

    .name {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 8rpx;
    }

    .meta {
      font-size: 24rpx;
      opacity: 0.9;
      display: block;
      line-height: 1.6;
    }
  }

  .score-badge {
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 20rpx 30rpx;
    border-radius: 16rpx;

    .score {
      font-size: 40rpx;
      font-weight: bold;
      display: block;
    }

    .score-label {
      font-size: 22rpx;
    }
  }
}

.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #eee;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 28rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #667eea;
      font-weight: bold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #667eea;
        border-radius: 2rpx;
      }
    }
  }
}

.tab-content {
  padding: 20rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
    color: #333;
  }
}

.info-grid {
  display: flex;
  flex-wrap: wrap;

  .info-item {
    width: 50%;
    margin-bottom: 20rpx;

    .label {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 4rpx;
    }

    .value {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.stats-row {
  display: flex;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #667eea;
      display: block;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.section {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .section-label {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 8rpx;
  }

  .section-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;

    &.success {
      color: #11998e;
    }

    &.warning {
      color: #f5576c;
    }
  }
}

.edit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 30rpx;
  border: none;
  margin-top: 20rpx;
}

.record-types {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;

  .type-btn {
    padding: 12rpx 28rpx;
    border-radius: 32rpx;
    background: #fff;
    font-size: 26rpx;
    color: #666;
    white-space: nowrap;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.record-list {
  .record-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .record-type {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        background: #f0f0ff;
        color: #667eea;

        &.academic { background: #f0f0ff; color: #667eea; }
        &.behavior { background: #fff7e6; color: #fa8c16; }
        &.attendance { background: #e6fffb; color: #13c2c2; }
        &.award { background: #fff1f0; color: #f5222d; }
        &.other { background: #f6ffed; color: #52c41a; }
      }

      .record-date {
        font-size: 24rpx;
        color: #999;
      }
    }

    .record-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
    }

    .record-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      display: block;
      margin-bottom: 12rpx;
    }

    .record-score {
      font-size: 26rpx;
      color: #11998e;
      font-weight: bold;
      margin-bottom: 8rpx;
    }

    .record-teacher {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.empty {
  text-align: center;
  padding: 80rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 16rpx;
  }

  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

.add-record-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  border-radius: 45rpx;
  font-size: 30rpx;
  border: none;
  margin-top: 20rpx;
}

.modal-form {
  padding: 20rpx 0;

  :deep(.u-input) {
    margin-bottom: 24rpx;
  }
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  margin-top: 20rpx;
}
</style>

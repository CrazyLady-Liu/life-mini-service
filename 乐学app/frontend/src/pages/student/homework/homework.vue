<template>
  <view class="homework-page">
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value; loadHomeworks()"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="homework-list">
      <view 
        v-for="submission in submissions" 
        :key="submission.id"
        class="homework-card"
        @click="viewSubmission(submission)"
      >
        <view class="card-header">
          <text class="homework-title">{{ submission.homework?.title }}</text>
          <view class="status-badge" :class="submission.status">
            {{ getStatusLabel(submission.status) }}
          </view>
        </view>
        <view class="card-meta">
          <view class="meta-item">
            <text class="meta-label">科目</text>
            <text class="meta-value">{{ getTypeLabel(submission.homework?.type) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">难度</text>
            <text class="meta-value" :class="submission.homework?.difficulty">
              {{ getDifficultyLabel(submission.homework?.difficulty) }}
            </text>
          </view>
          <view class="meta-item">
            <text class="meta-label">总分</text>
            <text class="meta-value">{{ submission.homework?.totalScore }}分</text>
          </view>
        </view>
        <view class="card-footer">
          <view class="score-info" v-if="submission.status === 'submitted' || submission.status === 'graded'">
            <text class="score">得分: {{ submission.score }}/{{ submission.totalScore }}</text>
            <text class="accuracy">正确率: {{ submission.accuracy }}%</text>
          </view>
          <view class="action-btn" v-if="submission.status === 'not_started'" @click.stop="startHomework(submission.id)">
            开始答题
          </view>
          <view class="action-btn" v-else-if="submission.status === 'in_progress'" @click.stop="continueHomework(submission.id)">
            继续答题
          </view>
          <u-icon v-else name="arrow-right" size="24" color="#ccc"></u-icon>
        </view>
      </view>
    </view>

    <view v-if="submissions.length === 0" class="empty">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无作业</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { homeworkApi } from '@/api/homework';
import type { HomeworkSubmission, SubmissionStatus } from '@/types';

const currentTab = ref<SubmissionStatus | ''>('');
const submissions = ref<HomeworkSubmission[]>([]);

const tabs = [
  { label: '全部', value: '' },
  { label: '待完成', value: 'not_started' },
  { label: '进行中', value: 'in_progress' },
  { label: '已提交', value: 'submitted' },
  { label: '已批改', value: 'graded' },
];

onMounted(() => {
  loadHomeworks();
});

async function loadHomeworks() {
  try {
    submissions.value = await homeworkApi.getMyHomeworks(
      currentTab.value as SubmissionStatus || undefined
    );
  } catch (e) {
    console.error(e);
  }
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: '待完成',
    in_progress: '进行中',
    submitted: '已提交',
    graded: '已批改',
  };
  return map[status] || status;
}

function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    listening: '听力',
    reading: '阅读',
    writing: '写作',
    speaking: '口语',
    mixed: '综合',
  };
  return map[type || ''] || type || '';
}

function getDifficultyLabel(difficulty?: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return map[difficulty || ''] || difficulty || '';
}

function startHomework(submissionId: string) {
  uni.navigateTo({ 
    url: `/pages/student/homework-do/homework-do?submissionId=${submissionId}` 
  });
}

function continueHomework(submissionId: string) {
  uni.navigateTo({ 
    url: `/pages/student/homework-do/homework-do?submissionId=${submissionId}` 
  });
}

function viewSubmission(submission: HomeworkSubmission) {
  if (submission.status === 'submitted' || submission.status === 'graded') {
    uni.navigateTo({ 
      url: `/pages/student/homework-do/homework-do?submissionId=${submission.id}&view=true` 
    });
  }
}
</script>

<style lang="scss" scoped>
.homework-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;

  .tab-item {
    flex: 1;
    min-width: 140rpx;
    text-align: center;
    padding: 28rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
    white-space: nowrap;

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

.homework-list {
  padding: 20rpx;
}

.homework-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .homework-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
    }

    .status-badge {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      
      &.not_started { background: #fff7e6; color: #fa8c16; }
      &.in_progress { background: #e6f7ff; color: #1890ff; }
      &.submitted { background: #f6ffed; color: #52c41a; }
      &.graded { background: #f9f0ff; color: #722ed1; }
    }
  }

  .card-meta {
    display: flex;
    gap: 40rpx;
    margin-bottom: 20rpx;

    .meta-item {
      .meta-label {
        font-size: 22rpx;
        color: #999;
        display: block;
        margin-bottom: 4rpx;
      }

      .meta-value {
        font-size: 26rpx;
        color: #333;

        &.easy { color: #52c41a; }
        &.medium { color: #fa8c16; }
        &.hard { color: #f5222d; }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;

    .score-info {
      .score {
        font-size: 26rpx;
        color: #11998e;
        font-weight: bold;
        margin-right: 20rpx;
      }

      .accuracy {
        font-size: 24rpx;
        color: #999;
      }
    }

    .action-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 12rpx 28rpx;
      border-radius: 32rpx;
      font-size: 24rpx;
    }
  }
}

.empty {
  text-align: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    font-size: 100rpx;
    display: block;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>

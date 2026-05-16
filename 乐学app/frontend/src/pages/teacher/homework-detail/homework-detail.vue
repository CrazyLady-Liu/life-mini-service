<template>
  <view class="homework-detail-page" v-if="homework">
    <view class="header">
      <text class="title">{{ homework.title }}</text>
      <view class="status-badge" :class="homework.status">
        {{ getStatusLabel(homework.status) }}
      </view>
    </view>

    <view class="info-section">
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">类型</text>
          <text class="info-value">{{ getTypeLabel(homework.type) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">难度</text>
          <text class="info-value" :class="homework.difficulty">{{ getDifficultyLabel(homework.difficulty) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">题目数</text>
          <text class="info-value">{{ homework.questionCount || homework.questions?.length || 0 }}题</text>
        </view>
        <view class="info-item">
          <text class="info-label">总分</text>
          <text class="info-value">{{ homework.totalScore }}分</text>
        </view>
      </view>
      <view class="description" v-if="homework.description">
        {{ homework.description }}
      </view>
    </view>

    <view class="submissions-section">
      <view class="section-header">
        <text class="section-title">提交情况</text>
        <text class="section-stats">{{ submissions.length }}/{{ homework.studentIds?.length || 0 }} 已提交</text>
      </view>

      <view class="submission-list">
        <view 
          v-for="submission in submissions" 
          :key="submission.id"
          class="submission-item"
          @click="viewSubmission(submission)"
        >
          <view class="student-avatar">{{ submission.student?.name?.charAt(0) || '学' }}</view>
          <view class="student-info">
            <text class="student-name">{{ submission.student?.name }}</text>
            <text class="submit-time" v-if="submission.submittedAt">
              提交于 {{ formatDate(submission.submittedAt) }}
            </text>
            <text class="submit-time not-submitted" v-else>未提交</text>
          </view>
          <view class="score-info">
            <text class="score" v-if="submission.status === 'submitted' || submission.status === 'graded'">
              {{ submission.score }}/{{ submission.totalScore }}
            </text>
            <view class="status-tag" :class="submission.status">
              {{ getSubmissionStatusLabel(submission.status) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="questions-section" v-if="homework.questions?.length">
      <view class="section-header">
        <text class="section-title">题目预览</text>
      </view>
      <view 
        v-for="(question, index) in homework.questions" 
        :key="question.id"
        class="question-preview"
      >
        <view class="question-number">{{ index + 1 }}</view>
        <view class="question-content">
          <text class="question-text">{{ question.content }}</text>
          <text class="question-answer">答案: {{ Array.isArray(question.answer) ? question.answer.join(', ') : question.answer }}</text>
        </view>
        <view class="question-score">{{ question.score }}分</view>
      </view>
    </view>

    <view class="action-bar" v-if="homework.status === 'draft'">
      <button class="btn-secondary" @click="deleteHomework">删除</button>
      <button class="btn-primary" @click="publishHomework">发布作业</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { homeworkApi } from '@/api/homework';
import type { Homework, HomeworkSubmission } from '@/types';

const homeworkId = ref('');
const homework = ref<Homework | null>(null);
const submissions = ref<HomeworkSubmission[]>([]);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  homeworkId.value = currentPage.options.id;
  loadData();
});

async function loadData() {
  try {
    homework.value = await homeworkApi.getDetail(homeworkId.value);
    submissions.value = await homeworkApi.getHomeworkSubmissions(homeworkId.value);
  } catch (e) {
    console.error(e);
  }
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    closed: '已关闭',
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

function getSubmissionStatusLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    submitted: '已提交',
    graded: '已批改',
  };
  return map[status] || status;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN');
}

function viewSubmission(submission: HomeworkSubmission) {
  if (submission.status === 'submitted' || submission.status === 'graded') {
    uni.navigateTo({ 
      url: `/pages/student/homework-do/homework-do?submissionId=${submission.id}&view=true` 
    });
  }
}

async function publishHomework() {
  uni.showModal({
    title: '确认发布',
    content: '确定要发布这份作业吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await homeworkApi.publish(homeworkId.value);
          loadData();
          uni.showToast({ title: '发布成功', icon: 'success' });
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}

async function deleteHomework() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这份作业吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await homeworkApi.delete(homeworkId.value);
          uni.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.homework-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 40rpx;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    flex: 1;
  }

  .status-badge {
    font-size: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.2);
  }
}

.info-section {
  margin: -30rpx 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .info-item {
      width: calc(50% - 10rpx);

      .info-label {
        font-size: 22rpx;
        color: #999;
        display: block;
        margin-bottom: 4rpx;
      }

      .info-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;

        &.easy { color: #52c41a; }
        &.medium { color: #fa8c16; }
        &.hard { color: #f5222d; }
      }
    }
  }

  .description {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;
  }
}

.submissions-section, .questions-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .section-stats {
      font-size: 24rpx;
      color: #667eea;
    }
  }
}

.submission-list {
  .submission-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .student-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      font-weight: bold;
      margin-right: 20rpx;
    }

    .student-info {
      flex: 1;

      .student-name {
        font-size: 28rpx;
        color: #333;
        display: block;
        margin-bottom: 4rpx;
      }

      .submit-time {
        font-size: 22rpx;
        color: #999;

        &.not-submitted {
          color: #fa8c16;
        }
      }
    }

    .score-info {
      text-align: right;

      .score {
        font-size: 28rpx;
        color: #11998e;
        font-weight: bold;
        display: block;
        margin-bottom: 4rpx;
      }

      .status-tag {
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.not_started { background: #fff7e6; color: #fa8c16; }
        &.in_progress { background: #e6f7ff; color: #1890ff; }
        &.submitted { background: #f6ffed; color: #52c41a; }
        &.graded { background: #f9f0ff; color: #722ed1; }
      }
    }
  }
}

.question-preview {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .question-number {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #667eea;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .question-content {
    flex: 1;

    .question-text {
      font-size: 26rpx;
      color: #333;
      line-height: 1.6;
      display: block;
      margin-bottom: 8rpx;
    }

    .question-answer {
      font-size: 22rpx;
      color: #11998e;
    }
  }

  .question-score {
    font-size: 24rpx;
    color: #fa8c16;
    font-weight: bold;
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

  .btn-secondary {
    flex: 1;
    height: 90rpx;
    background: #fff1f0;
    color: #f5222d;
    border-radius: 45rpx;
    font-size: 30rpx;
    border: none;
  }

  .btn-primary {
    flex: 2;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 45rpx;
    font-size: 30rpx;
    border: none;
  }
}
</style>

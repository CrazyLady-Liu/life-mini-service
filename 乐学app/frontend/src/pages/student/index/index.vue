<template>
  <view class="student-home">
    <view class="header">
      <view class="user-info">
        <view class="avatar">👨‍🎓</view>
        <view class="info">
          <text class="greeting">{{ greeting }}，{{ userStore.userInfo?.name || '同学' }}</text>
          <text class="subtitle">今天也要加油哦！</text>
        </view>
      </view>
    </view>

    <view class="stats-cards">
      <view class="stat-card primary">
        <view class="stat-icon">📝</view>
        <view class="stat-content">
          <text class="stat-value">{{ myAnalysis?.homeworkStats?.totalAssigned || 0 }}</text>
          <text class="stat-label">待完成作业</text>
        </view>
      </view>
      <view class="stat-card success">
        <view class="stat-icon">🎧</view>
        <view class="stat-content">
          <text class="stat-value">{{ myAnalysis?.listeningStats?.totalPractices || 0 }}</text>
          <text class="stat-label">听力练习</text>
        </view>
      </view>
      <view class="stat-card warning">
        <view class="stat-icon">⭐</view>
        <view class="stat-content">
          <text class="stat-value">{{ myAnalysis?.overallScore || 0 }}</text>
          <text class="stat-label">综合评分</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">快捷入口</text>
      </view>
      <view class="quick-actions">
        <view class="action-item" @click="goTo('/pages/student/homework/homework')">
          <view class="action-icon">📚</view>
          <text class="action-label">作业中心</text>
        </view>
        <view class="action-item" @click="goTo('/pages/student/listening/listening')">
          <view class="action-icon">🎧</view>
          <text class="action-label">听力训练</text>
        </view>
        <view class="action-item" @click="goTo('/pages/student/analysis/analysis')">
          <view class="action-icon">📊</view>
          <text class="action-label">我的成绩</text>
        </view>
        <view class="action-item" @click="goTo('/pages/profile/profile')">
          <view class="action-icon">👤</view>
          <text class="action-label">个人中心</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">待完成作业</text>
        <text class="section-more" @click="goTo('/pages/student/homework/homework')">全部</text>
      </view>
      <view class="homework-list">
        <view 
          v-for="submission in pendingHomework.slice(0, 3)" 
          :key="submission.id"
          class="homework-item"
          @click="doHomework(submission.id)"
        >
          <view class="homework-icon">📋</view>
          <view class="homework-info">
            <text class="homework-title">{{ submission.homework?.title }}</text>
            <view class="homework-meta">
              <text class="meta-tag">{{ getTypeLabel(submission.homework?.type) }}</text>
              <text class="meta-tag" :class="submission.homework?.difficulty">
                {{ getDifficultyLabel(submission.homework?.difficulty) }}
              </text>
              <text class="meta-score">{{ submission.homework?.totalScore }}分</text>
            </view>
          </view>
          <u-icon name="arrow-right" size="24" color="#ccc"></u-icon>
        </view>
      </view>
      <view v-if="pendingHomework.length === 0" class="empty-list">
        <text>暂无待完成作业 🎉</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">学习建议</text>
      </view>
      <view class="suggestion-card">
        <view class="suggestion-item" v-if="myAnalysis?.strengths?.length">
          <text class="suggestion-title success">✨ 继续保持</text>
          <text class="suggestion-text">{{ myAnalysis.strengths[0] }}</text>
        </view>
        <view class="suggestion-item" v-if="myAnalysis?.weaknesses?.length">
          <text class="suggestion-title warning">💪 需要加强</text>
          <text class="suggestion-text">{{ myAnalysis.weaknesses[0] }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { homeworkApi, analysisApi } from '@/api';
import type { HomeworkSubmission, StudentAnalysis } from '@/types';

const userStore = useUserStore();
const pendingHomework = ref<HomeworkSubmission[]>([]);
const myAnalysis = ref<StudentAnalysis | null>(null);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    const [homeworks, analysis] = await Promise.all([
      homeworkApi.getMyHomeworks('not_started' as any),
      analysisApi.getMyAnalysis(),
    ]);
    pendingHomework.value = homeworks;
    myAnalysis.value = analysis;
  } catch (e) {
    console.error(e);
  }
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

function goTo(url: string) {
  uni.navigateTo({ url });
}

function doHomework(submissionId: string) {
  uni.navigateTo({ 
    url: `/pages/student/homework-do/homework-do?submissionId=${submissionId}` 
  });
}
</script>

<style lang="scss" scoped>
.student-home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 100rpx;
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48rpx;
      margin-right: 24rpx;
    }

    .info {
      .greeting {
        font-size: 36rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 8rpx;
      }

      .subtitle {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

.stats-cards {
  display: flex;
  margin: -60rpx 20rpx 0;
  gap: 12rpx;

  .stat-card {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

    &.primary .stat-icon { background: #e6f7ff; }
    &.success .stat-icon { background: #f6ffed; }
    &.warning .stat-icon { background: #fff7e6; }

    .stat-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-bottom: 12rpx;
    }

    .stat-content {
      .stat-value {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 4rpx;
      }

      .stat-label {
        font-size: 20rpx;
        color: #999;
      }
    }
  }
}

.section {
  margin: 24rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;

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

    .section-more {
      font-size: 24rpx;
      color: #667eea;
    }
  }
}

.quick-actions {
  display: flex;
  justify-content: space-between;

  .action-item {
    text-align: center;

    .action-icon {
      width: 96rpx;
      height: 96rpx;
      border-radius: 24rpx;
      background: linear-gradient(135deg, #f0f0ff 0%, #e6e6ff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin: 0 auto 12rpx;
    }

    .action-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.homework-list {
  .homework-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .homework-icon {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
      background: #fff7e6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 20rpx;
    }

    .homework-info {
      flex: 1;

      .homework-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        display: block;
        margin-bottom: 8rpx;
      }

      .homework-meta {
        display: flex;
        gap: 12rpx;
        align-items: center;

        .meta-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          background: #f0f0f0;
          color: #666;

          &.easy { background: #f6ffed; color: #52c41a; }
          &.medium { background: #fff7e6; color: #fa8c16; }
          &.hard { background: #fff1f0; color: #f5222d; }
        }

        .meta-score {
          font-size: 20rpx;
          color: #667eea;
        }
      }
    }
  }
}

.empty-list {
  text-align: center;
  padding: 40rpx;
  font-size: 26rpx;
  color: #999;
}

.suggestion-card {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;

  .suggestion-item {
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .suggestion-title {
      font-size: 26rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 8rpx;

      &.success { color: #52c41a; }
      &.warning { color: #fa8c16; }
    }

    .suggestion-text {
      font-size: 24rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>

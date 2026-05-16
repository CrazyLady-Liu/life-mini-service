<template>
  <view class="student-analysis-page">
    <view class="header">
      <view class="user-info">
        <view class="avatar">{{ analysis?.studentName?.charAt(0) || '学' }}</view>
        <view class="info">
          <text class="name">{{ analysis?.studentName }}</text>
          <text class="subtitle">学习分析报告</text>
        </view>
      </view>
      <view class="overall-score">
        <text class="score-value">{{ analysis?.overallScore || 0 }}</text>
        <text class="score-label">综合评分</text>
      </view>
    </view>

    <view v-if="analysis" class="content">
      <view class="improvement-card" :class="analysis.improvement.trend">
        <view class="trend-icon">
          {{ analysis.improvement.trend === 'up' ? '📈' : analysis.improvement.trend === 'down' ? '📉' : '➡️' }}
        </view>
        <view class="trend-info">
          <text class="trend-title">
            {{ analysis.improvement.trend === 'up' ? '进步明显' : analysis.improvement.trend === 'down' ? '有所下滑' : '保持稳定' }}
          </text>
          <text class="trend-desc">
            本周平均{{ analysis.improvement.thisWeekAvg }}分，较上周{{ analysis.improvement.changePercent >= 0 ? '+' : '' }}{{ analysis.improvement.changePercent }}%
          </text>
        </view>
      </view>

      <view class="section success">
        <view class="section-header">
          <text class="section-icon">✨</text>
          <text class="section-title">学习亮点</text>
        </view>
        <view class="strength-list">
          <view v-for="(item, index) in analysis.strengths" :key="index" class="strength-item">
            <text class="check-icon">✓</text>
            <text class="strength-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="section warning">
        <view class="section-header">
          <text class="section-icon">💪</text>
          <text class="section-title">待提升</text>
        </view>
        <view class="weakness-list">
          <view v-for="(item, index) in analysis.weaknesses" :key="index" class="weakness-item">
            <text class="tip-icon">!</text>
            <text class="weakness-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-icon">📝</text>
          <text class="section-title">作业情况</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ analysis.homeworkStats.totalAssigned }}</text>
            <text class="stat-label">总作业数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ analysis.homeworkStats.completed }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ analysis.homeworkStats.completionRate }}%</text>
            <text class="stat-label">完成率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ analysis.homeworkStats.averageScore }}分</text>
            <text class="stat-label">平均分</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-icon">🎧</text>
          <text class="section-title">听力情况</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ analysis.listeningStats.totalPractices }}</text>
            <text class="stat-label">练习次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ Math.floor(analysis.listeningStats.totalListenTime / 60) }}分钟</text>
            <text class="stat-label">总时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ analysis.listeningStats.averageScore }}分</text>
            <text class="stat-label">平均分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ analysis.listeningStats.averagePlaybackSpeed }}x</text>
            <text class="stat-label">平均语速</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-icon">📅</text>
          <text class="section-title">最近活动</text>
        </view>
        <view class="activity-list">
          <view 
            v-for="activity in analysis.recentActivity.slice(0, 5)" 
            :key="activity.id"
            class="activity-item"
          >
            <view class="activity-icon">
              {{ activity.type === 'homework' ? '📝' : activity.type === 'listening' ? '🎧' : '📌' }}
            </view>
            <view class="activity-content">
              <text class="activity-title">{{ activity.title }}</text>
              <text class="activity-time">{{ formatDate(activity.date) }}</text>
            </view>
            <view class="activity-score" v-if="activity.score !== undefined">
              {{ activity.score }}分
            </view>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button class="btn-secondary" @click="goToProfile">查看档案</button>
        <button class="btn-primary" @click="addRecord">添加记录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { analysisApi } from '@/api/analysis';
import type { StudentAnalysis } from '@/types';

const studentId = ref('');
const analysis = ref<StudentAnalysis | null>(null);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  studentId.value = currentPage.options.studentId;
  loadAnalysis();
});

async function loadAnalysis() {
  try {
    analysis.value = await analysisApi.getStudentAnalysis(studentId.value);
  } catch (e) {
    console.error(e);
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

function goToProfile() {
  uni.navigateTo({ 
    url: `/pages/teacher/student-detail/student-detail?studentId=${studentId.value}` 
  });
}

function addRecord() {
  uni.navigateTo({ 
    url: `/pages/teacher/student-detail/student-detail?studentId=${studentId.value}&tab=records` 
  });
}
</script>

<style lang="scss" scoped>
.student-analysis-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50rpx 40rpx 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
      font-size: 40rpx;
      font-weight: bold;
      margin-right: 20rpx;
    }

    .info {
      .name {
        font-size: 36rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 4rpx;
      }

      .subtitle {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }

  .overall-score {
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 20rpx 30rpx;
    border-radius: 16rpx;

    .score-value {
      font-size: 48rpx;
      font-weight: bold;
      display: block;
    }

    .score-label {
      font-size: 22rpx;
    }
  }
}

.content {
  margin-top: -40rpx;
  padding: 0 20rpx;
}

.improvement-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  border-left: 8rpx solid #52c41a;

  &.up {
    border-left-color: #52c41a;
  }

  &.down {
    border-left-color: #f5222d;
  }

  &.stable {
    border-left-color: #faad14;
  }

  .trend-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
  }

  .trend-info {
    flex: 1;

    .trend-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 4rpx;
    }

    .trend-desc {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  &.success {
    background: #f6ffed;
  }

  &.warning {
    background: #fffbe6;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .section-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.strength-list, .weakness-list {
  .strength-item, .weakness-item {
    display: flex;
    align-items: flex-start;
    padding: 12rpx 0;

    .check-icon {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      background: #52c41a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .tip-icon {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      background: #faad14;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .strength-text, .weakness-text {
      font-size: 26rpx;
      color: #333;
      line-height: 1.6;
    }
  }
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .stat-item {
    width: calc(50% - 10rpx);
    background: #fafafa;
    border-radius: 12rpx;
    padding: 24rpx;
    text-align: center;

    .stat-value {
      font-size: 32rpx;
      font-weight: bold;
      color: #667eea;
      display: block;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.activity-list {
  .activity-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    .activity-content {
      flex: 1;

      .activity-title {
        font-size: 28rpx;
        color: #333;
        display: block;
        margin-bottom: 4rpx;
      }

      .activity-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .activity-score {
      font-size: 28rpx;
      color: #11998e;
      font-weight: bold;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;

  .btn-secondary {
    flex: 1;
    height: 88rpx;
    background: #f5f5f5;
    color: #666;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;
  }

  .btn-primary {
    flex: 1;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;
  }
}
</style>

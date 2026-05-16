<template>
  <view class="analysis-page">
    <view class="header">
      <text class="title">我的成绩</text>
      <text class="subtitle">查看学习情况</text>
    </view>

    <view v-if="myAnalysis" class="content">
      <view class="overview-card">
        <view class="score-ring">
          <view class="score-value">{{ myAnalysis.overallScore }}</view>
          <view class="score-label">综合评分</view>
        </view>
        <view class="improvement" :class="myAnalysis.improvement.trend">
          <text class="trend-icon">
            {{ myAnalysis.improvement.trend === 'up' ? '📈' : myAnalysis.improvement.trend === 'down' ? '📉' : '➡️' }}
          </text>
          <text class="trend-text">
            本周{{ myAnalysis.improvement.trend === 'up' ? '进步' : myAnalysis.improvement.trend === 'down' ? '退步' : '持平' }}
            {{ myAnalysis.improvement.changePercent >= 0 ? '+' : '' }}{{ myAnalysis.improvement.changePercent }}%
          </text>
        </view>
      </view>

      <view class="section success">
        <view class="section-title">✨ 我的优势</view>
        <view class="item-list">
          <view v-for="(item, index) in myAnalysis.strengths" :key="index" class="item">
            <text class="item-icon">✓</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="section warning">
        <view class="section-title">💪 需要加强</view>
        <view class="item-list">
          <view v-for="(item, index) in myAnalysis.weaknesses" :key="index" class="item">
            <text class="item-icon warning">!</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">📝 作业统计</view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.homeworkStats.totalAssigned }}</text>
            <text class="stat-label">总作业</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.homeworkStats.completed }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.homeworkStats.completionRate }}%</text>
            <text class="stat-label">完成率</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.homeworkStats.averageScore }}</text>
            <text class="stat-label">平均分</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">🎧 听力统计</view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.listeningStats.totalPractices }}</text>
            <text class="stat-label">练习次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ Math.floor(myAnalysis.listeningStats.totalListenTime / 60) }}分钟</text>
            <text class="stat-label">总时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.listeningStats.averageScore }}</text>
            <text class="stat-label">平均分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ myAnalysis.listeningStats.averagePlaybackSpeed }}x</text>
            <text class="stat-label">平均语速</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">📅 最近活动</view>
        <view class="activity-list">
          <view 
            v-for="activity in myAnalysis.recentActivity.slice(0, 8)" 
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
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { analysisApi } from '@/api/analysis';
import type { StudentAnalysis } from '@/types';

const myAnalysis = ref<StudentAnalysis | null>(null);

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    myAnalysis.value = await analysisApi.getMyAnalysis();
  } catch (e) {
    console.error(e);
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}
</script>

<style lang="scss" scoped>
.analysis-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 100rpx;
  color: #fff;

  .title {
    font-size: 40rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 8rpx;
  }

  .subtitle {
    font-size: 26rpx;
    opacity: 0.9;
  }
}

.content {
  margin-top: -60rpx;
  padding: 0 20rpx;
}

.overview-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .score-ring {
    text-align: center;

    .score-value {
      font-size: 64rpx;
      font-weight: bold;
      color: #667eea;
      line-height: 1;
    }

    .score-label {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .improvement {
    text-align: center;
    padding: 20rpx 30rpx;
    border-radius: 16rpx;

    &.up {
      background: #f6ffed;
      .trend-text { color: #52c41a; }
    }
    &.down {
      background: #fff1f0;
      .trend-text { color: #f5222d; }
    }
    &.stable {
      background: #fff7e6;
      .trend-text { color: #faad14; }
    }

    .trend-icon {
      font-size: 40rpx;
      display: block;
      margin-bottom: 8rpx;
    }

    .trend-text {
      font-size: 24rpx;
      font-weight: bold;
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

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.item-list {
  .item {
    display: flex;
    align-items: flex-start;
    padding: 12rpx 0;

    .item-icon {
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

      &.warning {
        background: #faad14;
      }
    }

    .item-text {
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
    padding: 16rpx 0;
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
</style>

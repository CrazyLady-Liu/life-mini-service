<template>
  <view class="analysis-page">
    <view class="header">
      <text class="title">班级分析</text>
      <text class="subtitle">全面了解学生学习情况</text>
    </view>

    <view v-if="classAnalysis" class="content">
      <view class="stats-overview">
        <view class="stat-card">
          <view class="stat-icon">👥</view>
          <view class="stat-info">
            <text class="stat-value">{{ classAnalysis.totalStudents }}</text>
            <text class="stat-label">学生总数</text>
          </view>
        </view>
        <view class="stat-card">
          <view class="stat-icon">📊</view>
          <view class="stat-info">
            <text class="stat-value">{{ classAnalysis.averageScore }}分</text>
            <text class="stat-label">班级平均分</text>
          </view>
        </view>
        <view class="stat-card">
          <view class="stat-icon">✅</view>
          <view class="stat-info">
            <text class="stat-value">{{ classAnalysis.homeworkCompletionRate }}%</text>
            <text class="stat-label">作业完成率</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">学科表现</view>
        <view class="subject-chart">
          <view 
            v-for="(score, subject) in classAnalysis.subjectPerformance" 
            :key="subject"
            class="subject-item"
          >
            <text class="subject-name">{{ getSubjectLabel(subject) }}</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: score + '%' }"></view>
            </view>
            <text class="subject-score">{{ score }}分</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">周进步趋势</view>
        <view class="weekly-chart">
          <view 
            v-for="item in classAnalysis.weeklyProgress" 
            :key="item.date"
            class="weekly-item"
          >
            <view class="bar-container">
              <view 
                class="bar" 
                :style="{ height: (item.avgScore || 30) + '%' }"
              ></view>
            </view>
            <text class="bar-label">{{ item.date }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-title">
          优秀学生
          <text class="section-more" @click="goToStudents">查看全部</text>
        </view>
        <view class="student-rank">
          <view 
            v-for="(student, index) in classAnalysis.topStudents" 
            :key="student.id"
            class="rank-item"
            @click="viewStudentDetail(student.id)"
          >
            <view class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</view>
            <view class="student-avatar">{{ student.name.charAt(0) }}</view>
            <text class="student-name">{{ student.name }}</text>
            <text class="student-score">{{ student.score }}分</text>
          </view>
        </view>
      </view>

      <view class="section warning">
        <view class="section-title">
          待关注学生
          <text class="section-more" @click="goToStudents">查看全部</text>
        </view>
        <view class="student-rank">
          <view 
            v-for="student in classAnalysis.strugglingStudents" 
            :key="student.id"
            class="rank-item warning"
            @click="viewStudentDetail(student.id)"
          >
            <view class="rank-badge warning">!</view>
            <view class="student-avatar warning">{{ student.name.charAt(0) }}</view>
            <text class="student-name">{{ student.name }}</text>
            <text class="student-score warning">{{ student.score }}分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { analysisApi } from '@/api/analysis';
import type { ClassAnalysis } from '@/types';

const classAnalysis = ref<ClassAnalysis | null>(null);

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    classAnalysis.value = await analysisApi.getClassAnalysis();
  } catch (e) {
    console.error(e);
  }
}

function getSubjectLabel(subject: string): string {
  const map: Record<string, string> = {
    listening: '听力',
    reading: '阅读',
    writing: '写作',
    speaking: '口语',
    mixed: '综合',
  };
  return map[subject] || subject;
}

function goToStudents() {
  uni.switchTab({ url: '/pages/teacher/students/students' });
}

function viewStudentDetail(studentId: string) {
  uni.navigateTo({ 
    url: `/pages/teacher/student-analysis/student-analysis?studentId=${studentId}` 
  });
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
  padding: 60rpx 40rpx;
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
  margin-top: -30rpx;
  padding: 0 20rpx;
}

.stats-overview {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;

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

    .stat-icon {
      font-size: 40rpx;
      margin-bottom: 12rpx;
    }

    .stat-info {
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
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  &.warning {
    background: #fffbfb;
  }

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-more {
      font-size: 24rpx;
      color: #667eea;
      font-weight: normal;
    }
  }
}

.subject-chart {
  .subject-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .subject-name {
      width: 80rpx;
      font-size: 26rpx;
      color: #666;
    }

    .progress-bar {
      flex: 1;
      height: 16rpx;
      background: #f0f0f0;
      border-radius: 8rpx;
      margin: 0 16rpx;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 8rpx;
        transition: width 0.3s ease;
      }
    }

    .subject-score {
      width: 80rpx;
      font-size: 26rpx;
      color: #333;
      font-weight: bold;
      text-align: right;
    }
  }
}

.weekly-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200rpx;
  padding: 20rpx 0;

  .weekly-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .bar-container {
      height: 150rpx;
      width: 40rpx;
      display: flex;
      align-items: flex-end;
      justify-content: center;

      .bar {
        width: 100%;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 8rpx 8rpx 0 0;
        min-height: 10rpx;
        transition: height 0.5s ease;
      }
    }

    .bar-label {
      font-size: 22rpx;
      color: #999;
      margin-top: 12rpx;
    }
  }
}

.student-rank {
  .rank-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .rank-badge {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: bold;
      color: #666;
      margin-right: 20rpx;

      &.rank-1 { background: #ffd700; color: #fff; }
      &.rank-2 { background: #c0c0c0; color: #fff; }
      &.rank-3 { background: #cd7f32; color: #fff; }

      &.warning {
        background: #fff0f0;
        color: #f5222d;
      }
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

      &.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    .student-name {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .student-score {
      font-size: 28rpx;
      color: #11998e;
      font-weight: bold;

      &.warning {
        color: #f5222d;
      }
    }
  }
}
</style>

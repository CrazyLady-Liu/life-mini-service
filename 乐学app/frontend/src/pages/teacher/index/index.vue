<template>
  <view class="teacher-home">
    <view class="header">
      <view class="user-info">
        <view class="avatar">👨‍🏫</view>
        <view class="info">
          <text class="name">{{ userStore.userInfo?.name || '老师' }}</text>
          <text class="role">教师端</text>
        </view>
      </view>
    </view>

    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-value">{{ classAnalysis?.totalStudents || 0 }}</text>
        <text class="stat-label">学生总数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ classAnalysis?.averageScore || 0 }}分</text>
        <text class="stat-label">平均成绩</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ classAnalysis?.homeworkCompletionRate || 0 }}%</text>
        <text class="stat-label">作业完成率</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">快捷操作</text>
      </view>
      <view class="quick-actions">
        <view class="action-item" @click="goTo('/pages/teacher/students/students')">
          <view class="action-icon">👥</view>
          <text class="action-label">学生管理</text>
        </view>
        <view class="action-item" @click="goTo('/pages/teacher/homework-create/homework-create')">
          <view class="action-icon">📝</view>
          <text class="action-label">发布作业</text>
        </view>
        <view class="action-item" @click="goTo('/pages/teacher/listening/listening')">
          <view class="action-icon">🎧</view>
          <text class="action-label">听力材料</text>
        </view>
        <view class="action-item" @click="goTo('/pages/teacher/analysis/analysis')">
          <view class="action-icon">📊</view>
          <text class="action-label">学习分析</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">优秀学生</text>
        <text class="section-more" @click="goTo('/pages/teacher/students/students')">查看全部</text>
      </view>
      <view class="top-students">
        <view 
          v-for="(student, index) in (classAnalysis?.topStudents || []).slice(0, 3)" 
          :key="student.id"
          class="student-item"
          @click="viewStudentDetail(student.id)"
        >
          <view class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</view>
          <view class="student-avatar">{{ student.name.charAt(0) }}</view>
          <view class="student-info">
            <text class="student-name">{{ student.name }}</text>
            <text class="student-score">{{ student.score }}分</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">待关注学生</text>
      </view>
      <view class="struggling-students">
        <view 
          v-for="student in (classAnalysis?.strugglingStudents || []).slice(0, 3)" 
          :key="student.id"
          class="student-item warning"
          @click="viewStudentDetail(student.id)"
        >
          <view class="student-avatar warning">{{ student.name.charAt(0) }}</view>
          <view class="student-info">
            <text class="student-name">{{ student.name }}</text>
            <text class="student-score warning">{{ student.score }}分</text>
          </view>
          <text class="attention-tag">需关注</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { analysisApi } from '@/api/analysis';
import type { ClassAnalysis } from '@/types';

const userStore = useUserStore();
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

function goTo(url: string) {
  uni.navigateTo({ url });
}

function viewStudentDetail(studentId: string) {
  uni.navigateTo({ 
    url: `/pages/teacher/student-analysis/student-analysis?studentId=${studentId}` 
  });
}
</script>

<style lang="scss" scoped>
.teacher-home {
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
      .name {
        font-size: 36rpx;
        font-weight: bold;
        display: block;
      }

      .role {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

.stats-cards {
  display: flex;
  margin: -60rpx 20rpx 0;
  gap: 16rpx;

  .stat-card {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

    .stat-value {
      font-size: 36rpx;
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

.section {
  margin: 30rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .section-more {
      font-size: 26rpx;
      color: #667eea;
    }
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .action-item {
    width: calc(25% - 15rpx);
    text-align: center;

    .action-icon {
      width: 100rpx;
      height: 100rpx;
      border-radius: 24rpx;
      background: #f0f0ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 44rpx;
      margin: 0 auto 12rpx;
    }

    .action-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.top-students, .struggling-students {
  .student-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .rank {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      font-weight: bold;
      margin-right: 20rpx;

      &.rank-1 { background: #ffd700; color: #fff; }
      &.rank-2 { background: #c0c0c0; color: #fff; }
      &.rank-3 { background: #cd7f32; color: #fff; }
    }

    .student-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: bold;
      margin-right: 20rpx;

      &.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    .student-info {
      flex: 1;

      .student-name {
        font-size: 28rpx;
        color: #333;
        display: block;
      }

      .student-score {
        font-size: 24rpx;
        color: #11998e;
        font-weight: bold;

        &.warning {
          color: #f5576c;
        }
      }
    }

    .attention-tag {
      font-size: 22rpx;
      color: #f5576c;
      background: #fff0f0;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
    }
  }
}
</style>

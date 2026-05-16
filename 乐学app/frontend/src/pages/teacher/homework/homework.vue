<template>
  <view class="homework-page">
    <view class="header">
      <text class="title">作业管理</text>
      <view class="create-btn" @click="goCreate">
        <u-icon name="plus" size="24" color="#fff"></u-icon>
        <text>创建作业</text>
      </view>
    </view>

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
        v-for="homework in homeworks" 
        :key="homework.id"
        class="homework-card"
        @click="viewDetail(homework.id)"
      >
        <view class="card-header">
          <text class="homework-title">{{ homework.title }}</text>
          <view class="status-badge" :class="homework.status">
            {{ getStatusLabel(homework.status) }}
          </view>
        </view>
        <view class="card-meta">
          <view class="meta-item">
            <text class="meta-label">类型</text>
            <text class="meta-value">{{ getTypeLabel(homework.type) }}</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">难度</text>
            <text class="meta-value" :class="homework.difficulty">
              {{ getDifficultyLabel(homework.difficulty) }}
            </text>
          </view>
          <view class="meta-item">
            <text class="meta-label">题目数</text>
            <text class="meta-value">{{ homework.questionCount || homework.questions?.length || 0 }}题</text>
          </view>
          <view class="meta-item">
            <text class="meta-label">总分</text>
            <text class="meta-value">{{ homework.totalScore }}分</text>
          </view>
        </view>
        <view class="card-footer">
          <text class="create-time">创建于 {{ formatDate(homework.createdAt) }}</text>
          <u-icon name="arrow-right" size="28" color="#ccc"></u-icon>
        </view>
      </view>
    </view>

    <view v-if="homeworks.length === 0" class="empty">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无作业</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { homeworkApi } from '@/api/homework';
import type { Homework, HomeworkStatus, HomeworkType, DifficultyLevel } from '@/types';

const currentTab = ref<HomeworkStatus | ''>('');
const homeworks = ref<Homework[]>([]);

const tabs = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已关闭', value: 'closed' },
];

onMounted(() => {
  loadHomeworks();
});

async function loadHomeworks() {
  try {
    homeworks.value = await homeworkApi.getList(
      currentTab.value as HomeworkStatus || undefined
    );
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

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    listening: '听力',
    reading: '阅读',
    writing: '写作',
    speaking: '口语',
    mixed: '综合',
  };
  return map[type] || type;
}

function getDifficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return map[difficulty] || difficulty;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN');
}

function goCreate() {
  uni.navigateTo({ url: '/pages/teacher/homework-create/homework-create' });
}

function viewDetail(id: string) {
  uni.navigateTo({ 
    url: `/pages/teacher/homework-detail/homework-detail?id=${id}` 
  });
}
</script>

<style lang="scss" scoped>
.homework-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 16rpx 28rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
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
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      flex: 1;
    }

    .status-badge {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      
      &.draft { background: #f5f5f5; color: #999; }
      &.published { background: #e6fffb; color: #13c2c2; }
      &.closed { background: #fff1f0; color: #f5222d; }
    }
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 30rpx;
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
        font-weight: 500;

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

    .create-time {
      font-size: 24rpx;
      color: #999;
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

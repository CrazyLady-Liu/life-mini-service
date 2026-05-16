<template>
  <view class="listening-page">
    <view class="header">
      <text class="title">听力训练</text>
      <text class="subtitle">提升听力水平</text>
    </view>

    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ myAnalysis?.listeningStats?.totalPractices || 0 }}</text>
        <text class="stat-label">练习次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ Math.floor((myAnalysis?.listeningStats?.totalListenTime || 0) / 60) }}分钟</text>
        <text class="stat-label">总时长</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ myAnalysis?.listeningStats?.averageScore || 0 }}分</text>
        <text class="stat-label">平均分</text>
      </view>
    </view>

    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view class="filter-group">
          <view 
            class="filter-item"
            :class="{ active: filterLevel === '' }"
            @click="filterLevel = ''; loadMaterials()"
          >
            全部难度
          </view>
          <view 
            v-for="level in levels" 
            :key="level.value"
            class="filter-item"
            :class="{ active: filterLevel === level.value }"
            @click="filterLevel = level.value; loadMaterials()"
          >
            {{ level.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="material-list">
      <view 
        v-for="material in materials" 
        :key="material.id"
        class="material-card"
        @click="startPractice(material)"
      >
        <view class="card-header">
          <view class="material-icon">🎧</view>
          <view class="material-info">
            <text class="material-title">{{ material.title }}</text>
            <view class="material-meta">
              <text class="meta-tag" :class="material.category">{{ getCategoryLabel(material.category) }}</text>
              <text class="meta-tag" :class="material.level">{{ getLevelLabel(material.level) }}</text>
            </view>
          </view>
        </view>
        <view class="card-footer">
          <view class="footer-item">
            <u-icon name="clock" size="20" color="#999"></u-icon>
            <text>{{ formatDuration(material.duration) }}</text>
          </view>
          <view class="footer-item">
            <u-icon name="eye" size="20" color="#999"></u-icon>
            <text>{{ material.playCount }}次</text>
          </view>
          <view class="footer-item">
            <u-icon name="file-text" size="20" color="#999"></u-icon>
            <text>{{ material.questions?.length || 0 }}题</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="materials.length === 0" class="empty">
      <text class="empty-icon">🎵</text>
      <text class="empty-text">暂无听力材料</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listeningApi, analysisApi } from '@/api';
import type { ListeningMaterial, ListeningLevel, StudentAnalysis } from '@/types';

const materials = ref<ListeningMaterial[]>([]);
const filterLevel = ref<ListeningLevel | ''>('');
const myAnalysis = ref<StudentAnalysis | null>(null);

const levels = [
  { label: '入门', value: 'beginner' },
  { label: '初级', value: 'elementary' },
  { label: '中级', value: 'intermediate' },
  { label: '中高级', value: 'upper_intermediate' },
  { label: '高级', value: 'advanced' },
];

const categories = [
  { label: '对话', value: 'conversation' },
  { label: '故事', value: 'story' },
  { label: '新闻', value: 'news' },
  { label: '讲座', value: 'lecture' },
  { label: '歌曲', value: 'song' },
];

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    const [materialsData, analysis] = await Promise.all([
      listeningApi.getMaterials(),
      analysisApi.getMyAnalysis(),
    ]);
    materials.value = materialsData;
    myAnalysis.value = analysis;
  } catch (e) {
    console.error(e);
  }
}

async function loadMaterials() {
  try {
    materials.value = await listeningApi.getMaterials(
      undefined,
      filterLevel.value as ListeningLevel || undefined,
      true
    );
  } catch (e) {
    console.error(e);
  }
}

function getCategoryLabel(category: string): string {
  const cat = categories.find(c => c.value === category);
  return cat?.label || category;
}

function getLevelLabel(level: string): string {
  const lvl = levels.find(l => l.value === level);
  return lvl?.label || level;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function startPractice(material: ListeningMaterial) {
  try {
    const practice = await listeningApi.startPractice(material.id);
    uni.navigateTo({ 
      url: `/pages/student/listening-practice/listening-practice?practiceId=${practice.id}` 
    });
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
.listening-page {
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

.stats-card {
  display: flex;
  margin: -60rpx 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .stat-item {
    flex: 1;
    text-align: center;
    border-right: 1rpx solid #f0f0f0;

    &:last-child {
      border-right: none;
    }

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

.filter-bar {
  background: #fff;
  padding: 16rpx 0;
  margin-bottom: 20rpx;

  .filter-scroll {
    white-space: nowrap;
  }

  .filter-group {
    display: inline-flex;
    padding: 0 20rpx;
    gap: 12rpx;
  }

  .filter-item {
    display: inline-block;
    padding: 12rpx 28rpx;
    border-radius: 32rpx;
    background: #f5f5f5;
    font-size: 26rpx;
    color: #666;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.material-list {
  padding: 0 20rpx;
}

.material-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .card-header {
    display: flex;
    margin-bottom: 20rpx;

    .material-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 16rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36rpx;
      margin-right: 20rpx;
    }

    .material-info {
      flex: 1;

      .material-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 12rpx;
      }

      .material-meta {
        display: flex;
        gap: 12rpx;

        .meta-tag {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          background: #f0f0f0;
          color: #666;

          &.conversation { background: #e6f7ff; color: #1890ff; }
          &.story { background: #fff7e6; color: #fa8c16; }
          &.news { background: #f9f0ff; color: #722ed1; }
          &.lecture { background: #f6ffed; color: #52c41a; }
          &.song { background: #fff0f6; color: #eb2f96; }

          &.beginner { background: #f6ffed; color: #52c41a; }
          &.elementary { background: #e6f7ff; color: #1890ff; }
          &.intermediate { background: #fff7e6; color: #fa8c16; }
          &.upper_intermediate { background: #fff1f0; color: #f5222d; }
          &.advanced { background: #f9f0ff; color: #722ed1; }
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-around;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;

    .footer-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 22rpx;
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

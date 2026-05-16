<template>
  <view class="listening-page">
    <view class="header">
      <text class="title">听力材料</text>
      <view class="upload-btn" @click="showUploadModal = true">
        <u-icon name="plus" size="24" color="#fff"></u-icon>
        <text>上传材料</text>
      </view>
    </view>

    <view class="filter-bar">
      <view class="filter-group">
        <view 
          v-for="cat in categories" 
          :key="cat.value"
          class="filter-item"
          :class="{ active: filterCategory === cat.value }"
          @click="filterCategory = cat.value; loadMaterials()"
        >
          {{ cat.label }}
        </view>
      </view>
    </view>

    <view class="material-list">
      <view 
        v-for="material in materials" 
        :key="material.id"
        class="material-card"
        @click="viewMaterial(material)"
      >
        <view class="card-header">
          <view class="material-icon">🎧</view>
          <view class="material-info">
            <text class="material-title">{{ material.title }}</text>
            <view class="material-meta">
              <text class="meta-tag" :class="material.category">{{ getCategoryLabel(material.category) }}</text>
              <text class="meta-tag" :class="material.level">{{ getLevelLabel(material.level) }}</text>
              <text class="meta-time">{{ formatDuration(material.duration) }}</text>
            </view>
          </view>
        </view>
        <view class="card-stats">
          <view class="stat">
            <text class="stat-value">{{ material.playCount }}</text>
            <text class="stat-label">播放次数</text>
          </view>
          <view class="stat">
            <text class="stat-value">{{ material.questions?.length || 0 }}</text>
            <text class="stat-label">题目数</text>
          </view>
          <view class="stat">
            <text class="stat-value">{{ material.isPublic ? '公开' : '私有' }}</text>
            <text class="stat-label">状态</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="materials.length === 0" class="empty">
      <text class="empty-icon">🎵</text>
      <text class="empty-text">暂无听力材料</text>
    </view>

    <u-modal v-model="showUploadModal" title="上传听力材料" width="650">
      <view class="modal-form">
        <u-input v-model="uploadForm.title" placeholder="材料标题" border="surround"></u-input>
        <u-input v-model="uploadForm.description" placeholder="描述（可选）" type="textarea" border="surround"></u-input>
        <u-input v-model="uploadForm.audioUrl" placeholder="音频链接" border="surround"></u-input>
        <u-input v-model="uploadForm.transcript" placeholder="听力原文（可选）" type="textarea" border="surround"></u-input>
        
        <view class="form-item">
          <text class="label">分类</text>
          <view class="options">
            <view 
              v-for="cat in categories.filter(c => c.value)" 
              :key="cat.value"
              class="option-btn"
              :class="{ active: uploadForm.category === cat.value }"
              @click="uploadForm.category = cat.value as any"
            >
              {{ cat.label }}
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">难度</text>
          <view class="options">
            <view 
              v-for="level in levels" 
              :key="level.value"
              class="option-btn"
              :class="{ active: uploadForm.level === level.value }"
              @click="uploadForm.level = level.value as any"
            >
              {{ level.label }}
            </view>
          </view>
        </view>

        <button class="submit-btn" @click="uploadMaterial">上传</button>
      </view>
    </u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { listeningApi } from '@/api/listening';
import type { ListeningMaterial, MaterialCategory, ListeningLevel } from '@/types';

const materials = ref<ListeningMaterial[]>([]);
const filterCategory = ref<MaterialCategory | ''>('');
const showUploadModal = ref(false);

const uploadForm = reactive({
  title: '',
  description: '',
  audioUrl: '',
  transcript: '',
  category: 'conversation' as MaterialCategory,
  level: 'intermediate' as ListeningLevel,
  duration: 120,
  isPublic: true,
});

const categories = [
  { label: '全部', value: '' },
  { label: '对话', value: 'conversation' },
  { label: '故事', value: 'story' },
  { label: '新闻', value: 'news' },
  { label: '讲座', value: 'lecture' },
  { label: '歌曲', value: 'song' },
];

const levels = [
  { label: '入门', value: 'beginner' },
  { label: '初级', value: 'elementary' },
  { label: '中级', value: 'intermediate' },
  { label: '中高级', value: 'upper_intermediate' },
  { label: '高级', value: 'advanced' },
];

onMounted(() => {
  loadMaterials();
});

async function loadMaterials() {
  try {
    materials.value = await listeningApi.getMaterials(
      filterCategory.value as MaterialCategory || undefined
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

function viewMaterial(material: ListeningMaterial) {
  uni.showToast({ title: '查看材料详情', icon: 'none' });
}

async function uploadMaterial() {
  if (!uploadForm.title || !uploadForm.audioUrl) {
    uni.showToast({ title: '请填写标题和音频链接', icon: 'none' });
    return;
  }
  try {
    await listeningApi.createMaterial(uploadForm);
    showUploadModal.value = false;
    uploadForm.title = '';
    uploadForm.description = '';
    uploadForm.audioUrl = '';
    uploadForm.transcript = '';
    loadMaterials();
    uni.showToast({ title: '上传成功', icon: 'success' });
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
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
  }

  .upload-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 16rpx 28rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
  }
}

.filter-bar {
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #eee;

  .filter-group {
    display: flex;
    gap: 12rpx;
    overflow-x: auto;
  }

  .filter-item {
    padding: 12rpx 24rpx;
    border-radius: 32rpx;
    background: #f5f5f5;
    font-size: 24rpx;
    color: #666;
    white-space: nowrap;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.material-list {
  padding: 20rpx;
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
        align-items: center;

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

        .meta-time {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }

  .card-stats {
    display: flex;
    border-top: 1rpx solid #f5f5f5;
    padding-top: 16rpx;

    .stat {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: 28rpx;
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

.modal-form {
  padding: 20rpx 0;

  :deep(.u-input) {
    margin-bottom: 24rpx;
  }

  .form-item {
    margin-bottom: 24rpx;

    .label {
      font-size: 26rpx;
      color: #333;
      display: block;
      margin-bottom: 12rpx;
    }

    .options {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .option-btn {
        padding: 10rpx 24rpx;
        border-radius: 32rpx;
        background: #f5f5f5;
        font-size: 24rpx;
        color: #666;

        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
      }
    }
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

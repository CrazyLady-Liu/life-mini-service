<template>
  <view class="students-page">
    <view class="search-bar">
      <u-input 
        v-model="searchKeyword" 
        placeholder="搜索学生姓名" 
        border="surround" 
        shape="round"
        clearable
      >
        <template #left>
          <u-icon name="search" size="28" color="#999"></u-icon>
        </template>
      </u-input>
    </view>

    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{ active: !filterGrade }"
        @click="filterGrade = null"
      >
        全部
      </view>
      <view 
        v-for="grade in [1, 2, 3, 4, 5, 6]" 
        :key="grade"
        class="filter-item"
        :class="{ active: filterGrade === grade }"
        @click="filterGrade = grade"
      >
        {{ grade }}年级
      </view>
    </view>

    <view class="student-list">
      <view 
        v-for="profile in filteredProfiles" 
        :key="profile.id"
        class="student-card"
        @click="viewDetail(profile)"
      >
        <view class="student-avatar">{{ profile.student?.name?.charAt(0) || '学' }}</view>
        <view class="student-info">
          <view class="info-top">
            <text class="student-name">{{ profile.student?.name }}</text>
            <text class="student-grade">{{ profile.grade || '未设置' }}年级</text>
          </view>
          <view class="info-bottom">
            <text class="student-class">{{ profile.className || '未分班' }}</text>
            <text class="student-score">平均分: {{ profile.averageScore }}分</text>
          </view>
        </view>
        <view class="student-stats">
          <view class="stat">
            <text class="stat-value">{{ profile.completedHomework }}/{{ profile.totalHomework }}</text>
            <text class="stat-label">作业</text>
          </view>
          <view class="stat">
            <text class="stat-value">{{ Math.floor(profile.totalListeningTime / 60) }}分钟</text>
            <text class="stat-label">听力</text>
          </view>
        </view>
        <u-icon name="arrow-right" size="28" color="#ccc"></u-icon>
      </view>
    </view>

    <view v-if="filteredProfiles.length === 0" class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无学生数据</text>
    </view>

    <view class="fab-btn" @click="showAddModal = true">
      <u-icon name="plus" size="32" color="#fff"></u-icon>
    </view>

    <u-modal v-model="showAddModal" title="添加学生档案" width="600">
      <view class="modal-content">
        <u-input v-model="addForm.studentId" placeholder="学生ID" border="surround"></u-input>
        <u-input v-model="addForm.grade" placeholder="年级" type="number" border="surround"></u-input>
        <u-input v-model="addForm.className" placeholder="班级" border="surround"></u-input>
        <button class="submit-btn" @click="addStudent">添加</button>
      </view>
    </u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { studentApi } from '@/api/student';
import type { StudentProfile } from '@/types';

const searchKeyword = ref('');
const filterGrade = ref<number | null>(null);
const profiles = ref<StudentProfile[]>([]);
const showAddModal = ref(false);
const addForm = ref({
  studentId: '',
  grade: 1,
  className: '',
});

const filteredProfiles = computed(() => {
  return profiles.value.filter(p => {
    const matchSearch = !searchKeyword.value || 
      p.student?.name?.includes(searchKeyword.value);
    const matchGrade = filterGrade.value === null || p.grade === filterGrade.value;
    return matchSearch && matchGrade;
  });
});

onMounted(() => {
  loadProfiles();
});

async function loadProfiles() {
  try {
    profiles.value = await studentApi.getProfiles();
  } catch (e) {
    console.error(e);
  }
}

function viewDetail(profile: StudentProfile) {
  uni.navigateTo({ 
    url: `/pages/teacher/student-detail/student-detail?studentId=${profile.studentId}` 
  });
}

async function addStudent() {
  try {
    await studentApi.createProfile(addForm.value);
    showAddModal.value = false;
    loadProfiles();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
.students-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-bar {
  padding: 20rpx;
  background: #fff;

  :deep(.u-input) {
    background: #f5f5f5;
  }
}

.filter-bar {
  display: flex;
  padding: 16rpx 20rpx;
  background: #fff;
  border-top: 1rpx solid #f5f5f5;
  overflow-x: auto;
  gap: 16rpx;

  .filter-item {
    padding: 12rpx 28rpx;
    border-radius: 32rpx;
    background: #f5f5f5;
    font-size: 26rpx;
    color: #666;
    white-space: nowrap;

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}

.student-list {
  padding: 20rpx;
}

.student-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .student-avatar {
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    font-weight: bold;
    margin-right: 24rpx;
  }

  .student-info {
    flex: 1;

    .info-top {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;

      .student-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-right: 16rpx;
      }

      .student-grade {
        font-size: 22rpx;
        color: #667eea;
        background: #f0f0ff;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }

    .info-bottom {
      display: flex;
      gap: 20rpx;

      .student-class {
        font-size: 24rpx;
        color: #999;
      }

      .student-score {
        font-size: 24rpx;
        color: #11998e;
      }
    }
  }

  .student-stats {
    display: flex;
    gap: 30rpx;
    margin-right: 20rpx;

    .stat {
      text-align: center;

      .stat-value {
        font-size: 24rpx;
        color: #333;
        font-weight: bold;
        display: block;
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

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.modal-content {
  padding: 20rpx 0;

  :deep(.u-input) {
    margin-bottom: 24rpx;
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

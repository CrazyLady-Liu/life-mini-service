<template>
  <view class="practice-page">
    <view v-if="practice && material" class="content">
      <view class="audio-player" v-if="material.audioUrl">
        <view class="player-header">
          <view class="play-btn" @click="togglePlay">
            <u-icon :name="isPlaying ? 'pause' : 'play'" size="32" color="#fff"></u-icon>
          </view>
          <view class="progress-container">
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
            </view>
            <view class="time-info">
              <text>{{ formatTime(currentTime) }}</text>
              <text>{{ formatTime(duration) }}</text>
            </view>
          </view>
        </view>
        <view class="controls">
          <view class="speed-control">
            <text class="control-label">语速：</text>
            <view 
              v-for="speed in speeds" 
              :key="speed"
              class="speed-btn"
              :class="{ active: playbackSpeed === speed }"
              @click="changeSpeed(speed)"
            >
              {{ speed }}x
            </view>
          </view>
        </view>
      </view>

      <view class="transcript-section" v-if="material.transcript">
        <view class="section-header" @click="showTranscript = !showTranscript">
          <text class="section-title">听力原文</text>
          <u-icon :name="showTranscript ? 'arrow-up' : 'arrow-down'" size="20" color="#667eea"></u-icon>
        </view>
        <view v-if="showTranscript" class="transcript-content">
          {{ material.transcript }}
        </view>
      </view>

      <view class="questions-section">
        <view class="section-title">答题区域</view>
        <view 
          v-for="(question, index) in material.questions" 
          :key="question.id"
          class="question-card"
        >
          <view class="question-header">
            <view class="question-number">{{ index + 1 }}</view>
            <view class="question-type">{{ getQuestionTypeLabel(question.type) }}</view>
            <view class="question-score">{{ question.score }}分</view>
          </view>
          
          <view class="question-content">{{ question.content }}</view>

          <view v-if="question.type === 'single' || question.type === 'multiple'" class="options-list">
            <view 
              v-for="(option, optIndex) in question.options" 
              :key="optIndex"
              class="option-item"
              :class="{ selected: isSelected(question.id, option) }"
              @click="selectOption(question, option)"
            >
              <view class="option-mark">{{ String.fromCharCode(65 + optIndex) }}</view>
              <text class="option-text">{{ option }}</text>
            </view>
          </view>

          <view v-else class="fill-input">
            <u-input 
              v-model="answers[question.id]" 
              placeholder="请输入答案" 
              border="surround"
            ></u-input>
          </view>
        </view>
      </view>

      <view class="submit-bar">
        <view class="stats">
          <text class="answered">已答: {{ answeredCount }}/{{ material.questions?.length || 0 }}</text>
          <text class="listen-time">听了: {{ totalListenCount }}次</text>
        </view>
        <button class="submit-btn" @click="submitPractice">提交答案</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { listeningApi } from '@/api/listening';
import type { ListeningPractice, ListeningMaterial } from '@/types';

const practiceId = ref('');
const practice = ref<ListeningPractice | null>(null);
const material = ref<ListeningMaterial | null>(null);
const answers = reactive<Record<string, any>>({});
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const playbackSpeed = ref(1.0);
const showTranscript = ref(false);
const totalListenCount = ref(0);
const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

const answeredCount = computed(() => {
  return Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  practiceId.value = currentPage.options.practiceId;
  loadData();
});

async function loadData() {
  try {
    practice.value = await listeningApi.getPractice(practiceId.value);
    material.value = practice.value.material || null;
  } catch (e) {
    console.error(e);
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    totalListenCount.value++;
  }
}

function changeSpeed(speed: number) {
  playbackSpeed.value = speed;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getQuestionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    short: '简答题',
  };
  return map[type] || type;
}

function isSelected(questionId: string, option: string): boolean {
  const answer = answers[questionId];
  if (Array.isArray(answer)) {
    return answer.includes(option);
  }
  return answer === option;
}

function selectOption(question: any, option: string) {
  if (question.type === 'multiple') {
    if (!answers[question.id]) {
      answers[question.id] = [];
    }
    const index = answers[question.id].indexOf(option);
    if (index > -1) {
      answers[question.id].splice(index, 1);
    } else {
      answers[question.id].push(option);
    }
  } else {
    answers[question.id] = option;
  }
}

async function submitPractice() {
  uni.showModal({
    title: '确认提交',
    content: `已完成 ${answeredCount.value}/${material.value?.questions?.length || 0} 题，确定提交吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const answerList = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          }));
          await listeningApi.submitPractice(practiceId.value, {
            answers: answerList,
            totalListenTime: currentTime.value,
            playCount: totalListenCount.value,
            playbackSpeed: playbackSpeed.value,
            repeatedSections: 0,
          });
          uni.showToast({ title: '提交成功', icon: 'success' });
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
.practice-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.content {
  padding: 20rpx;
}

.audio-player {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  color: #fff;

  .player-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .play-btn {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 24rpx;
    }

    .progress-container {
      flex: 1;

      .progress-bar {
        height: 8rpx;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 8rpx;

        .progress-fill {
          height: 100%;
          background: #fff;
          border-radius: 4rpx;
          transition: width 0.3s ease;
        }
      }

      .time-info {
        display: flex;
        justify-content: space-between;
        font-size: 22rpx;
        opacity: 0.9;
      }
    }
  }

  .controls {
    .speed-control {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .control-label {
        font-size: 24rpx;
        opacity: 0.9;
      }

      .speed-btn {
        padding: 8rpx 20rpx;
        border-radius: 24rpx;
        background: rgba(255, 255, 255, 0.2);
        font-size: 22rpx;

        &.active {
          background: #fff;
          color: #667eea;
        }
      }
    }
  }
}

.transcript-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .transcript-content {
    margin-top: 16rpx;
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    background: #fafafa;
    padding: 20rpx;
    border-radius: 12rpx;
  }
}

.questions-section {
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .question-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .question-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .question-number {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;
        margin-right: 16rpx;
      }

      .question-type {
        font-size: 22rpx;
        color: #667eea;
        background: #f0f0ff;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        margin-right: auto;
      }

      .question-score {
        font-size: 24rpx;
        color: #fa8c16;
        font-weight: bold;
      }
    }

    .question-content {
      font-size: 30rpx;
      color: #333;
      line-height: 1.8;
      margin-bottom: 24rpx;
    }

    .options-list {
      .option-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        background: #fafafa;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        border: 2rpx solid transparent;

        &.selected {
          background: #f0f0ff;
          border-color: #667eea;
        }

        &:last-child {
          margin-bottom: 0;
        }

        .option-mark {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background: #e0e0e0;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          font-weight: bold;
          margin-right: 16rpx;

          .selected & {
            background: #667eea;
          }
        }

        .option-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }

    .fill-input {
      :deep(.u-input) {
        background: #fafafa;
      }
    }
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

  .stats {
    .answered, .listen-time {
      font-size: 26rpx;
      color: #666;
      display: block;
    }
  }

  .submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 20rpx 80rpx;
    border-radius: 50rpx;
    font-size: 30rpx;
    border: none;
  }
}
</style>

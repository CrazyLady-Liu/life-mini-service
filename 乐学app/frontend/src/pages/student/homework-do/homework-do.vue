<template>
  <view class="homework-do-page">
    <view v-if="submission && homework" class="content">
      <view class="header-info">
        <text class="title">{{ homework.title }}</text>
        <view class="meta-row">
          <text class="meta-item">{{ getTypeLabel(homework.type) }}</text>
          <text class="meta-item">{{ homework.totalScore }}分</text>
          <text class="meta-item">{{ homework.duration }}分钟</text>
        </view>
      </view>

      <view v-if="isViewMode && submission.status !== 'not_started' && submission.status !== 'in_progress'" class="result-card">
        <view class="result-score">
          <text class="score-value">{{ submission.score }}</text>
          <text class="score-total">/{{ submission.totalScore }}</text>
        </view>
        <view class="result-info">
          <text class="accuracy">正确率: {{ submission.accuracy }}%</text>
          <text class="time">用时: {{ formatTime(submission.timeSpent) }}</text>
        </view>
        <view v-if="submission.teacherComment" class="comment">
          <text class="comment-label">老师评语：</text>
          <text class="comment-text">{{ submission.teacherComment }}</text>
        </view>
      </view>

      <view v-if="!isViewMode && (submission.status === 'not_started' || submission.status === 'in_progress')" class="timer">
        <text class="timer-label">已用时间：</text>
        <text class="timer-value">{{ formatTime(elapsedTime) }}</text>
      </view>

      <view class="questions-list">
        <view 
          v-for="(question, index) in homework.questions" 
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
              :class="{ 
                selected: isSelected(question.id, option),
                correct: isViewMode && isCorrectOption(question, option),
                wrong: isViewMode && isWrongOption(question, option)
              }"
              @click="selectOption(question, option)"
            >
              <view class="option-mark">{{ String.fromCharCode(65 + optIndex) }}</view>
              <text class="option-text">{{ option }}</text>
            </view>
          </view>

          <view v-else-if="question.type === 'fill'" class="fill-input">
            <u-input 
              v-model="answers[question.id]" 
              placeholder="请输入答案" 
              border="surround"
              :disabled="isViewMode"
            ></u-input>
          </view>

          <view v-else class="textarea-input">
            <u-input 
              v-model="answers[question.id]" 
              placeholder="请输入答案" 
              type="textarea"
              border="surround"
              :disabled="isViewMode"
            ></u-input>
          </view>

          <view v-if="isViewMode && question.explanation" class="explanation">
            <text class="explanation-label">解析：</text>
            <text class="explanation-text">{{ question.explanation }}</text>
          </view>
        </view>
      </view>

      <view v-if="!isViewMode && submission.status !== 'submitted' && submission.status !== 'graded'" class="submit-bar">
        <text class="answered-count">已答: {{ answeredCount }}/{{ homework.questions?.length || 0 }}</text>
        <button class="submit-btn" @click="submitHomework">提交作业</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { homeworkApi } from '@/api/homework';
import type { Homework, HomeworkSubmission, Question } from '@/types';

const submissionId = ref('');
const isViewMode = ref(false);
const submission = ref<HomeworkSubmission | null>(null);
const homework = ref<Homework | null>(null);
const answers = reactive<Record<string, any>>({});
const elapsedTime = ref(0);
let timer: number | null = null;

const answeredCount = computed(() => {
  return Object.values(answers).filter(v => v !== undefined && v !== null && v !== '').length;
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  submissionId.value = currentPage.options.submissionId;
  // @ts-ignore
  isViewMode.value = currentPage.options.view === 'true';
  loadData();
  startTimer();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

async function loadData() {
  try {
    submission.value = await homeworkApi.getSubmission(submissionId.value);
    homework.value = submission.value.homework || null;
    
    if (submission.value.answers) {
      submission.value.answers.forEach(a => {
        answers[a.questionId] = a.answer;
      });
    }

    if (submission.value.status === 'not_started') {
      await homeworkApi.startHomework(submissionId.value);
    }
  } catch (e) {
    console.error(e);
  }
}

function startTimer() {
  timer = setInterval(() => {
    elapsedTime.value++;
  }, 1000) as unknown as number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

function getQuestionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    short: '简答题',
    listening: '听力题',
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

function isCorrectOption(question: Question, option: string): boolean {
  const correctAnswer = question.answer;
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.includes(option);
  }
  return correctAnswer === option;
}

function isWrongOption(question: Question, option: string): boolean {
  const studentAnswer = answers[question.id];
  const correctAnswer = question.answer;
  const isSelectedByStudent = Array.isArray(studentAnswer) 
    ? studentAnswer.includes(option) 
    : studentAnswer === option;
  const isCorrect = Array.isArray(correctAnswer)
    ? correctAnswer.includes(option)
    : correctAnswer === option;
  return isSelectedByStudent && !isCorrect;
}

function selectOption(question: Question, option: string) {
  if (isViewMode.value) return;

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

async function submitHomework() {
  uni.showModal({
    title: '确认提交',
    content: `已完成 ${answeredCount.value}/${homework.value?.questions?.length || 0} 题，确定提交吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const answerList = Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          }));
          await homeworkApi.submitHomework(submissionId.value, {
            answers: answerList,
            timeSpent: elapsedTime.value,
          });
          if (timer) clearInterval(timer);
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
.homework-do-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.content {
  padding: 20rpx;
}

.header-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .title {
    font-size: 34rpx;
    font-weight: bold;
    display: block;
    margin-bottom: 16rpx;
  }

  .meta-row {
    display: flex;
    gap: 24rpx;

    .meta-item {
      font-size: 24rpx;
      background: rgba(255, 255, 255, 0.2);
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
  }
}

.result-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  text-align: center;

  .result-score {
    margin-bottom: 16rpx;

    .score-value {
      font-size: 72rpx;
      font-weight: bold;
      color: #667eea;
    }

    .score-total {
      font-size: 32rpx;
      color: #999;
    }
  }

  .result-info {
    display: flex;
    justify-content: center;
    gap: 40rpx;
    margin-bottom: 20rpx;

    .accuracy, .time {
      font-size: 26rpx;
      color: #666;
    }
  }

  .comment {
    background: #fafafa;
    border-radius: 12rpx;
    padding: 20rpx;
    text-align: left;

    .comment-label {
      font-size: 26rpx;
      color: #667eea;
      font-weight: bold;
      display: block;
      margin-bottom: 8rpx;
    }

    .comment-text {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.timer {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  .timer-label {
    font-size: 26rpx;
    color: #666;
    margin-right: 12rpx;
  }

  .timer-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #667eea;
  }
}

.questions-list {
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
        transition: all 0.2s;

        &.selected {
          background: #f0f0ff;
          border-color: #667eea;
        }

        &.correct {
          background: #f6ffed;
          border-color: #52c41a;
        }

        &.wrong {
          background: #fff1f0;
          border-color: #f5222d;
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

          .correct & {
            background: #52c41a;
          }

          .wrong & {
            background: #f5222d;
          }
        }

        .option-text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }

    .fill-input, .textarea-input {
      :deep(.u-input) {
        background: #fafafa;
      }
    }

    .explanation {
      background: #fffbe6;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-top: 20rpx;

      .explanation-label {
        font-size: 26rpx;
        color: #fa8c16;
        font-weight: bold;
        display: block;
        margin-bottom: 8rpx;
      }

      .explanation-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
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

  .answered-count {
    font-size: 28rpx;
    color: #666;
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

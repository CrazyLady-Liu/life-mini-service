<template>
  <view class="create-page">
    <view class="form-section">
      <view class="section-title">基本信息</view>
      <u-input v-model="form.title" placeholder="作业标题" border="surround"></u-input>
      <u-input v-model="form.description" placeholder="作业描述（可选）" type="textarea" border="surround"></u-input>
    </view>

    <view class="form-section">
      <view class="section-title">作业设置</view>
      
      <view class="form-item">
        <text class="label">作业类型</text>
        <view class="options">
          <view 
            v-for="type in homeworkTypes" 
            :key="type.value"
            class="option-btn"
            :class="{ active: form.type === type.value }"
            @click="form.type = type.value"
          >
            {{ type.label }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">难度等级</text>
        <view class="options">
          <view 
            v-for="level in difficultyLevels" 
            :key="level.value"
            class="option-btn"
            :class="{ active: form.difficulty === level.value }"
            @click="form.difficulty = level.value"
          >
            {{ level.label }}
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">生成方式</text>
        <switch 
          :checked="form.autoGenerate" 
          @change="form.autoGenerate = $event.detail.value"
          color="#667eea"
        ></switch>
      </view>

      <view v-if="form.autoGenerate" class="form-item">
        <text class="label">题目数量</text>
        <u-input v-model="form.questionCount" placeholder="输入题目数量" type="number" border="surround"></u-input>
      </view>

      <view class="form-item">
        <text class="label">考试时长（分钟）</text>
        <u-input v-model="form.duration" placeholder="输入时长" type="number" border="surround"></u-input>
      </view>

      <view class="form-item">
        <text class="label">截止时间</text>
        <picker mode="date" @change="onDateChange">
          <u-input 
            v-model="form.deadline" 
            placeholder="选择截止时间" 
            border="surround"
            readonly
          ></u-input>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">年级</text>
        <u-input v-model="form.grade" placeholder="适用年级" type="number" border="surround"></u-input>
      </view>

      <view class="form-item">
        <text class="label">科目</text>
        <u-input v-model="form.subject" placeholder="科目名称" border="surround"></u-input>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">
        自定义题目
        <text class="tip" v-if="form.autoGenerate">（开启自动生成后可留空）</text>
      </view>
      
      <view v-for="(question, index) in form.questions" :key="index" class="question-item">
        <view class="question-header">
          <text class="question-index">第{{ index + 1 }}题</text>
          <text class="delete-btn" @click="removeQuestion(index)">删除</text>
        </view>
        <u-input v-model="question.content" placeholder="题目内容" border="surround"></u-input>
        <u-input v-model="question.answer" placeholder="正确答案" border="surround"></u-input>
        <u-input v-model="question.score" placeholder="分值" type="number" border="surround"></u-input>
      </view>

      <button class="add-question-btn" @click="addQuestion">+ 添加题目</button>
    </view>

    <view class="form-section">
      <view class="section-title">发布对象</view>
      <view class="tip-text">保存后可选择学生进行发布</view>
    </view>

    <view class="action-bar">
      <button class="save-btn" @click="saveDraft">保存草稿</button>
      <button class="publish-btn" @click="saveAndPublish">保存并发布</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { homeworkApi } from '@/api/homework';
import type { HomeworkType, DifficultyLevel, Question } from '@/types';

const form = reactive({
  title: '',
  description: '',
  type: 'mixed' as HomeworkType,
  difficulty: 'medium' as DifficultyLevel,
  autoGenerate: true,
  questionCount: 10,
  duration: 30,
  deadline: '',
  grade: 1,
  subject: '',
  questions: [] as Question[],
});

const homeworkTypes = [
  { label: '听力', value: 'listening' },
  { label: '阅读', value: 'reading' },
  { label: '写作', value: 'writing' },
  { label: '口语', value: 'speaking' },
  { label: '综合', value: 'mixed' },
];

const difficultyLevels = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' },
];

function onDateChange(e: any) {
  form.deadline = e.detail.value;
}

function addQuestion() {
  form.questions.push({
    id: Date.now().toString(),
    type: 'single',
    content: '',
    options: [],
    answer: '',
    score: 10,
  });
}

function removeQuestion(index: number) {
  form.questions.splice(index, 1);
}

async function saveDraft() {
  if (!form.title) {
    uni.showToast({ title: '请输入作业标题', icon: 'none' });
    return;
  }
  try {
    await homeworkApi.create(form);
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    console.error(e);
  }
}

async function saveAndPublish() {
  if (!form.title) {
    uni.showToast({ title: '请输入作业标题', icon: 'none' });
    return;
  }
  try {
    const homework = await homeworkApi.create(form);
    await homeworkApi.publish(homework.id);
    uni.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.form-section {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;

    .tip {
      font-size: 24rpx;
      color: #999;
      font-weight: normal;
      margin-left: 12rpx;
    }
  }

  .tip-text {
    font-size: 24rpx;
    color: #999;
  }

  :deep(.u-input) {
    margin-bottom: 24rpx;
  }
}

.form-item {
  margin-bottom: 24rpx;

  .label {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .option-btn {
      padding: 16rpx 32rpx;
      border-radius: 40rpx;
      background: #f5f5f5;
      font-size: 26rpx;
      color: #666;

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }
    }
  }
}

.question-item {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .question-index {
      font-size: 28rpx;
      font-weight: bold;
      color: #667eea;
    }

    .delete-btn {
      font-size: 24rpx;
      color: #f5222d;
    }
  }
}

.add-question-btn {
  width: 100%;
  height: 80rpx;
  background: #f0f0ff;
  color: #667eea;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: 2rpx dashed #667eea;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

  .save-btn {
    flex: 1;
    height: 90rpx;
    background: #f5f5f5;
    color: #666;
    border-radius: 45rpx;
    font-size: 30rpx;
    border: none;
  }

  .publish-btn {
    flex: 2;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 45rpx;
    font-size: 30rpx;
    border: none;
  }
}
</style>

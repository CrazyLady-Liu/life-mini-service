import { Question, DifficultyLevel } from './homework.entity';
import { v4 as uuidv4 } from 'uuid';

const questionBank: Record<string, Question[]> = {
  listening_easy: [
    {
      id: uuidv4(),
      type: 'single',
      content: '听录音，选择你听到的单词：A. apple B. banana C. orange',
      options: ['apple', 'banana', 'orange'],
      answer: 'apple',
      score: 10,
      audioUrl: '/audio/listening/easy_1.mp3',
      explanation: '录音中播放的单词是 apple',
    },
    {
      id: uuidv4(),
      type: 'single',
      content: '听录音，选择正确的图片描述：A. 猫 B. 狗 C. 鸟',
      options: ['猫', '狗', '鸟'],
      answer: '狗',
      score: 10,
      audioUrl: '/audio/listening/easy_2.mp3',
      explanation: '录音中描述的是一只狗',
    },
  ],
  listening_medium: [
    {
      id: uuidv4(),
      type: 'single',
      content: '听对话，回答问题：What is the weather like today? A. Sunny B. Rainy C. Cloudy',
      options: ['Sunny', 'Rainy', 'Cloudy'],
      answer: 'Sunny',
      score: 15,
      audioUrl: '/audio/listening/medium_1.mp3',
      explanation: '对话中提到 "It\'s a beautiful sunny day today."',
    },
    {
      id: uuidv4(),
      type: 'fill',
      content: '听录音，填空：I ___ to school every day.',
      answer: 'walk',
      score: 15,
      audioUrl: '/audio/listening/medium_2.mp3',
      explanation: '录音中说的是 "I walk to school every day."',
    },
  ],
  listening_hard: [
    {
      id: uuidv4(),
      type: 'short',
      content: '听短文，回答问题：What is the main idea of the passage?',
      answer: 'The importance of environmental protection',
      score: 20,
      audioUrl: '/audio/listening/hard_1.mp3',
      explanation: '短文主要讲述了环境保护的重要性',
    },
  ],
  reading_easy: [
    {
      id: uuidv4(),
      type: 'single',
      content: '阅读句子 "The cat is sleeping."，猫在做什么？ A. 吃东西 B. 睡觉 C. 玩耍',
      options: ['吃东西', '睡觉', '玩耍'],
      answer: '睡觉',
      score: 10,
      explanation: 'sleeping 意为睡觉',
    },
  ],
  reading_medium: [
    {
      id: uuidv4(),
      type: 'multiple',
      content: '阅读短文，选择正确答案（多选）：Tom likes ___. A. apples B. bananas C. oranges',
      options: ['apples', 'bananas', 'oranges'],
      answer: ['apples', 'bananas'],
      score: 15,
      explanation: '短文中提到 Tom 喜欢苹果和香蕉',
    },
  ],
  reading_hard: [
    {
      id: uuidv4(),
      type: 'short',
      content: '阅读文章，用自己的话总结作者的观点。',
      answer: '作者认为科技发展对人类社会有深远影响',
      score: 20,
      explanation: '需要理解文章主旨并进行总结',
    },
  ],
  grammar_easy: [
    {
      id: uuidv4(),
      type: 'fill',
      content: 'I ___ a student. (be)',
      answer: 'am',
      score: 10,
      explanation: '第一人称单数用 am',
    },
  ],
  vocabulary_easy: [
    {
      id: uuidv4(),
      type: 'single',
      content: '"Beautiful" 的中文意思是：A. 丑陋的 B. 美丽的 C. 高的',
      options: ['丑陋的', '美丽的', '高的'],
      answer: '美丽的',
      score: 10,
      explanation: 'beautiful 意为美丽的',
    },
  ],
};

export function generateQuestions(
  type: string,
  difficulty: DifficultyLevel,
  count: number,
): Question[] {
  const key = `${type}_${difficulty}`;
  const questions = questionBank[key] || questionBank[`listening_${difficulty}`] || [];
  
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map(q => ({
    ...q,
    id: uuidv4(),
  }));
}

export function generateMixedQuestions(
  difficulty: DifficultyLevel,
  count: number,
): Question[] {
  const types = ['listening', 'reading', 'grammar', 'vocabulary'];
  const questionsPerType = Math.ceil(count / types.length);
  const allQuestions: Question[] = [];

  types.forEach(type => {
    const key = `${type}_${difficulty}`;
    const typeQuestions = questionBank[key] || [];
    const shuffled = [...typeQuestions].sort(() => Math.random() - 0.5);
    allQuestions.push(...shuffled.slice(0, questionsPerType));
  });

  return allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(q => ({ ...q, id: uuidv4() }));
}

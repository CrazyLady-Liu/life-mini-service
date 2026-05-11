import { CountdownType } from './types';

export const typeLabels: Record<CountdownType, string> = {
  birthday: '生日',
  exam: '考试',
  anniversary: '纪念日',
  festival: '节日'
};

export const typeColors: Record<CountdownType, string> = {
  birthday: '#FF6B6B',
  exam: '#4ECDC4',
  anniversary: '#FFE66D',
  festival: '#1A535C'
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateRemainingTime = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isPast: false };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

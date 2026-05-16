const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const isValidTime = (time: string): boolean => {
  return TIME_REGEX.test(time);
};

export const formatDate = (date: Date = new Date()): string => {
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return formatDate();
  }
};

export const formatTime = (date: Date): string => {
  try {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '00:00';
  }
};

export const calculateDuration = (bedTime: string, wakeTime: string): number => {
  if (!isValidTime(bedTime) || !isValidTime(wakeTime)) {
    return 0;
  }
  
  try {
    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    const durationMinutes = wakeMinutes - bedMinutes;
    
    if (durationMinutes < 0 || durationMinutes > 24 * 60) {
      return 0;
    }
    
    return Math.round((durationMinutes / 60) * 10) / 10;
  } catch {
    return 0;
  }
};

export const getWeekDates = (baseDate: Date = new Date()): string[] => {
  try {
    const dates: string[] = [];
    const day = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(formatDate(d));
    }
    return dates;
  } catch {
    return getWeekDates();
  }
};

export const getDayName = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  } catch {
    return '';
  }
};

export const isToday = (dateStr: string): boolean => {
  try {
    return dateStr === formatDate();
  } catch {
    return false;
  }
};

export const generateId = (): string => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDuration = (hours: number): string => {
  try {
    if (isNaN(hours) || hours < 0) return '0小时';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  } catch {
    return '0小时';
  }
};

export const getSleepQuality = (duration: number): 'good' | 'normal' | 'poor' => {
  if (isNaN(duration) || duration <= 0) return 'poor';
  if (duration >= 7.5) return 'good';
  if (duration >= 6) return 'normal';
  return 'poor';
};

export const getQualityText = (quality: 'good' | 'normal' | 'poor'): string => {
  const map = { good: '优质', normal: '一般', poor: '不足' } as const;
  return map[quality] || '未知';
};

export const getQualityColor = (quality: 'good' | 'normal' | 'poor'): string => {
  const map = { good: 'text-green-500', normal: 'text-yellow-500', poor: 'text-red-500' } as const;
  return map[quality] || 'text-gray-500';
};

export const getQualityBgColor = (quality: 'good' | 'normal' | 'poor'): string => {
  const map = { good: 'bg-green-500', normal: 'bg-yellow-500', poor: 'bg-red-500' } as const;
  return map[quality] || 'bg-gray-500';
};

export const parseDateSafe = (dateStr: string): Date | null => {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export const getDateDiffDays = (date1: string, date2: string): number => {
  const d1 = parseDateSafe(date1);
  const d2 = parseDateSafe(date2);
  if (!d1 || !d2) return 0;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

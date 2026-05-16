import { useMemo } from 'react';
import { useStore } from '@/store';
import { formatDate } from '@/utils';

export const useWeekStats = (weekOffset: number = 0) => {
  const records = useStore(state => state.records);
  const targetHours = useStore(state => state.user?.targetSleepHours) || 8;
  
  return useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    
    const day = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(formatDate(d));
    }
    
    const weekRecords = weekDates.map((date, index) => {
      const record = records.find(r => r.date === date);
      const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return {
        date,
        dayName: dayNames[index],
        dayNum: new Date(date).getDate(),
        duration: record?.duration || 0,
        hasRecord: !!record,
        quality: record?.quality,
      };
    });
    
    const validRecords = weekRecords.filter(r => r.hasRecord);
    const avgDuration = validRecords.length > 0
      ? Math.round((validRecords.reduce((s, r) => s + r.duration, 0) / validRecords.length) * 10) / 10
      : 0;
    
    const bestDay = validRecords.length > 0
      ? validRecords.reduce((best, current) => 
          current.duration > best.duration ? current : best
        )
      : null;
    
    const targetDays = weekRecords.filter(r => r.hasRecord && r.duration >= targetHours).length;
    const recordedDays = validRecords.length;
    
    return {
      weekRecords,
      weekStart: weekDates[0],
      weekEnd: weekDates[6],
      avgDuration,
      bestDay,
      targetDays,
      recordedDays,
      targetHours,
    };
  }, [records, weekOffset, targetHours]);
};

export const useOverallStats = () => {
  const records = useStore(state => state.records);
  const targetHours = useStore(state => state.user?.targetSleepHours) || 8;
  
  return useMemo(() => {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        avgDuration: 0,
        totalHours: 0,
        bestStreak: 0,
        currentStreak: 0,
        goodDays: 0,
        goodRate: 0,
      };
    }
    
    const totalHours = records.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalHours / records.length;
    const goodDays = records.filter(r => r.duration >= targetHours).length;
    const goodRate = Math.round((goodDays / records.length) * 100);
    
    const sortedDates = [...new Set(records.map(r => r.date))].sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      
      if (sortedDates.includes(dateStr)) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }
    
    return {
      totalRecords: records.length,
      avgDuration: Math.round(avgDuration * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10,
      bestStreak,
      currentStreak,
      goodDays,
      goodRate,
    };
  }, [records, targetHours]);
};

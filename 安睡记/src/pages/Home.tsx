import { useState, useMemo, useCallback } from 'react';
import { Moon, Sun, Clock, Plus, Check, TrendingUp, Target, Sparkles } from 'lucide-react';
import { useStore } from '@/store';
import { formatDate, calculateDuration, formatDuration, getSleepQuality, getQualityText, getQualityColor, generateId } from '@/utils';

export default function Home() {
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{ id: string; date: string } | null>(null);
  
  const user = useStore(state => state.user);
  const records = useStore(state => state.records);
  const addRecord = useStore(state => state.addRecord);
  const getRecordByDate = useStore(state => state.getRecordByDate);
  
  const today = formatDate();
  const todayRecord = getRecordByDate(today);
  const duration = calculateDuration(bedTime, wakeTime);
  const quality = getSleepQuality(duration);
  const targetHours = user?.targetSleepHours || 8;
  
  const weekStats = useMemo(() => {
    const now = new Date();
    const thisWeekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      const diffDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    });
    
    const avgDuration = thisWeekRecords.length > 0
      ? (thisWeekRecords.reduce((sum, r) => sum + r.duration, 0) / thisWeekRecords.length).toFixed(1)
      : '0';
    
    const goodDays = thisWeekRecords.filter(r => r.duration >= targetHours).length;
    
    return { avgDuration, goodDays };
  }, [records, targetHours]);
  
  const handleEditToday = useCallback(() => {
    if (todayRecord) {
      setBedTime(todayRecord.bedTime);
      setWakeTime(todayRecord.wakeTime);
      setEditingRecord({ id: todayRecord.id, date: todayRecord.date });
    } else {
      setBedTime('22:30');
      setWakeTime('07:00');
      setEditingRecord({ id: generateId(), date: today });
    }
    setShowAddForm(true);
  }, [todayRecord, today]);
  
  const handleSave = useCallback(() => {
    if (editingRecord) {
      addRecord({
        id: editingRecord.id,
        date: editingRecord.date,
        bedTime,
        wakeTime,
        duration,
        quality,
      });
    }
    setShowAddForm(false);
    setEditingRecord(null);
  }, [editingRecord, bedTime, wakeTime, duration, quality, addRecord]);
  
  const handleCloseForm = useCallback(() => {
    setShowAddForm(false);
    setEditingRecord(null);
  }, []);
  
  const currentDateText = new Date().toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  return (
    <div className="min-h-full bg-gradient-to-b from-sleep-dark via-sleep-deep to-sleep-medium relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <div className="px-5 pt-12 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold text-white mb-1">晚安，{user?.nickname || '朋友'}</h1>
              <p className="text-white/50 text-sm">{currentDateText}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400/80 to-primary-600/80 flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/10">
              <Moon size={22} className="text-white" fill="white" fillOpacity={0.3} />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="card-glass p-6">
            <h2 className="text-white font-semibold text-lg mb-5 flex items-center">
              <Clock size={20} className="mr-2 text-primary-400" />
              今日睡眠
            </h2>
            
            {todayRecord ? (
              <div className="animate-fade-in">
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <div className="card-soft p-4.5">
                    <p className="text-white/40 text-xs mb-1.5">入睡时间</p>
                    <p className="text-white text-2xl font-bold">{todayRecord.bedTime}</p>
                  </div>
                  <div className="card-soft p-4.5">
                    <p className="text-white/40 text-xs mb-1.5">起床时间</p>
                    <p className="text-white text-2xl font-bold">{todayRecord.wakeTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between card-soft p-5 mb-5">
                  <div>
                    <p className="text-white/40 text-xs mb-1.5">睡眠时长</p>
                    <p className="text-white text-3xl font-bold">{formatDuration(todayRecord.duration)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${
                    todayRecord.quality === 'good' ? 'bg-green-500/15' :
                    todayRecord.quality === 'normal' ? 'bg-yellow-500/15' : 'bg-red-500/15'
                  }`}>
                    <span className={`font-semibold text-sm ${
                      todayRecord.quality === 'good' ? 'text-green-400' :
                      todayRecord.quality === 'normal' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {getQualityText(todayRecord.quality || 'normal')}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleEditToday}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  重新记录
                </button>
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Moon size={36} className="text-white/30" />
                </div>
                <p className="text-white/60 mb-2 text-base">还没有记录今日睡眠</p>
                <p className="text-white/40 text-sm mb-6">点击下方按钮开始记录</p>
                <button
                  onClick={handleEditToday}
                  className="btn-primary px-8 flex items-center gap-2 inline-flex"
                >
                  <Plus size={20} />
                  记录睡眠
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-24">
          <h3 className="text-white/70 text-sm font-medium mb-3 px-1">本周概览</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="card-soft p-4 text-center">
              <TrendingUp size={20} className="mx-auto mb-2 text-primary-400" />
              <p className="text-white/40 text-xs mb-1">本周平均</p>
              <p className="text-white font-bold text-xl">{weekStats.avgDuration}h</p>
            </div>
            <div className="card-soft p-4 text-center">
              <Target size={20} className="mx-auto mb-2 text-green-400" />
              <p className="text-white/40 text-xs mb-1">达标天数</p>
              <p className="text-white font-bold text-xl">{weekStats.goodDays}天</p>
            </div>
            <div className="card-soft p-4 text-center">
              <Sparkles size={20} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-white/40 text-xs mb-1">目标时长</p>
              <p className="text-white font-bold text-xl">{targetHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50 animate-fade-in" onClick={handleCloseForm}>
          <div className="w-full bg-sleep-deep/95 backdrop-blur-soft rounded-t-[2rem] p-6 pb-10 border-t border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <h3 className="text-white text-xl font-bold mb-6 text-center">
              {todayRecord ? '编辑今日睡眠' : '记录今日睡眠'}
            </h3>
            
            <div className="space-y-5 mb-8">
              <div className="space-y-2.5">
                <label className="text-white/60 text-sm font-medium ml-1">入睡时间</label>
                <div className="input-field">
                  <Moon size={20} className="text-primary-400 mr-3" />
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="input-text text-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-white/60 text-sm font-medium ml-1">起床时间</label>
                <div className="input-field">
                  <Sun size={20} className="text-yellow-400 mr-3" />
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="input-text text-xl"
                  />
                </div>
              </div>
              
              <div className="card-soft p-5">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">预计睡眠时长</span>
                  <span className="text-white text-xl font-bold">{formatDuration(duration)}</span>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(quality)} bg-white/5`}>
                    {getQualityText(quality)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCloseForm}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

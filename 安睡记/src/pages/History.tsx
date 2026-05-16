import { useState, useMemo, useCallback } from 'react';
import { Moon, Sun, Edit3, Trash2, Calendar, Search, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import { formatDuration, getQualityText, getQualityColor, calculateDuration, getSleepQuality } from '@/utils';
import { SleepRecord } from '@/types';

export default function History() {
  const records = useStore(state => state.records);
  const updateRecord = useStore(state => state.updateRecord);
  const deleteRecord = useStore(state => state.deleteRecord);
  
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [editBedTime, setEditBedTime] = useState('');
  const [editWakeTime, setEditWakeTime] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const months = useMemo(() => {
    const monthSet = new Set(records.map(r => r.date.slice(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [records]);
  
  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (filterMonth) {
      result = result.filter(r => r.date.startsWith(filterMonth));
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, filterMonth]);
  
  const groupedRecords = useMemo(() => {
    const groups: Record<string, SleepRecord[]> = {};
    filteredRecords.forEach(record => {
      const month = record.date.slice(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const formatMonth = useCallback((monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${year}年${parseInt(month)}月`;
  }, []);

  const handleStartEdit = useCallback((record: SleepRecord) => {
    setEditingRecord(record);
    setEditBedTime(record.bedTime);
    setEditWakeTime(record.wakeTime);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingRecord) {
      const duration = calculateDuration(editBedTime, editWakeTime);
      updateRecord(editingRecord.id, {
        bedTime: editBedTime,
        wakeTime: editWakeTime,
        duration,
        quality: getSleepQuality(duration),
      });
    }
    setEditingRecord(null);
  }, [editingRecord, editBedTime, editWakeTime, updateRecord]);

  const handleDelete = useCallback((id: string) => {
    deleteRecord(id);
    setShowDeleteConfirm(null);
  }, [deleteRecord]);

  const editDuration = useMemo(() => {
    return calculateDuration(editBedTime, editWakeTime);
  }, [editBedTime, editWakeTime]);

  const editQuality = useMemo(() => {
    return getSleepQuality(editDuration);
  }, [editDuration]);

  return (
    <div className="min-h-full bg-gradient-to-b from-sleep-dark via-sleep-deep to-sleep-medium relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-500/5 to-transparent" />
      </div>
      
      <div className="relative z-10">
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">历史记录</h1>
          <p className="text-white/50 text-sm">查看和管理所有睡眠记录</p>
        </div>

        <div className="px-5 pb-4">
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="w-full flex items-center justify-between card-soft p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary-400" />
                <span className="text-white">{filterMonth ? formatMonth(filterMonth) : '全部月份'}</span>
              </div>
              <ChevronDown size={18} className={`text-white/40 transition-transform duration-300 ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>
            
            {showMonthPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-sleep-deep/95 backdrop-blur-soft border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl animate-fade-in-up">
                <button
                  onClick={() => {
                    setFilterMonth('');
                    setShowMonthPicker(false);
                  }}
                  className={`w-full px-4 py-3.5 text-left text-white/80 hover:bg-white/5 transition-colors ${
                    !filterMonth ? 'bg-white/10' : ''
                  }`}
                >
                  全部月份
                </button>
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => {
                      setFilterMonth(month);
                      setShowMonthPicker(false);
                    }}
                    className={`w-full px-4 py-3.5 text-left text-white/80 hover:bg-white/5 transition-colors ${
                      filterMonth === month ? 'bg-white/10' : ''
                    }`}
                  >
                    {formatMonth(month)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-24">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Search size={32} className="text-white/30" />
              </div>
              <p className="text-white/50 mb-1">暂无睡眠记录</p>
              <p className="text-white/30 text-sm">快去首页记录你的睡眠吧</p>
            </div>
          ) : (
            Object.entries(groupedRecords).map(([month, monthRecords]) => (
              <div key={month} className="mb-6 animate-fade-in-up">
                <h3 className="text-white/60 text-sm font-medium mb-3 px-1">
                  {formatMonth(month)} · {monthRecords.length}条记录
                </h3>
                <div className="space-y-3">
                  {monthRecords.map(record => (
                    <div
                      key={record.id}
                      className="card-glass p-4.5 transition-all duration-200 hover:bg-white/[0.09]"
                    >
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-white font-semibold">{record.date}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(record)}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(record.id)}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="card-soft p-3">
                          <div className="flex items-center gap-1 mb-1.5">
                            <Moon size={12} className="text-primary-400" />
                            <span className="text-white/40 text-xs">入睡</span>
                          </div>
                          <span className="text-white font-bold">{record.bedTime}</span>
                        </div>
                        <div className="card-soft p-3">
                          <div className="flex items-center gap-1 mb-1.5">
                            <Sun size={12} className="text-yellow-400" />
                            <span className="text-white/40 text-xs">起床</span>
                          </div>
                          <span className="text-white font-bold">{record.wakeTime}</span>
                        </div>
                        <div className="card-soft p-3">
                          <div className="flex items-center gap-1 mb-1.5">
                            <span className="text-white/40 text-xs">时长</span>
                          </div>
                          <span className="text-white font-bold">{record.duration.toFixed(1)}h</span>
                        </div>
                      </div>
                      
                      <div className="mt-3.5 flex items-center justify-between">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          record.quality === 'good' ? 'bg-green-500/15 text-green-400' :
                          record.quality === 'normal' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {getQualityText(record.quality || 'normal')}
                        </span>
                        <span className="text-white/40 text-xs">
                          {formatDuration(record.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50 animate-fade-in" onClick={() => setEditingRecord(null)}>
          <div className="w-full bg-sleep-deep/95 backdrop-blur-soft rounded-t-[2rem] p-6 pb-10 border-t border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <h3 className="text-white text-xl font-bold mb-6 text-center">编辑睡眠记录</h3>
            
            <div className="space-y-5 mb-8">
              <div className="space-y-2.5">
                <label className="text-white/60 text-sm font-medium ml-1">入睡时间</label>
                <div className="input-field">
                  <Moon size={20} className="text-primary-400 mr-3" />
                  <input
                    type="time"
                    value={editBedTime}
                    onChange={(e) => setEditBedTime(e.target.value)}
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
                    value={editWakeTime}
                    onChange={(e) => setEditWakeTime(e.target.value)}
                    className="input-text text-xl"
                  />
                </div>
              </div>
              
              <div className="card-soft p-5">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">预计睡眠时长</span>
                  <span className="text-white text-xl font-bold">{formatDuration(editDuration)}</span>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(editQuality)} bg-white/5`}>
                    {getQualityText(editQuality)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-sleep-deep/95 backdrop-blur-soft rounded-3xl p-6 mx-4 max-w-sm w-full border border-white/10 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 size={32} className="text-red-400" />
            </div>
            <h3 className="text-white text-xl font-bold text-center mb-2">确认删除</h3>
            <p className="text-white/50 text-center mb-6">删除后将无法恢复，确定要删除这条记录吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-red-500/20"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

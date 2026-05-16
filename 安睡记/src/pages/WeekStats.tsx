import { useState, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, Target, Award } from 'lucide-react';
import { useWeekStats } from '@/hooks/useSleepStats';
import { getDayName, getQualityText, getQualityColor } from '@/utils';
import ChartTooltip from '@/components/ChartTooltip';

export default function WeekStats() {
  const [weekOffset, setWeekOffset] = useState(0);
  
  const {
    weekRecords,
    weekStart,
    weekEnd,
    avgDuration,
    bestDay,
    targetDays,
    recordedDays,
    targetHours,
  } = useWeekStats(weekOffset);
  
  const formatWeekRange = useCallback(() => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getDate()}日`;
    }
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  }, [weekStart, weekEnd]);
  
  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return '本周';
    if (weekOffset === -1) return '上周';
    return `${Math.abs(weekOffset)}周前`;
  }, [weekOffset]);

  return (
    <div className="min-h-full bg-gradient-to-b from-sleep-dark via-sleep-deep to-sleep-medium relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="absolute top-40 left-10 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">周统计</h1>
          <p className="text-white/50 text-sm">查看睡眠趋势和每周数据</p>
        </div>

        <div className="px-5 pb-4">
          <div className="flex items-center justify-between card-glass p-4">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <p className="text-white font-semibold">{formatWeekRange()}</p>
              <p className="text-white/50 text-xs">{weekLabel}</p>
            </div>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card-soft p-4 text-center">
              <TrendingUp size={20} className="mx-auto mb-2 text-primary-400" />
              <p className="text-white/50 text-xs mb-1">平均睡眠</p>
              <p className="text-white font-bold text-xl">{avgDuration.toFixed(1)}h</p>
            </div>
            <div className="card-soft p-4 text-center">
              <Target size={20} className="mx-auto mb-2 text-green-400" />
              <p className="text-white/50 text-xs mb-1">达标天数</p>
              <p className="text-white font-bold text-xl">{targetDays}天</p>
            </div>
            <div className="card-soft p-4 text-center">
              <Award size={20} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-white/50 text-xs mb-1">记录天数</p>
              <p className="text-white font-bold text-xl">{recordedDays}天</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="card-glass p-5">
            <h3 className="text-white font-semibold mb-4">睡眠时长趋势</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorPoor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="dayNum" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 12]}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine 
                    y={targetHours} 
                    stroke="rgba(34, 197, 94, 0.5)" 
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{ value: '目标', fill: 'rgba(34, 197, 94, 0.8)', fontSize: 11, position: 'right' }}
                  />
                  <Bar 
                    dataKey="duration" 
                    radius={[8, 8, 0, 0]}
                    fill={function(data: any) {
                      if (!data.hasRecord) return 'rgba(255,255,255,0.08)';
                      if (data.duration >= targetHours) return 'url(#colorGood)';
                      if (data.duration >= 6) return 'url(#colorNormal)';
                      return 'url(#colorPoor)';
                    } as any}
                    maxBarSize={36}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
                <span className="text-white/50 text-xs">达标</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-yellow-400 to-yellow-600" />
                <span className="text-white/50 text-xs">一般</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-b from-red-400 to-red-600" />
                <span className="text-white/50 text-xs">不足</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-24">
          <div className="card-glass p-5">
            <h3 className="text-white font-semibold mb-4">每日详情</h3>
            <div className="space-y-2.5">
              {weekRecords.map((day) => {
                const hasRecord = day.hasRecord;
                const isGood = day.duration >= targetHours;
                const isNormal = day.duration >= 6;
                const rowBgClass = hasRecord ? 'bg-white/[0.03]' : 'bg-white/[0.01]';
                const dotBgClass = hasRecord 
                  ? (isGood ? 'bg-green-500/15 border border-green-500/20' 
                     : (isNormal ? 'bg-yellow-500/15 border border-yellow-500/20' 
                        : 'bg-red-500/15 border border-red-500/20'))
                  : 'bg-white/[0.03] border border-white/[0.05]';
                const textColorClass = hasRecord ? 'text-white' : 'text-white/30';
                
                return (
                  <div 
                    key={day.date} 
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-white/[0.03] ${rowBgClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${dotBgClass}`}>
                        <span className={`text-sm font-medium ${textColorClass}`}>
                          {day.dayNum}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{getDayName(day.date)}</p>
                        <p className="text-white/40 text-xs">{day.date}</p>
                      </div>
                    </div>
                    {hasRecord ? (
                      <div className="text-right">
                        <p className="text-white font-bold">{day.duration.toFixed(1)}h</p>
                        {day.quality && (
                          <p className={`text-xs ${getQualityColor(day.quality)}`}>
                            {getQualityText(day.quality)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/30 text-sm">未记录</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {bestDay && (
            <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-soft rounded-3xl p-5 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <Award size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-yellow-400 text-sm font-medium">本周最佳睡眠</p>
                  <p className="text-white font-bold">
                    {getDayName(bestDay.date)} 睡了 {bestDay.duration.toFixed(1)} 小时
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

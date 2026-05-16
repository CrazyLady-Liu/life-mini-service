import { memo } from 'react';
import { getQualityColor, getQualityText } from '@/utils';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: any }>;
}

const ChartTooltip = memo(({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.hasRecord) {
      return (
        <div className="bg-sleep-deep border border-white/10 rounded-xl p-3 text-white text-sm shadow-xl">
          <p className="text-white/60">{data.dayName}</p>
          <p>暂无记录</p>
        </div>
      );
    }
    return (
      <div className="bg-sleep-deep border border-white/10 rounded-xl p-3 text-white text-sm shadow-xl">
        <p className="text-white/60">{data.dayName}</p>
        <p className="text-lg font-bold">{data.duration.toFixed(1)} 小时</p>
        {data.quality && (
          <p className={getQualityColor(data.quality)}>{getQualityText(data.quality)}</p>
        )}
      </div>
    );
  }
  return null;
});

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;

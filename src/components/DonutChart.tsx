import React, { useState } from 'react';

export interface DonutItem {
  id: string | number;
  label: string;
  subLabel?: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title?: string;
  subtitle?: string;
  data: DonutItem[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  subtitle,
  data,
  centerLabel = 'Total',
  centerValue,
  size = 200,
  strokeWidth = 26,
  showLegend = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment angles
  let accumulatedPercent = 0;
  const segments = data.map((item, idx) => {
    const percent = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...item,
      idx,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;
  const displayValue = activeItem
    ? activeItem.value
    : centerValue !== undefined
    ? centerValue
    : total;
  const displayLabel = activeItem
    ? activeItem.label
    : centerLabel;
  const displayPercent = activeItem && total > 0
    ? `${((activeItem.value / total) * 100).toFixed(1)}%`
    : null;

  return (
    <div className="flex flex-col">
      {title && (
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 origin-center"
          >
            {/* Background empty ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {total === 0 ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                strokeDasharray="4 4"
              />
            ) : (
              segments.map((seg) => {
                if (seg.value === 0) return null;
                const isHovered = hoveredIdx === seg.idx;
                return (
                  <circle
                    key={seg.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(seg.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })
            )}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {displayValue}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate max-w-[120px] mt-0.5">
              {displayLabel}
            </span>
            {displayPercent && (
              <span className="text-xs font-semibold text-emerald-600 font-mono tabular-nums mt-0.5">
                {displayPercent}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 w-full space-y-2 min-w-[160px]">
            {data.map((item, idx) => {
              const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                    isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="font-medium text-slate-800 truncate block">{item.label}</span>
                      {item.subLabel && (
                        <span className="text-[10px] text-slate-500 truncate block">{item.subLabel}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-right">
                    <span className="font-semibold text-slate-900">{item.value}</span>
                    <span className="text-slate-500 w-11 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

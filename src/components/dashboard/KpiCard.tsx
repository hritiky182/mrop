import React from 'react';
import * as Icons from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  comparison?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPositive?: boolean; // is up positive?
  iconName?: keyof typeof Icons;
  statusBadge?: React.ReactNode;
  subtitle?: string;
  accent?: 'copper' | 'navy' | 'emerald' | 'amber' | 'rose' | 'default';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  comparison,
  trend,
  trendPositive = true,
  iconName = 'Activity',
  statusBadge,
  subtitle,
  accent = 'default',
  onClick,
}) => {
  // Dynamically resolve icon from Lucide
  const IconComponent = (Icons[iconName] as React.ElementType) || Icons.Activity;

  const accentStyles = {
    copper: 'border-l-4 border-l-copper-500',
    navy: 'border-l-4 border-l-navy-800',
    emerald: 'border-l-4 border-l-emerald-600',
    amber: 'border-l-4 border-l-amber-500',
    rose: 'border-l-4 border-l-rose-500',
    default: 'border-l-4 border-l-slate-300',
  };

  const iconColors = {
    copper: 'text-copper-600 bg-copper-50',
    navy: 'text-navy-700 bg-navy-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    rose: 'text-rose-700 bg-rose-50',
    default: 'text-slate-600 bg-slate-100',
  };

  let trendColor = 'text-slate-500';
  if (trend === 'up') {
    trendColor = trendPositive ? 'text-emerald-600' : 'text-rose-600';
  } else if (trend === 'down') {
    trendColor = trendPositive ? 'text-rose-600' : 'text-emerald-600';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-5 border border-slate-200/80 shadow-card transition-all duration-150 ${accentStyles[accent]} ${
        onClick ? 'cursor-pointer hover:shadow-card-hover hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg shrink-0 ${iconColors[accent]}`}>
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          {trend && (
            <span className={`font-semibold inline-flex items-center gap-0.5 ${trendColor}`}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
            </span>
          )}
          {comparison && (
            <span className="text-slate-600 truncate font-medium">{comparison}</span>
          )}
          {subtitle && !comparison && (
            <span className="text-slate-500 truncate">{subtitle}</span>
          )}
        </div>

        {statusBadge && <div className="shrink-0">{statusBadge}</div>}
      </div>
    </div>
  );
};

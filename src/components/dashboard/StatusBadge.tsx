import React from 'react';

export type StatusVariant =
  | 'operational'
  | 'warning'
  | 'critical'
  | 'info'
  | 'idle'
  | 'completed'
  | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  dot = true,
}) => {
  // Determine variant based on string if not explicitly passed
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    const s = status.toLowerCase();
    if (s.includes('operational') || s.includes('passed') || s.includes('verified') || s.includes('completed') || s.includes('compliant') || s.includes('approved') || s.includes('in stock') || s.includes('on track')) {
      resolvedVariant = 'operational';
    } else if (s.includes('warning') || s.includes('low stock') || s.includes('action required') || s.includes('pending') || s.includes('at risk') || s.includes('delayed') || s.includes('variance high') || s.includes('marked for review')) {
      resolvedVariant = 'warning';
    } else if (s.includes('critical') || s.includes('fault') || s.includes('out of stock') || s.includes('immediate') || s.includes('emergency') || s.includes('offline') || s.includes('rejected') || s.includes('unmitigated')) {
      resolvedVariant = 'critical';
    } else if (s.includes('scheduled') || s.includes('in progress') || s.includes('processing') || s.includes('submitted')) {
      resolvedVariant = 'info';
    } else if (s.includes('idle') || s.includes('on hold')) {
      resolvedVariant = 'idle';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  const styles: Record<StatusVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    operational: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      dotColor: 'bg-emerald-500',
      border: 'border-emerald-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dotColor: 'bg-amber-500',
      border: 'border-amber-200',
    },
    critical: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      dotColor: 'bg-rose-500',
      border: 'border-rose-200',
    },
    info: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      dotColor: 'bg-sky-500',
      border: 'border-sky-200',
    },
    idle: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      dotColor: 'bg-slate-400',
      border: 'border-slate-200',
    },
    completed: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      dotColor: 'bg-teal-500',
      border: 'border-teal-200',
    },
    neutral: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      dotColor: 'bg-gray-400',
      border: 'border-gray-200',
    },
  };

  const current = styles[resolvedVariant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${current.dotColor}`} />}
      {status}
    </span>
  );
};

import React from 'react';

interface LoadingStateProps {
  rows?: number;
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  rows = 4,
  message = 'Loading operational telemetry...',
}) => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-copper-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-500">{message}</span>
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-md w-full" />
        ))}
      </div>
    </div>
  );
};

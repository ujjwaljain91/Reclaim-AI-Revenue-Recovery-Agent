'use client';

import React from 'react';

interface RecoveryScoreBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RecoveryScoreBadge: React.FC<RecoveryScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getColor = (s: number) => {
    if (s >= 75) return 'bg-success-50 text-success-700 border-success-200';
    if (s >= 50) return 'bg-warning-50 text-warning-700 border-warning-200';
    return 'bg-danger-50 text-danger-700 border-danger-200';
  };

  const getDotColor = (s: number) => {
    if (s >= 75) return 'bg-success-500';
    if (s >= 50) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border tabular-nums ${getColor(
        score
      )} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(score)}`} />
      <span>{score}%</span>
      {showLabel && <span className="font-normal opacity-90">probability</span>}
    </span>
  );
};

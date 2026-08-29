'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-white border-neutral-200 text-neutral-900',
    brand: 'bg-white border-brand-200 text-brand-900',
    success: 'bg-white border-success-200 text-success-900',
    warning: 'bg-white border-warning-200 text-warning-900',
    danger: 'bg-white border-danger-200 text-danger-900',
  };

  const iconStyles = {
    default: 'bg-neutral-100 text-neutral-600',
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <div
      className={cn(
        'p-4 md:p-5 rounded-lg border shadow-card flex flex-col justify-between transition-all hover:shadow-card-hover',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-1.5 rounded-md', iconStyles[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
          {value}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center font-medium px-1.5 py-0.5 rounded text-[11px]',
                trend.isPositive
                  ? 'text-success-700 bg-success-50'
                  : 'text-neutral-600 bg-neutral-100'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-neutral-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { formatINR, formatINRFull } from '@/lib/utils';
import { useReclaim } from '@/context/ReclaimContext';

interface HeroMetricCardProps {
  onOpenBatchSim?: () => void;
}

export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({ onOpenBatchSim }) => {
  const { kpis } = useReclaim();

  return (
    <div className="bg-white border-2 border-success-500/30 rounded-xl p-5 md:p-6 shadow-card relative overflow-hidden">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-success-500" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Hero Metric */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-success-50 text-success-700 border border-success-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PRIMARY REVENUE OBJECTIVE
            </span>
            <span className="text-xs text-neutral-400">· Past 30 days</span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-success-600 tracking-tight tabular-nums">
              {formatINR(kpis.recovered)}
            </h2>
            <span className="text-lg md:text-xl font-bold text-neutral-800">
              recovered
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-success-600 font-semibold bg-success-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3" />
              +{kpis.trendVsLastMonth}%
            </span>
            <span className="text-neutral-500">
              vs previous month ({formatINR(kpis.recovered * 0.82)})
            </span>
          </div>
        </div>

        {/* Right: Quick Recovery Summary & Action */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
          <div className="text-left md:text-right">
            <span className="text-xs text-neutral-500 block">Overall Recovery Rate</span>
            <span className="text-xl font-bold text-neutral-900 tabular-nums">
              {kpis.recoveryRate}%
            </span>
            <span className="text-[11px] text-neutral-400 block">
              of entered at-risk revenue
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium hidden lg:inline">
              Active Agent Loop:
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded text-xs font-semibold text-neutral-700">
              <Zap className="w-3 h-3 text-brand-600" />
              {kpis.actionsTaken} bounded actions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

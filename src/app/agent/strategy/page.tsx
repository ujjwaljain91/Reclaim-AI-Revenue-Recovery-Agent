'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Bot,
  ShieldCheck,
  CreditCard,
  ShoppingCart,
  FileText,
  Filter,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { StrategyComparison } from '@/components/reclaim/StrategyComparison';
import { formatINR, formatINRFull } from '@/lib/utils';
import { RevenueType } from '@/lib/types';

export default function AgentStrategyPage() {
  const { cases } = useReclaim();
  const [surfaceFilter, setSurfaceFilter] = useState<'all' | RevenueType>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');

  const activeCases = cases.filter((c) => c.status === 'at_risk' || c.status === 'recovering');
  const filteredCases = surfaceFilter === 'all'
    ? activeCases
    : activeCases.filter((c) => c.revenueType === surfaceFilter);

  const currentSelectedCase = cases.find((c) => c.id === selectedCaseId) || filteredCases[0] || cases[0];

  const totalExpectedValue = activeCases.reduce((sum, c) => {
    const erv = c.decision?.expectedRecoveryValue || Math.round(c.amount * (c.recoveryProbability / 100));
    return sum + erv;
  }, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
              Recovery Strategy Optimization
            </h1>
          </div>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Real-time Expected Recovery Value (ERV) engine ranking interventions across all active cases.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-xs text-xs font-semibold text-neutral-700">
          <span>Total Pipeline ERV:</span>
          <span className="text-success-700 font-extrabold">{formatINRFull(totalExpectedValue)}</span>
        </div>
      </div>

      {/* Surface Filter Bar */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-neutral-200 shadow-xs">
        <span className="text-xs font-semibold text-neutral-500 pl-2">Filter Surface:</span>
        {(['all', 'payment', 'checkout', 'receivable'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSurfaceFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors capitalize cursor-pointer ${
              surfaceFilter === s
                ? 'bg-brand-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {s === 'all' ? 'All Surfaces' : s}
          </button>
        ))}
      </div>

      {/* Main Grid: Selected Case Strategy Detail & Case Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Strategy Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {currentSelectedCase ? (
            <>
              {/* Selected Case Summary Header */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Evaluating Case
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="text-base md:text-lg font-bold text-neutral-900">
                      {currentSelectedCase.customer.company}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {currentSelectedCase.rootCause}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-500">Amount at Risk</span>
                  <div className="text-lg font-extrabold text-neutral-900 tabular-nums">
                    {formatINRFull(currentSelectedCase.amount)}
                  </div>
                </div>
              </div>

              {/* Strategy Comparison Component */}
              <StrategyComparison
                recoveryCase={currentSelectedCase}
                showAllAlternatives={true}
              />

              <div className="flex justify-end">
                <Link
                  href={`/recovery/${currentSelectedCase.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs border border-brand-200 transition-colors"
                >
                  <span>Open Full Case Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-neutral-200 text-xs text-neutral-500">
              No active cases for this surface filter.
            </div>
          )}
        </div>

        {/* Right Col: Active Cases Queue List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Active Strategy Queue ({filteredCases.length})
            </h3>
            <span className="text-[11px] text-neutral-400">Select to inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === currentSelectedCase?.id;
              const erv = c.decision?.expectedRecoveryValue || Math.round(c.amount * (c.recoveryProbability / 100));

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-brand-50/80 border-brand-400 ring-2 ring-brand-500/20 shadow-xs'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 text-xs block">
                        {c.customer.company}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {c.revenueType.toUpperCase()} · {c.rootCause}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-neutral-900 tabular-nums">
                      {formatINR(c.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                    <span className="text-neutral-500 font-medium truncate max-w-[140px]">
                      {c.decision?.recommendedAction || c.recommendedAction}
                    </span>
                    <span className="font-extrabold text-success-700 tabular-nums">
                      ERV: {formatINR(erv)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

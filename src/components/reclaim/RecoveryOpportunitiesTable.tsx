'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { RecoveryCase } from '@/lib/types';
import { formatINR, formatINRFull } from '@/lib/utils';
import { RecoveryScoreBadge } from './RecoveryScoreBadge';
import { useReclaim } from '@/context/ReclaimContext';

interface RecoveryOpportunitiesTableProps {
  cases: RecoveryCase[];
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
}

export const RecoveryOpportunitiesTable: React.FC<RecoveryOpportunitiesTableProps> = ({
  cases,
  title = 'Top Recovery Opportunities',
  subtitle = 'Prioritized by recovery probability and financial impact',
  limit,
  showViewAll = true,
}) => {
  const { executeStepOnCase } = useReclaim();
  const displayCases = limit ? cases.slice(0, limit) : cases;

  const getStatusBadge = (status: RecoveryCase['status']) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200">
            <CheckCircle2 className="w-3 h-3" />
            Recovered
          </span>
        );
      case 'recovering':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            <Clock className="w-3 h-3 animate-spin" />
            Recovering
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning-50 text-warning-700 border border-warning-200">
            <AlertTriangle className="w-3 h-3" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning-50 text-warning-800 border border-warning-200">
            <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
            At risk
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>

        {showViewAll && (
          <Link
            href="/recovery"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors"
          >
            <span>View all cases</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
              <th className="py-3 px-5">Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Recovery Probability</th>
              <th className="py-3 px-4">Recommended Action</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {displayCases.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-neutral-50/80 transition-colors group"
              >
                {/* Customer */}
                <td className="py-3.5 px-5">
                  <Link href={`/recovery/${c.id}`} className="block focus:outline-none">
                    <div className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                      <span>{c.customer.company}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-brand-600 transition-opacity" />
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {c.customer.customerType} · LTV ₹{(c.customer.lifetimeValue / 100000).toFixed(1)}L
                    </span>
                  </Link>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 font-bold text-neutral-900 tabular-nums">
                  {formatINRFull(c.amount)}
                </td>

                {/* Failure Reason */}
                <td className="py-3.5 px-4 text-neutral-600 font-medium">
                  {c.rootCause}
                </td>

                {/* Recovery Probability */}
                <td className="py-3.5 px-4">
                  <RecoveryScoreBadge score={c.recoveryProbability} size="sm" />
                </td>

                {/* Recommended Action */}
                <td className="py-3.5 px-4 text-neutral-700 max-w-xs truncate font-medium">
                  {c.recommendedAction}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(c.status)}
                </td>

                {/* Action CTA */}
                <td className="py-3.5 px-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {c.status === 'at_risk' && (
                      <button
                        onClick={() => executeStepOnCase(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded text-xs font-semibold border border-brand-200 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Reclaim</span>
                      </button>
                    )}
                    <Link
                      href={`/recovery/${c.id}`}
                      className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs font-medium transition-colors"
                    >
                      Investigate
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden divide-y divide-neutral-100">
        {displayCases.map((c) => (
          <div key={c.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/recovery/${c.id}`}
                  className="font-bold text-neutral-900 text-sm hover:text-brand-600"
                >
                  {c.customer.company}
                </Link>
                <div className="text-xs text-neutral-400 mt-0.5">
                  {c.rootCause} · LTV ₹{(c.customer.lifetimeValue / 100000).toFixed(1)}L
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-neutral-900 tabular-nums block">
                  {formatINRFull(c.amount)}
                </span>
                <div className="mt-1">{getStatusBadge(c.status)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-lg text-xs">
              <span className="text-neutral-500 font-medium truncate max-w-[200px]">
                {c.recommendedAction}
              </span>
              <RecoveryScoreBadge score={c.recoveryProbability} size="sm" showLabel={false} />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/recovery/${c.id}`}
                className="flex-1 text-center py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-xs font-semibold transition-colors min-h-[44px] flex items-center justify-center"
              >
                View Case
              </Link>
              {c.status === 'at_risk' && (
                <button
                  onClick={() => executeStepOnCase(c.id)}
                  className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Let Reclaim Act</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

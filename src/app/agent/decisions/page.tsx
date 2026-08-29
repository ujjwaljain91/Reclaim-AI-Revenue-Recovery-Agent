'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitBranch,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { RecoveryScoreBadge } from '@/components/reclaim/RecoveryScoreBadge';
import { formatINR, formatINRFull, formatTimeAgo, formatPaymentRef } from '@/lib/utils';

export default function AgentDecisionsPage() {
  const { cases } = useReclaim();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
            Agent Decision Log
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Transparent record of all AI decisions, decision rationales, and verified financial outcomes.
          </p>
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {cases.map((c) => {
          const decision = c.decision;
          const isRecovered = c.status === 'recovered';
          const isEscalated = c.status === 'escalated';

          return (
            <div
              key={c.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all space-y-4"
            >
              {/* Top Row: Case Ref & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-mono font-bold text-xs">
                    AI
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/recovery/${c.id}`}
                        className="font-bold text-neutral-900 text-sm hover:text-brand-600 flex items-center gap-1 transition-colors"
                      >
                        <span>{c.customer.company}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="font-mono text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {formatPaymentRef(c.paymentId)}
                      </span>
                    </div>
                    <span suppressHydrationWarning className="text-xs text-neutral-500">
                      Amount: <strong>{formatINRFull(c.amount)}</strong> · Created {formatTimeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RecoveryScoreBadge score={c.recoveryProbability} size="sm" />
                  {isRecovered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-success-50 text-success-700 border border-success-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Recovered
                    </span>
                  ) : isEscalated ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-warning-50 text-warning-700 border border-warning-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Escalated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Active Decision
                    </span>
                  )}
                </div>
              </div>

              {/* Recommendation & Rationale Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Decision Info */}
                <div className="space-y-1 md:col-span-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block">
                    Decision & Action
                  </span>
                  <p className="text-xs font-bold text-neutral-900">
                    {decision?.recommendedAction || c.recommendedAction}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed pt-1">
                    {decision?.explanation}
                  </p>
                </div>

                {/* Decision Rationale */}
                <div className="space-y-1 md:col-span-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block">
                    Decision Rationale
                  </span>
                  <div className="space-y-1 pt-1">
                    {decision?.rationaleItems && decision.rationaleItems.length > 0 ? (
                      decision.rationaleItems.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-700">
                          {r.passed ? (
                            <Check className="w-3 h-3 text-success-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-warning-600 shrink-0" />
                          )}
                          <span className="truncate">{r.text}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-neutral-500">Standard heuristic evaluation</div>
                    )}
                  </div>
                </div>

                {/* Outcome Box */}
                <div className="space-y-1 md:col-span-1 bg-neutral-50 p-3 rounded-lg border border-neutral-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block">
                      Financial Outcome
                    </span>
                    <p className="text-xs font-semibold text-neutral-900 mt-1">
                      {isRecovered
                        ? `✓ Recovered ${formatINRFull(c.amount)}`
                        : isEscalated
                        ? 'Escalated to human supervisor'
                        : 'Intervention queued within guardrails'}
                    </p>
                  </div>

                  <Link
                    href={`/recovery/${c.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 pt-2"
                  >
                    <span>Inspect Case Timeline</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

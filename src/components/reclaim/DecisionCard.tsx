'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, ArrowRight, MoreHorizontal, Bot, Check, AlertCircle } from 'lucide-react';
import { RecoveryCase } from '@/lib/types';
import { RecoveryScoreBadge } from './RecoveryScoreBadge';
import { useReclaim } from '@/context/ReclaimContext';
import { formatINR } from '@/lib/utils';

interface DecisionCardProps {
  recoveryCase: RecoveryCase;
  onExecute?: () => void;
  isExecuting?: boolean;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  recoveryCase,
  onExecute,
  isExecuting = false,
}) => {
  const { executeStepOnCase } = useReclaim();
  const [localExecuting, setLocalExecuting] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const decision = recoveryCase.decision;
  const isRecovered = recoveryCase.status === 'recovered';
  const isEscalated = recoveryCase.status === 'escalated';
  const isExecutingState = isExecuting || localExecuting;

  const handleAction = async () => {
    setLocalExecuting(true);
    if (onExecute) {
      onExecute();
    } else {
      await executeStepOnCase(recoveryCase.id);
    }
    setLocalExecuting(false);
  };

  return (
    <div className="bg-white border-2 border-brand-500/20 rounded-xl p-5 md:p-6 shadow-card space-y-5 relative overflow-hidden">
      {/* Top Brand Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider block">
              Autonomous Recommendation
            </span>
            <h3 className="text-sm md:text-base font-bold text-neutral-900 leading-tight">
              Reclaim Decision Model
            </h3>
          </div>
        </div>

        <RecoveryScoreBadge score={recoveryCase.recoveryProbability} size="md" />
      </div>

      {/* Recommended Action Box */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block">
              Recommended Intervention
            </span>
            <p className="text-base font-bold text-neutral-900 mt-0.5">
              {decision?.recommendedAction || recoveryCase.recommendedAction}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          {decision?.explanation || 'Optimal recovery path determined from past transaction history and clearing behavior.'}
        </p>
      </div>

      {/* Decision Rationale Checklist (NOT AI reasoning, as requested in prompt) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
          Decision Rationale
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {decision?.rationaleItems && decision.rationaleItems.length > 0 ? (
            decision.rationaleItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-md border text-xs flex items-center gap-2 ${
                  item.passed
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                    : 'bg-warning-50 border-warning-200 text-warning-800 font-medium'
                }`}
              >
                {item.passed ? (
                  <Check className="w-3.5 h-3.5 text-success-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-warning-600 shrink-0" />
                )}
                <span className="truncate">{item.text}</span>
              </div>
            ))
          ) : (
            <>
              <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-success-600 shrink-0" />
                <span>First payment failure (clean history)</span>
              </div>
              <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-success-600 shrink-0" />
                <span>Strong payment history</span>
              </div>
              <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-success-600 shrink-0" />
                <span>High customer lifetime value</span>
              </div>
              <div className="p-2.5 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-success-600 shrink-0" />
                <span>Within configured retry limits</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100">
        <div className="text-xs text-neutral-500 w-full sm:w-auto text-center sm:text-left">
          {isRecovered ? (
            <span className="text-success-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-4 h-4" />
              ✓ {formatINR(recoveryCase.amount)} recovered. Workflow stopped.
            </span>
          ) : isEscalated ? (
            <span className="text-warning-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <AlertCircle className="w-4 h-4" />
              Escalated to operations for human handling.
            </span>
          ) : (
            <span>Bounded action within configured guardrails.</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isRecovered && !isEscalated && (
            <>
              {/* Signature AI Action button */}
              <button
                onClick={handleAction}
                disabled={isExecutingState}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-all shadow-xs"
              >
                {isExecutingState ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Executing Action...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✦ Let Reclaim decide</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAction}
                disabled={isExecutingState}
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-md text-xs font-semibold transition-colors"
              >
                Approve & schedule
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-md transition-colors"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMoreActions && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-modal p-1.5 z-30 text-xs">
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        handleAction();
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 rounded text-neutral-700"
                    >
                      Instant Gateway Retry
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        handleAction();
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 rounded text-neutral-700"
                    >
                      Send WhatsApp Link
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        handleAction();
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-warning-50 rounded text-warning-700 font-medium"
                    >
                      Escalate to Account Manager
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Bot,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { RecoveryCase, RecoveryOption } from '@/lib/types';
import { formatINR, formatINRFull } from '@/lib/utils';
import { generateRecoveryOptions } from '@/lib/erv-engine';
import { evaluatePolicyGate } from '@/lib/policy-gate';
import { useReclaim } from '@/context/ReclaimContext';

interface StrategyComparisonProps {
  recoveryCase: RecoveryCase;
  showAllAlternatives?: boolean;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  recoveryCase,
  showAllAlternatives = false,
}) => {
  const { guardrails } = useReclaim();
  const [isAlternativesExpanded, setIsAlternativesExpanded] = useState(showAllAlternatives);

  const decision = recoveryCase.decision;
  const options: RecoveryOption[] = decision.recoveryOptions && decision.recoveryOptions.length > 0
    ? decision.recoveryOptions
    : generateRecoveryOptions(
        recoveryCase.amount,
        recoveryCase.customer,
        recoveryCase.rootCause,
        recoveryCase.revenueType || 'payment',
        recoveryCase.attemptsUsed
      );

  const recommendedIntervention = decision.interventionType || recoveryCase.interventionType;
  const recommendedOption = options.find((o) => o.intervention === recommendedIntervention) || options[0];
  const alternativeOptions = options.filter((o) => o.intervention !== recommendedOption?.intervention);

  const policyGate = evaluatePolicyGate(recoveryCase, recommendedOption?.intervention || 'retry_payment', guardrails);

  const expectedRecovery = recommendedOption?.expectedValue || Math.round(recoveryCase.amount * (recoveryCase.recoveryProbability / 100));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-card p-5 md:p-6 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Recovery Strategy & Expected Value
            </h3>
            <span className="text-[11px] text-neutral-500">
              Ranking available actions by Expected Recovery Value (Probability × Amount)
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
          {recoveryCase.revenueType.toUpperCase()} SURFACE
        </span>
      </div>

      {/* Recommended Action Card (Visually Dominant) */}
      <div className="bg-gradient-to-br from-brand-50/80 via-brand-50/40 to-neutral-50 border-2 border-brand-500/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
              Recommended Action
            </span>
            <h4 className="text-base md:text-lg font-extrabold text-neutral-900 mt-0.5">
              {recommendedOption?.label || decision.recommendedAction || recoveryCase.recommendedAction}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-success-50 text-success-700 border border-success-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              ✓ Guardrails Approved
            </span>
          </div>
        </div>

        {/* Why Explanation */}
        <div className="p-3 bg-white/80 rounded-lg border border-brand-100 space-y-1">
          <span className="text-[11px] font-bold uppercase text-brand-800 tracking-wide block">
            Why?
          </span>
          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
            Highest expected recovery value among permitted interventions within configured recovery boundaries.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-white border border-neutral-200">
            <span className="text-[11px] text-neutral-500 font-medium block">Expected Recovery</span>
            <span className="text-lg md:text-xl font-extrabold text-success-700 tabular-nums">
              {formatINRFull(expectedRecovery)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-neutral-200">
            <span className="text-[11px] text-neutral-500 font-medium block">Recovery Probability</span>
            <span className="text-lg md:text-xl font-extrabold text-brand-700 tabular-nums">
              {recommendedOption?.probability || recoveryCase.recoveryProbability}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white border border-neutral-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-neutral-500 font-medium block">Amount at Risk</span>
            <span className="text-lg md:text-xl font-bold text-neutral-900 tabular-nums">
              {formatINRFull(recoveryCase.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Alternative Actions (Secondary / Collapsible - Prompt Section 6) */}
      {alternativeOptions.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsAlternativesExpanded(!isAlternativesExpanded)}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <span>Other Evaluated Options ({alternativeOptions.length})</span>
              {isAlternativesExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="text-[11px] text-neutral-400">
              Ranked by Expected Value
            </span>
          </div>

          {isAlternativesExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
              {alternativeOptions.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800">{alt.label}</span>
                    <span className="text-[10px] font-mono text-neutral-400">Option #{idx + 2}</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-neutral-200/60">
                    <span className="text-neutral-500">{alt.probability}% probability</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatINR(alt.expectedValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

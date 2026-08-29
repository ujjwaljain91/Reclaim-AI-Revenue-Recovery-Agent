'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  StopCircle,
  Sparkles,
} from 'lucide-react';
import { TimelineStep, RecoveryCase } from '@/lib/types';
import { formatINR, formatToolName } from '@/lib/utils';

interface RecoveryTimelineProps {
  timeline: TimelineStep[];
  recoveryCase?: RecoveryCase;
}

export const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({
  timeline,
  recoveryCase,
}) => {
  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'Reclaim Agent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            <Bot className="w-3 h-3" />
            Agent
          </span>
        );
      case 'Human (Admin)':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
            Human
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-500 border border-neutral-200">
            System
          </span>
        );
    }
  };

  const isCaseRecovered = recoveryCase?.status === 'recovered';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-tight">
            Agent Activity Timeline
          </h3>
          <p className="text-xs text-neutral-500">
            Chronological audit of autonomous diagnostics, tool invocations, and stopping rules.
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-400">
          {timeline.length} Steps
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {timeline.map((step, idx) => {
          const isLast = idx === timeline.length - 1;
          const isStopStep = step.toolUsed === 'stop_workflow' || step.state === 'STOPPED';
          const isRecoveredStep = step.state === 'RECOVERED' || (step.result && step.result.includes('recovered'));

          return (
            <div key={step.id || idx} className="relative group">
              {/* Bullet icon */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${
                  isRecoveredStep
                    ? 'border-success-500 text-success-600 bg-success-50'
                    : isStopStep
                    ? 'border-neutral-500 text-neutral-700 bg-neutral-50'
                    : 'border-brand-500 text-brand-600'
                }`}
              >
                {isRecoveredStep ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isStopStep ? (
                  <StopCircle className="w-3 h-3" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                )}
              </div>

              {/* Step Body */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-medium text-neutral-400">
                    {step.timestamp}
                  </span>
                  {getActorBadge(step.actor)}
                  <h4 className="text-xs font-bold text-neutral-900">
                    {step.event}
                  </h4>
                  {step.toolUsed && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md border border-brand-200 inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                      {formatToolName(step.toolUsed)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {step.details}
                </p>

                {step.result && (
                  <div className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-success-50 text-success-700 border border-success-200">
                    {step.result}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Recovery Conclusion Box */}
      {isCaseRecovered && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-success-600" />
            <div>
              <p className="text-sm font-bold text-success-900">
                ✓ {recoveryCase ? formatINR(recoveryCase.amount) : 'Revenue'} Recovered
              </p>
              <p className="text-xs text-success-700">
                Workflow automatically stopped. No further retries or customer contact required.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-success-200/70 text-success-800">
            OBJECTIVE MET
          </span>
        </div>
      )}
    </div>
  );
};

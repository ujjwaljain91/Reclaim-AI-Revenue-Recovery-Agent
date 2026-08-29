'use client';

import React from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Bot,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { formatINR, formatINRFull } from '@/lib/utils';

interface BatchProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchProcessorModal: React.FC<BatchProcessorModalProps> = ({ isOpen, onClose }) => {
  const { batchProgress, runBatchSimulation } = useReclaim();

  if (!isOpen) return null;

  const stages = [
    { id: 'detecting', label: '1. Detecting Events', icon: Activity },
    { id: 'analyzing', label: '2. Diagnosing Failures', icon: Bot },
    { id: 'prioritizing', label: '3. Risk Scoring & LTV', icon: ShieldCheck },
    { id: 'selecting', label: '4. Selecting Interventions', icon: Zap },
    { id: 'executing', label: '5. Executing Actions', icon: ArrowRight },
    { id: 'verifying', label: '6. Verifying & Stopping', icon: CheckCircle2 },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'detecting': return 0;
      case 'analyzing': return 1;
      case 'prioritizing': return 2;
      case 'selecting': return 3;
      case 'executing': return 4;
      case 'verifying': return 5;
      case 'completed': return 6;
      default: return -1;
    }
  };

  const currentStageIndex = getStageIndex(batchProgress.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-modal border border-neutral-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                Process Recovery Batch (100 Cases Demo)
              </h2>
              <p className="text-xs text-neutral-500">
                Simulate autonomous detection, bounded intervention, and financial recovery.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar & Stage Indicator */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-2">
              <span>Pipeline Execution</span>
              <span>{batchProgress.processedCases} / {batchProgress.totalCases} cases ({Math.round((batchProgress.processedCases / batchProgress.totalCases) * 100)}%)</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
              <div
                className="h-full bg-brand-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${(batchProgress.processedCases / batchProgress.totalCases) * 100}%` }}
              />
            </div>
          </div>

          {/* 6 Stages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {stages.map((stg, idx) => {
              const Icon = stg.icon;
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div
                  key={stg.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-brand-50 border-brand-300 text-brand-900 font-semibold shadow-xs'
                      : isPast
                      ? 'bg-success-50/50 border-success-200 text-success-800'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{stg.label}</span>
                </div>
              );
            })}
          </div>

          {/* Metrics Results Box */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-3">
            <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Simulated Financial Outcome
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded border border-neutral-200">
                <span className="text-[11px] text-neutral-500 block">Revenue at Risk</span>
                <span className="text-base font-bold text-neutral-900 tabular-nums">
                  {formatINRFull(batchProgress.revenueAtRisk)}
                </span>
              </div>
              <div className="p-3 bg-success-50 rounded border border-success-200">
                <span className="text-[11px] text-success-700 font-medium block">Recovered</span>
                <span className="text-base font-bold text-success-700 tabular-nums">
                  {formatINRFull(batchProgress.recoveredAmount)}
                </span>
              </div>
              <div className="p-3 bg-brand-50 rounded border border-brand-200">
                <span className="text-[11px] text-brand-700 font-medium block">Recovery Rate</span>
                <span className="text-base font-bold text-brand-700 tabular-nums">
                  {batchProgress.recoveryRate}%
                </span>
              </div>
            </div>

            {/* Case Breakdown */}
            <div className="flex items-center justify-between text-xs pt-1 px-1 text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                <span><strong>{batchProgress.recoveredCount}</strong> Recovered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-warning-500" />
                <span><strong>{batchProgress.escalatedCount}</strong> Escalated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span><strong>{batchProgress.unrecoveredCount}</strong> Unrecovered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {batchProgress.stage === 'completed'
              ? '✓ 100 cases processed & metrics updated in real-time.'
              : batchProgress.isRunning
              ? 'Agent active... evaluating stopping conditions.'
              : 'Click below to execute the 100-case recovery batch.'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-md transition-colors"
            >
              Close
            </button>
            <button
              disabled={batchProgress.isRunning}
              onClick={() => runBatchSimulation(100)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{batchProgress.isRunning ? 'Processing Batch...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { formatINR, formatINRFull } from '@/lib/utils';

interface DemoScenario {
  id: string;
  company: string;
  tier: string;
  amount: number;
  reason: string;
  probability: number;
  recommendedAction: string;
  interventionType: string;
  rationale: string[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'acme',
    company: 'Acme Corporation',
    tier: 'Enterprise',
    amount: 45000,
    reason: 'Insufficient funds',
    probability: 82,
    recommendedAction: 'Schedule Smart Retry at 10:00 AM IST (Salary Cycle)',
    interventionType: 'Smart Gateway Retry',
    rationale: [
      'Transient month-end liquidity timing',
      'High Customer LTV: ₹4.8 Lakhs',
      'Within configured max retries limit (1/3)',
    ],
  },
  {
    id: 'nova',
    company: 'Nova Retail Tech',
    tier: 'Mid-Market',
    amount: 18500,
    reason: 'Authentication timeout (3DS)',
    probability: 88,
    recommendedAction: 'Dispatch Instant WhatsApp Recovery Link with Pre-filled OTP',
    interventionType: 'WhatsApp Outreach',
    rationale: [
      'Transient 3DS session drop',
      'Clean historical payment clearance rate (98%)',
      'Within quiet hours boundary (11:30 AM active window)',
    ],
  },
  {
    id: 'zenith',
    company: 'Zenith Health Diagnostics',
    tier: 'Enterprise Tier',
    amount: 62000,
    reason: 'Card expired',
    probability: 74,
    recommendedAction: 'Send Dynamic Instrument Update Portal via WhatsApp & Email',
    interventionType: 'Payment Method Update',
    rationale: [
      'Corporate card expired last week',
      'Critical infrastructure account',
      'Requires zero aggressive retry attempts',
    ],
  },
];

export const LandingInteractiveDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'deciding' | 'executing' | 'recovered'>('idle');
  const [currentStepText, setCurrentStepText] = useState<string>('');

  const runSimulation = async () => {
    setStage('analyzing');
    setCurrentStepText('Ingesting gateway decline event and profiling account LTV...');

    await new Promise((r) => setTimeout(r, 600));
    setStage('deciding');
    setCurrentStepText(`Computing recovery probability: ${selectedScenario.probability}% confidence score.`);

    await new Promise((r) => setTimeout(r, 700));
    setStage('executing');
    setCurrentStepText(`Enforcing guardrails and dispatching: ${selectedScenario.recommendedAction}`);

    await new Promise((r) => setTimeout(r, 800));
    setStage('recovered');
    setCurrentStepText(`✓ ${formatINRFull(selectedScenario.amount)} successfully recovered and ledger verified!`);

    // Trigger confetti
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#16A34A', '#4F46E5', '#2563EB'],
        });
      });
    }
  };

  const resetSimulation = () => {
    setStage('idle');
    setCurrentStepText('');
  };

  return (
    <section id="simulator" className="py-20 bg-white border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Interactive Demo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            See the Reclaim AI Agent in Action
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            Select a real-world B2B payment failure scenario and let Reclaim calculate the optimal recovery path, enforce guardrails, and clear the transaction live.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="max-w-4xl mx-auto bg-neutral-50/80 border border-neutral-200 rounded-2xl p-5 sm:p-8 shadow-card space-y-6">
          {/* Scenario Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-3">
              1. Choose a Failed Invoice Scenario:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc);
                      resetSimulation();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                        : 'bg-white/60 border-neutral-200 hover:bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900">{sc.company}</span>
                      <span className="font-extrabold text-xs text-neutral-900 tabular-nums">
                        {formatINR(sc.amount)}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Reason: <strong className="text-warning-700 font-semibold">{sc.reason}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Simulation Bench */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 space-y-5">
            {/* Top Bar: Case Diagnostic & Probability */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Diagnosed Profile · {selectedScenario.tier}
                </span>
                <h4 className="text-base font-bold text-neutral-900">
                  {selectedScenario.company}
                </h4>
                <p className="text-xs text-neutral-500">
                  Root Cause: <span className="font-semibold text-neutral-800">{selectedScenario.reason}</span> · Invoice: <span className="font-bold text-neutral-900">{formatINRFull(selectedScenario.amount)}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                    Recovery Score
                  </span>
                  <span className="text-lg font-extrabold text-success-700 tabular-nums">
                    {selectedScenario.probability}%
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success-50 border border-success-200 flex items-center justify-center text-success-600 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Decision Rationale Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Safety & Guardrail Checks Passed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedScenario.rationale.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-600 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Trigger Area */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-600 w-full sm:w-auto">
                {stage === 'idle' && (
                  <span>Ready to trigger autonomous resolution sequence.</span>
                )}
                {stage !== 'idle' && stage !== 'recovered' && (
                  <span className="inline-flex items-center gap-2 font-semibold text-brand-700">
                    <div className="w-3 h-3 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    {currentStepText}
                  </span>
                )}
                {stage === 'recovered' && (
                  <span className="inline-flex items-center gap-1.5 font-bold text-success-700">
                    <CheckCircle2 className="w-4 h-4 text-success-600" />
                    {currentStepText}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {stage === 'recovered' ? (
                  <button
                    onClick={resetSimulation}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-test Scenario</span>
                  </button>
                ) : (
                  <button
                    onClick={runSimulation}
                    disabled={stage !== 'idle'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-card"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>✦ Let Reclaim Recover ({formatINR(selectedScenario.amount)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

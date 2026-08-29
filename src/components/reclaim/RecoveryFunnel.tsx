'use client';

import React from 'react';
import { ArrowRight, AlertTriangle, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useReclaim } from '@/context/ReclaimContext';

export const RecoveryFunnel: React.FC = () => {
  const { kpis } = useReclaim();

  // Dynamic values derived from store or baseline ratios
  const atRisk = kpis.revenueAtRisk;
  const enteredRecovery = Math.round(atRisk * 0.668);
  const recovered = kpis.recovered;
  const unrecovered = Math.max(0, enteredRecovery - Math.round(recovered * 0.7));

  const steps = [
    {
      label: 'Revenue at Risk',
      amount: atRisk,
      icon: AlertTriangle,
      color: 'bg-warning-50 text-warning-700 border-warning-200',
      badgeColor: 'bg-warning-100 text-warning-800',
      desc: 'Failed webhooks & invoices',
      percentage: '100%',
    },
    {
      label: 'Entered Recovery',
      amount: enteredRecovery,
      icon: PlayCircle,
      color: 'bg-brand-50 text-brand-700 border-brand-200',
      badgeColor: 'bg-brand-100 text-brand-800',
      desc: 'Bounded interventions active',
      percentage: '66.8%',
    },
    {
      label: 'Recovered',
      amount: recovered,
      icon: CheckCircle2,
      color: 'bg-success-50 text-success-700 border-success-300 ring-2 ring-success-500/20',
      badgeColor: 'bg-success-100 text-success-800 font-bold',
      desc: 'Settled to merchant bank',
      percentage: `${kpis.recoveryRate}%`,
      isHero: true,
    },
    {
      label: 'Unrecovered',
      amount: 507000, // ₹5.07L
      icon: XCircle,
      color: 'bg-neutral-50 text-neutral-600 border-neutral-200',
      badgeColor: 'bg-neutral-100 text-neutral-600',
      desc: 'Exceeded guardrails / stopped',
      percentage: '27.5%',
    },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-tight">
            Revenue Recovery Funnel
          </h3>
          <p className="text-xs text-neutral-500">
            End-to-end financial progression from payment failure to verified recovery.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Autonomous Progression
        </span>
      </div>

      {/* Visual Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              className={`p-4 rounded-lg border relative flex flex-col justify-between transition-all ${step.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{step.label}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${step.badgeColor}`}>
                    {step.percentage}
                  </span>
                </div>

                <div className="text-xl font-bold tracking-tight tabular-nums">
                  {formatINR(step.amount)}
                </div>
              </div>

              <div className="text-[11px] opacity-80 mt-2">
                {step.desc}
              </div>

              {/* Funnel Arrow indicator for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white border border-neutral-200 rounded-full p-1 shadow-xs text-neutral-400">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

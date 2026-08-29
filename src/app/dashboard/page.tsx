'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  DollarSign,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { HeroMetricCard } from '@/components/reclaim/HeroMetricCard';
import { KPICard } from '@/components/reclaim/KPICard';
import { RecoveryFunnel } from '@/components/reclaim/RecoveryFunnel';
import { AgentStatusCard } from '@/components/reclaim/AgentStatusCard';
import { RecoveryOpportunitiesTable } from '@/components/reclaim/RecoveryOpportunitiesTable';
import { useReclaim } from '@/context/ReclaimContext';
import { formatINR } from '@/lib/utils';
import { BatchProcessorModal } from '@/components/reclaim/BatchProcessorModal';
import { PaymentSimulatorModal } from '@/components/reclaim/PaymentSimulatorModal';

export default function DashboardPage() {
  const { cases, kpis, guardrails } = useReclaim();
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Metric Section */}
      <HeroMetricCard onOpenBatchSim={() => setIsBatchModalOpen(true)} />

      {/* 2. Secondary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Revenue at Risk"
          value={formatINR(kpis.revenueAtRisk)}
          subtext="143 active cases"
          trend={{ value: '4.2%', isPositive: false }}
          icon={AlertTriangle}
          variant="warning"
        />
        <KPICard
          title="In Active Recovery"
          value={formatINR(kpis.recovering)}
          subtext="Bounded retries executing"
          trend={{ value: '12.8%', isPositive: true }}
          icon={Clock}
          variant="brand"
        />
        <KPICard
          title="Recovery Rate"
          value={`${kpis.recoveryRate}%`}
          subtext="Target: 35.0%"
          trend={{ value: '4.3%', isPositive: true }}
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Active Cases"
          value={`${kpis.activeCasesCount}`}
          subtext="Across 8 failure types"
          icon={RefreshCw}
          variant="default"
        />
      </div>

      {/* 3. Revenue Recovery Funnel */}
      <RecoveryFunnel />

      {/* 4. Main Two-Column Section: Top Opportunities & Agent Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Recovery Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <RecoveryOpportunitiesTable
            cases={cases}
            limit={5}
            title="High-Priority Recovery Queue"
            subtitle="Ranked by recovery probability, customer LTV, and optimal clearing window"
          />

          {/* Quick Sandbox Action Banner for Judges */}
          <div className="bg-gradient-to-r from-brand-50 to-neutral-50 border border-brand-100 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold text-neutral-900 leading-tight">
                  Buildathon Interactive Test Bench
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Execute the 100-case recovery batch or inject custom failure events directly into the queue.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-md text-xs font-semibold transition-colors"
              >
                Inject Failure
              </button>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run 100 Batch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Agent Status & Guardrails */}
        <div className="space-y-6">
          <AgentStatusCard />

          {/* Guardrails Snapshot Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-neutral-900">Active Guardrails</h3>
              </div>
              <Link
                href="/agent/guardrails"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Configure
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-600">Maximum Retries</span>
                <span className="font-bold text-neutral-900">{guardrails.maxRetries} attempts</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-600">Contact Attempts</span>
                <span className="font-bold text-neutral-900">{guardrails.maxContactAttempts} msgs</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-600">Quiet Hours</span>
                <span className="font-bold text-neutral-900">{guardrails.quietHoursStart} – {guardrails.quietHoursEnd}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-600">High-Value Approval</span>
                <span className="font-bold text-warning-700">&gt; {formatINR(guardrails.highValueApprovalThreshold)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed italic">
              "Reclaim can act autonomously only within these business boundaries."
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <BatchProcessorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />
      <PaymentSimulatorModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}

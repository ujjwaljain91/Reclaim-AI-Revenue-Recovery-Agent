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
  CreditCard,
  ShoppingCart,
  FileText,
  FlaskConical,
  ShieldAlert,
  StopCircle,
} from 'lucide-react';
import { HeroMetricCard } from '@/components/reclaim/HeroMetricCard';
import { KPICard } from '@/components/reclaim/KPICard';
import { RecoveryFunnel } from '@/components/reclaim/RecoveryFunnel';
import { AgentStatusCard } from '@/components/reclaim/AgentStatusCard';
import { RecoveryOpportunitiesTable } from '@/components/reclaim/RecoveryOpportunitiesTable';
import { useReclaim } from '@/context/ReclaimContext';
import { formatINR, formatINRFull } from '@/lib/utils';
import { BatchProcessorModal } from '@/components/reclaim/BatchProcessorModal';
import { PaymentSimulatorModal } from '@/components/reclaim/PaymentSimulatorModal';

export default function DashboardPage() {
  const { cases, kpis, guardrails } = useReclaim();
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Compute Leakage by Source from unified cases array
  const computeSourceMetrics = (type: 'payment' | 'checkout' | 'receivable') => {
    const sourceCases = cases.filter((c) => c.revenueType === type);
    const atRisk = sourceCases.filter((c) => c.status === 'at_risk').reduce((sum, c) => sum + c.amount, 0);
    const recovered = sourceCases.filter((c) => c.status === 'recovered').reduce((sum, c) => sum + (c.recoveredAmount || c.amount), 0);
    const active = sourceCases.filter((c) => c.status === 'at_risk' || c.status === 'recovering').length;
    const total = atRisk + recovered;
    const rate = total > 0 ? ((recovered / total) * 100).toFixed(1) : '0.0';

    return { atRisk, recovered, active, rate, count: sourceCases.length };
  };

  const paymentMetrics = computeSourceMetrics('payment');
  const checkoutMetrics = computeSourceMetrics('checkout');
  const receivableMetrics = computeSourceMetrics('receivable');

  // Compute Agent Activity Summary from unified case data
  const recoveredCasesCount = cases.filter((c) => c.status === 'recovered').length;
  const escalatedCasesCount = cases.filter((c) => c.status === 'escalated').length;
  const stoppedWorkflowsCount = cases.filter((c) => c.status === 'recovered' || c.status === 'stopped' || c.status === 'escalated').length;
  const blockedActionsCount = cases.filter(
    (c) => c.guardrailChecks && (!c.guardrailChecks.retryLimitPassed || !c.guardrailChecks.contactLimitPassed || c.guardrailChecks.highValueApprovalRequired)
  ).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Metric Section */}
      <HeroMetricCard onOpenBatchSim={() => setIsBatchModalOpen(true)} />

      {/* 2. Top Unified KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard
          title="Revenue at Risk"
          value={formatINR(kpis.revenueAtRisk)}
          subtext={`${kpis.activeCasesCount} active cases across 3 surfaces`}
          trend={{ value: '4.2%', isPositive: false }}
          icon={AlertTriangle}
          variant="warning"
        />
        <KPICard
          title="Revenue Recovered"
          value={formatINRFull(kpis.recovered)}
          subtext="Verified funds settled"
          trend={{ value: '18.4%', isPositive: true }}
          icon={CheckCircle2}
          variant="brand"
        />
        <KPICard
          title="Recovery Rate"
          value={`${kpis.recoveryRate}%`}
          subtext="Benchmark target: 35.0%"
          trend={{ value: '6.2%', isPositive: true }}
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Active Cases"
          value={`${kpis.activeCasesCount}`}
          subtext="Monitoring in real time"
          icon={RefreshCw}
          variant="default"
        />
      </div>

      {/* 3. Revenue Leakage by Source (Multi-surface Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Revenue Leakage by Source
          </h3>
          <Link
            href="/recovery"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Filter Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Payment Failures */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-neutral-900">Payments</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                {paymentMetrics.count} Cases
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">At Risk:</span>
                <span className="font-semibold text-neutral-800">{formatINR(paymentMetrics.atRisk)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Recovered:</span>
                <span className="font-bold text-success-700">{formatINR(paymentMetrics.recovered)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-neutral-100">
                <span className="text-neutral-500">Recovery Rate:</span>
                <span className="text-base font-extrabold text-brand-700">{paymentMetrics.rate}%</span>
              </div>
            </div>
          </div>

          {/* Checkout Abandonment */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-info-50 text-info-600 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-neutral-900">Checkout</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-info-50 text-info-700 font-bold border border-info-200">
                {checkoutMetrics.count} Cases
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">At Risk:</span>
                <span className="font-semibold text-neutral-800">{formatINR(checkoutMetrics.atRisk)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Recovered:</span>
                <span className="font-bold text-success-700">{formatINR(checkoutMetrics.recovered)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-neutral-100">
                <span className="text-neutral-500">Recovery Rate:</span>
                <span className="text-base font-extrabold text-info-700">{checkoutMetrics.rate}%</span>
              </div>
            </div>
          </div>

          {/* Overdue Receivables */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-warning-50 text-warning-700 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-neutral-900">Receivables</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-warning-50 text-warning-800 font-bold border border-warning-200">
                {receivableMetrics.count} Cases
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">At Risk:</span>
                <span className="font-semibold text-neutral-800">{formatINR(receivableMetrics.atRisk)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Recovered:</span>
                <span className="font-bold text-success-700">{formatINR(receivableMetrics.recovered)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-neutral-100">
                <span className="text-neutral-500">Recovery Rate:</span>
                <span className="text-base font-extrabold text-warning-700">{receivableMetrics.rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Agent Activity Telemetry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Agent Operational Telemetry
          </h3>
          <Link
            href="/agent/activity"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-card space-y-1">
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">Recoveries</span>
            <div className="text-2xl font-extrabold text-success-600 tabular-nums">
              {recoveredCasesCount}
            </div>
            <span className="text-[11px] text-neutral-400">Settled autonomously</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-card space-y-1">
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">Escalations</span>
            <div className="text-2xl font-extrabold text-warning-700 tabular-nums">
              {escalatedCasesCount}
            </div>
            <span className="text-[11px] text-neutral-400">Routed to human ops</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-card space-y-1">
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">Blocked Actions</span>
            <div className="text-2xl font-extrabold text-brand-700 tabular-nums">
              {blockedActionsCount}
            </div>
            <span className="text-[11px] text-neutral-400">Gated by safety policy</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-card space-y-1">
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">Stopped Workflows</span>
            <div className="text-2xl font-extrabold text-neutral-900 tabular-nums">
              {stoppedWorkflowsCount}
            </div>
            <span className="text-[11px] text-neutral-400">Bounded termination</span>
          </div>
        </div>
      </div>

      {/* 5. Revenue Recovery Funnel */}
      <RecoveryFunnel />

      {/* 6. Main Two-Column Section: Top Opportunities & Agent Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Recovery Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <RecoveryOpportunitiesTable
            cases={cases}
            limit={6}
            title="High-Priority Recovery Queue"
            subtitle="Ranked by recovery probability, customer LTV, and optimal clearing window"
          />

          {/* Quick Benchmark Lab Banner */}
          <div className="bg-gradient-to-r from-brand-50 to-neutral-50 border border-brand-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold text-neutral-900 leading-tight">
                  Recovery Lab — Benchmark Engine
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Simulate 1,000 cases to measure Reclaim against Naive Retry and Static Rules strategies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Link
                href="/recovery-lab"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Recovery Lab</span>
              </Link>
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

'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { DecisionCard } from '@/components/reclaim/DecisionCard';
import { RecoveryTimeline } from '@/components/reclaim/RecoveryTimeline';
import { RecoveryScoreBadge } from '@/components/reclaim/RecoveryScoreBadge';
import { formatINR, formatINRFull, formatTimeAgo, formatPaymentRef } from '@/lib/utils';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { cases, executeStepOnCase, guardrails, openAskReclaim } = useReclaim();
  const [isExecuting, setIsExecuting] = useState(false);

  const currentCase = cases.find((c) => c.id === resolvedParams.id) || cases[0];
  const customer = currentCase.customer;
  const isRecovered = currentCase.status === 'recovered';
  const isEscalated = currentCase.status === 'escalated';

  const handleStepExecution = async () => {
    setIsExecuting(true);
    await executeStepOnCase(currentCase.id);
    setIsExecuting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-50 text-success-700 border border-success-200 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            Recovered
          </span>
        );
      case 'recovering':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 shadow-xs">
            <Clock className="w-4 h-4 animate-spin" />
            In Active Recovery
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning-50 text-warning-700 border border-warning-200">
            <AlertTriangle className="w-4 h-4" />
            Escalated to Operations
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning-50 text-warning-800 border border-warning-200">
            <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
            At Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Link
          href="/recovery"
          className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Recovery Queue</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="text-neutral-900 font-semibold">{customer.company}</span>
        <span className="font-mono text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
          {formatPaymentRef(currentCase.paymentId)}
        </span>
      </div>

      {/* Case Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
              {customer.company}
            </h1>
            {getStatusBadge(currentCase.status)}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span className="text-sm font-bold text-neutral-900 tabular-nums">
              {formatINRFull(currentCase.amount)} at risk
            </span>
            <span>·</span>
            <span suppressHydrationWarning>Payment failed · {formatTimeAgo(currentCase.createdAt)}</span>
            <span>·</span>
            <span>Gateway: {currentCase.payment.provider}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            onClick={() => openAskReclaim({ caseId: currentCase.id })}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-md text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            title={`Ask Reclaim about ${customer.company}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>✦ Ask Reclaim</span>
          </button>

          {currentCase.status === 'at_risk' && (
            <button
              onClick={handleStepExecution}
              disabled={isExecuting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Executing Agent Action...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Let Reclaim Decide</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reclaim's Assessment Metrics Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Reclaim Assessment & Diagnostic Profile
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-medium">Model ID: rec-v2-fintech</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recovery Probability */}
          <div className="p-4 rounded-lg bg-neutral-50/80 border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium block">
              Recovery Probability
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 mt-1 tabular-nums">
              {currentCase.recoveryProbability}%
            </div>
            <span className="text-[11px] text-success-700 font-semibold mt-1 inline-block">
              {currentCase.recoveryProbability >= 75
                ? 'High confidence recovery'
                : 'Moderate confidence recovery'}
            </span>
          </div>

          {/* Root Cause */}
          <div className="p-4 rounded-lg bg-neutral-50/80 border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium block">
              Diagnosed Root Cause
            </span>
            <div className="text-lg md:text-xl font-bold text-neutral-900 mt-1">
              {currentCase.rootCause}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              {currentCase.rootCause === 'Insufficient funds'
                ? 'Transient liquidity timing'
                : currentCase.rootCause === 'Card expired'
                ? 'Instrument renewal needed'
                : 'Gateway decline code'}
            </span>
          </div>

          {/* Customer Lifetime Value */}
          <div className="p-4 rounded-lg bg-neutral-50/80 border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium block">
              Customer Lifetime Value
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-brand-600 mt-1 tabular-nums">
              {formatINR(customer.lifetimeValue)}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">
              {customer.customerType} Tier Account
            </span>
          </div>

          {/* Payment History */}
          <div className="p-4 rounded-lg bg-neutral-50/80 border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium block">
              Historical Payment Record
            </span>
            <div className="text-lg md:text-xl font-bold text-neutral-900 mt-1">
              {customer.paymentHistory.successfulCount} successful · {customer.paymentHistory.failedCount} failed
            </div>
            <span className="text-[11px] text-success-700 font-semibold mt-1 block">
              {customer.paymentHistory.failedCount === 0
                ? '100% past payment clearance'
                : `${customer.paymentHistory.failedCount} past retries resolved`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Decision Card & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Decision Recommendation & Interactive Executor */}
        <div className="lg:col-span-2 space-y-6">
          <DecisionCard
            recoveryCase={currentCase}
            onExecute={handleStepExecution}
            isExecuting={isExecuting}
          />

          <RecoveryTimeline
            timeline={currentCase.timeline}
            recoveryCase={currentCase}
          />
        </div>

        {/* Right Col: Customer Profile & Guardrails Verification */}
        <div className="space-y-6">
          {/* Customer Metadata Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Customer Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">{customer.company}</span>
                  <span className="text-neutral-500">{customer.name} (Primary Billing Contact)</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-700">{customer.email}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <span className="text-neutral-700">{customer.phone}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-neutral-500">Preferred Channel</span>
                <span className="font-semibold text-brand-700 uppercase tracking-wider text-[10px] px-2 py-0.5 bg-brand-50 rounded border border-brand-200">
                  {customer.preferredChannel}
                </span>
              </div>

              {customer.accountManager && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Account Manager</span>
                  <span className="font-medium text-neutral-900">{customer.accountManager}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guardrail Policy Check for this Case */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-neutral-900">Guardrail Enforcement</h3>
              </div>
              <span className="text-[10px] font-semibold text-success-700 bg-success-50 px-2 py-0.5 rounded border border-success-200">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Retry Limits</span>
                <span className="font-medium text-neutral-900">
                  {currentCase.attemptsUsed} / {guardrails.maxRetries} attempts used
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Contact Attempts</span>
                <span className="font-medium text-neutral-900">
                  {currentCase.contactAttemptsUsed} / {guardrails.maxContactAttempts} msgs used
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">High-Value Rule</span>
                <span className="font-medium text-neutral-900">
                  {currentCase.amount >= guardrails.highValueApprovalThreshold ? (
                    <span className="text-warning-700 font-bold">Sign-off required</span>
                  ) : (
                    <span className="text-success-700">Autonomous permitted</span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
              Stopping Rule: Workflow automatically halts once payment is confirmed or retry limit is reached.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

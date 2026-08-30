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
  ShoppingCart,
  FileText,
  Calendar,
  DollarSign,
  UserCheck,
  Zap,
  ArrowRight,
  Check,
  XCircle,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { DecisionCard } from '@/components/reclaim/DecisionCard';
import { StrategyComparison } from '@/components/reclaim/StrategyComparison';
import { RecoveryTimeline } from '@/components/reclaim/RecoveryTimeline';
import { RecoveryScoreBadge } from '@/components/reclaim/RecoveryScoreBadge';
import { formatINR, formatINRFull, formatTimeAgo, formatPaymentRef } from '@/lib/utils';
import { evaluatePolicyGate } from '@/lib/policy-gate';
import { learningEngine } from '@/lib/learning-engine';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    cases,
    executeStepOnCase,
    guardrails,
    openAskReclaim,
    createPromiseToPay,
    requestPaymentCommitment,
    verifyPromisePayment,
    addToast,
  } = useReclaim();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isVerifyingPromise, setIsVerifyingPromise] = useState(false);
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [promiseAmount, setPromiseAmount] = useState<number>(0);
  const [promiseDate, setPromiseDate] = useState<string>('2026-08-31');

  const currentCase = cases.find((c) => c.id === resolvedParams.id) || cases[0];
  const customer = currentCase.customer;
  const isRecovered = currentCase.status === 'recovered';
  const isEscalated = currentCase.status === 'escalated';
  const isReceivable = currentCase.revenueType === 'receivable';
  const isCheckout = currentCase.revenueType === 'checkout';
  const promiseToPay = currentCase.receivableDetails?.promiseToPay;

  // Learning Signal for this case (Phase 5)
  const learningSignal = learningEngine.evaluateLearningSignal(
    currentCase.rootCause,
    currentCase.decision.interventionType || currentCase.interventionType,
    customer.customerType
  );

  const policyGateResult = evaluatePolicyGate(
    currentCase,
    currentCase.decision.interventionType || currentCase.interventionType,
    guardrails
  );

  const handleStepExecution = async () => {
    setIsExecuting(true);
    await executeStepOnCase(currentCase.id);
    setIsExecuting(false);
  };

  const handleVerifyPromiseSuccess = async () => {
    setIsVerifyingPromise(true);
    await verifyPromisePayment(currentCase.id, 'received');
    setIsVerifyingPromise(false);
  };

  const handleVerifyPromiseBroken = async () => {
    setIsVerifyingPromise(true);
    await verifyPromisePayment(currentCase.id, 'not_received');
    setIsVerifyingPromise(false);
  };

  const handleCreatePromise = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = promiseAmount || currentCase.amount;
    createPromiseToPay(currentCase.id, amt, promiseDate, 'whatsapp');
    setShowPromiseModal(false);
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

  const getSurfaceBadge = () => {
    if (isCheckout) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-info-50 text-info-700 border border-info-200 uppercase tracking-wider">
          <ShoppingCart className="w-3 h-3" />
          Checkout Abandonment
        </span>
      );
    }
    if (isReceivable) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-warning-50 text-warning-800 border border-warning-200 uppercase tracking-wider">
          <FileText className="w-3 h-3" />
          B2B Receivable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-wider">
        <CreditCard className="w-3 h-3" />
        Payment Failure
      </span>
    );
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
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
              {customer.company}
            </h1>
            {getSurfaceBadge()}
            {getStatusBadge(currentCase.status)}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span className="text-sm font-bold text-neutral-900 tabular-nums">
              {formatINRFull(currentCase.amount)} at risk
            </span>
            <span>·</span>
            <span>
              Problem:{' '}
              <strong className="text-neutral-800">
                {isCheckout ? 'Checkout abandoned' : isReceivable ? 'Invoice overdue' : currentCase.rootCause}
              </strong>
            </span>
            <span>·</span>
            <span suppressHydrationWarning>Logged {formatTimeAgo(currentCase.createdAt)}</span>
            {currentCase.eventId && (
              <>
                <span>·</span>
                <span className="font-mono text-[11px]">Event ID: {currentCase.eventId}</span>
              </>
            )}
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

      {/* PHASE 4: STATEFUL PROMISE-TO-PAY WORKFLOW (Prompt Sections 11–15) */}
      {isReceivable && (
        <div className="bg-white border-2 border-warning-500/20 rounded-xl p-5 md:p-6 shadow-card space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-700 border border-warning-200 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-warning-800 block">
                  B2B Receivables Protocol
                </span>
                <h2 className="text-base font-bold text-neutral-900 leading-tight">
                  Promise to Pay Workflow
                </h2>
              </div>
            </div>

            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              Demo / Sandbox
            </span>
          </div>

          {/* Core Promise State Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium block">Customer</span>
              <span className="text-xs font-bold text-neutral-900 truncate block mt-0.5">
                {customer.company}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium block">Promised Amount</span>
              <span className="text-xs font-extrabold text-neutral-900 tabular-nums block mt-0.5">
                {formatINRFull(promiseToPay?.amount || currentCase.amount)}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium block">Promised Date</span>
              <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                {promiseToPay?.promisedDate ? new Date(promiseToPay.promisedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Aug 2026'}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium block">Status / Verification</span>
              <div className="mt-0.5">
                {promiseToPay?.status === 'fulfilled' || isRecovered ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success-700 bg-success-50 px-2 py-0.5 rounded border border-success-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Fulfilled
                  </span>
                ) : promiseToPay?.status === 'overdue' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-danger-700 bg-danger-50 px-2 py-0.5 rounded border border-danger-200">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-warning-800 bg-warning-50 px-2 py-0.5 rounded border border-warning-200">
                    <Clock className="w-3 h-3" />
                    Promised · Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4-Step Visual Timeline Flow (Prompt Section 11) */}
          <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Promise Lifecycle Timeline
            </span>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-success-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />
                <span>Reminder Sent</span>
              </div>
              <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-neutral-300 shrink-0" />

              <div className={`flex items-center gap-2 font-bold ${promiseToPay ? 'text-success-700' : 'text-neutral-400'}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${promiseToPay ? 'text-success-600' : 'text-neutral-300'}`} />
                <span>Customer Committed</span>
              </div>
              <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-neutral-300 shrink-0" />

              <div className={`flex items-center gap-2 font-bold ${promiseToPay ? 'text-success-700' : 'text-neutral-400'}`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${promiseToPay ? 'text-success-600' : 'text-neutral-300'}`} />
                <span>Promise Created</span>
              </div>
              <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-neutral-300 shrink-0" />

              <div className={`flex items-center gap-2 font-bold ${isRecovered ? 'text-success-700' : 'text-warning-700 animate-pulse'}`}>
                <Clock className={`w-4 h-4 shrink-0 ${isRecovered ? 'text-success-600' : 'text-warning-600'}`} />
                <span>{isRecovered ? 'Payment Verified' : 'Verification Pending'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls for Demo Environment */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100">
            <div className="text-xs text-neutral-500">
              {isRecovered ? (
                <span className="text-success-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  ✓ Promise fulfilled · {formatINRFull(currentCase.amount)} recovered. Recovery workflow automatically stopped.
                </span>
              ) : promiseToPay?.status === 'overdue' ? (
                <span className="text-danger-700 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Promise overdue · Payment not received. Reclaim dispatched next permitted follow-up.
                </span>
              ) : (
                <span>Autonomous ledger watcher monitors RTGS/NetBanking settlement daily.</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!promiseToPay && !isRecovered && (
                <>
                  <button
                    onClick={() => requestPaymentCommitment(currentCase.id)}
                    className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Request Commitment (Simulate)</span>
                  </button>

                  <button
                    onClick={() => setShowPromiseModal(true)}
                    className="px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Setup Custom Promise</span>
                  </button>
                </>
              )}

              {promiseToPay && !isRecovered && (
                <>
                  <button
                    onClick={handleVerifyPromiseSuccess}
                    disabled={isVerifyingPromise}
                    className="px-3.5 py-2 bg-success-600 hover:bg-success-700 text-white rounded-md text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Settlement (Received)</span>
                  </button>

                  <button
                    onClick={handleVerifyPromiseBroken}
                    disabled={isVerifyingPromise}
                    className="px-3 py-2 bg-neutral-100 hover:bg-danger-50 hover:text-danger-700 text-neutral-700 border border-neutral-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Simulate Broken Promise</span>
                  </button>

                  <button
                    onClick={() => setShowPromiseModal(true)}
                    className="px-2.5 py-2 text-neutral-500 hover:text-neutral-800 text-xs font-medium underline transition-colors cursor-pointer"
                  >
                    Edit Promise
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: EXPLAINABLE LEARNING CALLOUT (Prompt Section 24) */}
      {learningSignal.sampleSize >= 10 && (
        <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-md bg-brand-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-brand-900 block">
                Reclaim Learning Signal Active
              </span>
              <p className="text-brand-800 leading-relaxed font-medium">
                {learningSignal.explanation}
              </p>
              <span className="text-[11px] text-neutral-500 block pt-0.5">
                <strong>{learningSignal.sampleSize} similar outcomes analyzed</strong> · Historical recovery rate: <strong>{learningSignal.historicalRate}%</strong> · Safety: Gated by deterministic policy checks.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: STRATEGY COMPARISON & ERV OPTIMIZATION (Prompt Sections 5, 6 & 7) */}
      <StrategyComparison recoveryCase={currentCase} showAllAlternatives={false} />

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

        {/* Right Col: Customer Profile & Policy Gate */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Customer Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 block">{customer.company}</span>
                  <span className="text-neutral-500">{customer.name} (Contact)</span>
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

          {/* Deterministic Policy Check Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-neutral-900">Policy Gate Checks</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  policyGateResult.approved
                    ? 'bg-success-50 text-success-700 border-success-200'
                    : 'bg-danger-50 text-danger-700 border-danger-200'
                }`}
              >
                {policyGateResult.approved ? 'Passed' : 'Blocked'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {policyGateResult.checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-neutral-600">{check.name}</span>
                  <span className={`font-semibold ${check.passed ? 'text-success-700' : 'text-danger-700'}`}>
                    {check.passed ? '✓ Approved' : '✕ Gated'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
              Deterministic boundary: LLM recommendation is gated before execution.
            </div>
          </div>
        </div>
      </div>

      {/* Promise to Pay Creation Modal */}
      {showPromiseModal && (
        <div className="fixed inset-0 bg-neutral-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Setup Promise-to-Pay Workflow
              </h3>
              <button
                onClick={() => setShowPromiseModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromise} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Promised Settlement Amount (₹ INR)
                </label>
                <input
                  type="number"
                  value={promiseAmount || currentCase.amount}
                  onChange={(e) => setPromiseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Promised Date of Payment
                </label>
                <input
                  type="date"
                  value={promiseDate}
                  onChange={(e) => setPromiseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPromiseModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-bold shadow-xs"
                >
                  Record Promise to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

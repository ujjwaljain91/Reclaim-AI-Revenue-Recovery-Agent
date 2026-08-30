'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RecoveryCase,
  RecoveryKPIData,
  Guardrails,
  AgentState,
  BatchProcessingProgress,
  TimelineStep,
  FailureReason,
  Customer,
  RevenueType,
  PromiseToPay,
} from '@/lib/types';
import { INITIAL_CASES, INITIAL_KPIS, DEMO_CUSTOMERS } from '@/lib/demo-data';
import { DEFAULT_GUARDRAILS } from '@/lib/guardrail-engine';
import { reclaimAgent } from '@/lib/agent-engine';
import { idempotencyRegistry } from '@/lib/idempotency';

interface ToastInfo {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ReclaimContextType {
  cases: RecoveryCase[];
  kpis: RecoveryKPIData;
  guardrails: Guardrails;
  agentState: AgentState;
  batchProgress: BatchProcessingProgress;
  activeFilter: string;
  revenueFilter: 'all' | 'payment' | 'checkout' | 'receivable';
  searchQuery: string;
  toasts: ToastInfo[];
  isAskReclaimOpen: boolean;
  askReclaimCaseId?: string;
  openAskReclaim: (context?: { caseId?: string }) => void;
  closeAskReclaim: () => void;
  toggleAskReclaim: () => void;
  setActiveFilter: (filter: string) => void;
  setRevenueFilter: (filter: 'all' | 'payment' | 'checkout' | 'receivable') => void;
  setSearchQuery: (query: string) => void;
  updateGuardrails: (newGuardrails: Partial<Guardrails>) => void;
  executeStepOnCase: (caseId: string) => Promise<boolean>;
  runBatchSimulation: (totalCases?: number) => Promise<void>;
  injectSimulatedPayment: (customerId: string, amount: number, reason: FailureReason, surface?: RevenueType, eventId?: string) => void;
  createPromiseToPay: (caseId: string, amount: number, promisedDate: string, source?: PromiseToPay['source'], notes?: string) => void;
  requestPaymentCommitment: (caseId: string) => void;
  verifyPromisePayment: (caseId: string, simulatedOutcome?: 'received' | 'not_received') => Promise<boolean>;
  verifyPromiseToPay: (caseId: string) => Promise<boolean>;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<ToastInfo, 'id'>) => void;
  getCaseById: (caseId: string) => RecoveryCase | undefined;
}

const ReclaimContext = createContext<ReclaimContextType | undefined>(undefined);

export function ReclaimProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<RecoveryCase[]>(INITIAL_CASES);
  const [kpis, setKpis] = useState<RecoveryKPIData>(INITIAL_KPIS);
  const [guardrails, setGuardrails] = useState<Guardrails>(DEFAULT_GUARDRAILS);
  const [agentState, setAgentState] = useState<AgentState>('MONITORING');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<'all' | 'payment' | 'checkout' | 'receivable'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isAskReclaimOpen, setIsAskReclaimOpen] = useState(false);
  const [askReclaimCaseId, setAskReclaimCaseId] = useState<string | undefined>(undefined);

  // Recalculate KPIs when cases update to maintain single source of truth
  useEffect(() => {
    const atRisk = cases.filter((c) => c.status === 'at_risk').reduce((sum, c) => sum + c.amount, 0);
    const recovering = cases.filter((c) => c.status === 'recovering').reduce((sum, c) => sum + c.amount, 0);
    const recovered = cases.filter((c) => c.status === 'recovered').reduce((sum, c) => sum + (c.recoveredAmount || c.amount), 0);
    const activeCount = cases.filter((c) => c.status === 'at_risk' || c.status === 'recovering').length;
    const totalExposure = recovered + atRisk + recovering;
    const rate = totalExposure > 0 ? Number(((recovered / totalExposure) * 100).toFixed(1)) : 0;

    setKpis((prev) => ({
      ...prev,
      revenueAtRisk: atRisk,
      recovering,
      recovered,
      recoveryRate: rate,
      activeCasesCount: activeCount,
    }));
  }, [cases]);

  const openAskReclaim = (context?: { caseId?: string }) => {
    if (context?.caseId) {
      setAskReclaimCaseId(context.caseId);
    }
    setIsAskReclaimOpen(true);
  };

  const closeAskReclaim = () => {
    setIsAskReclaimOpen(false);
  };

  const toggleAskReclaim = () => {
    setIsAskReclaimOpen((prev) => !prev);
  };

  const [batchProgress, setBatchProgress] = useState<BatchProcessingProgress>({
    isRunning: false,
    stage: 'idle',
    totalCases: 100,
    processedCases: 0,
    recoveredCount: 0,
    escalatedCount: 0,
    unrecoveredCount: 0,
    revenueAtRisk: 284500,
    recoveredAmount: 0,
    recoveryRate: 0,
  });

  const addToast = (toast: Omit<ToastInfo, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateGuardrails = (newGuardrails: Partial<Guardrails>) => {
    setGuardrails((prev) => ({ ...prev, ...newGuardrails }));
    addToast({
      type: 'success',
      title: 'Guardrails Updated',
      message: 'Autonomous agent boundaries have been successfully saved.',
    });
  };

  const getCaseById = (caseId: string) => {
    return cases.find((c) => c.id === caseId);
  };

  // Promise-to-Pay workflow handlers (Phase 4)
  const requestPaymentCommitment = (caseId: string) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const promiseDate = '2026-08-31';
    const amount = targetCase.amount;

    const promise: PromiseToPay = {
      id: `prm_${Date.now().toString(36)}`,
      caseId,
      customerId: targetCase.customerId,
      invoiceId: targetCase.receivableDetails?.invoiceId || `INV-${targetCase.paymentId.slice(-5)}`,
      amount,
      promisedDate: promiseDate,
      status: 'promised',
      source: 'whatsapp',
      notes: 'Customer billing contact committed to settle via corporate NetBanking.',
      createdAt: new Date().toISOString(),
    };

    const timeStr = new Date().toTimeString().split(' ')[0];
    const newStep: TimelineStep = {
      id: `tl_p2p_${Date.now()}`,
      timestamp: timeStr,
      actor: 'Reclaim Agent',
      event: `Customer committed — Promise-to-Pay recorded`,
      toolUsed: 'promise_to_pay',
      details: `Customer committed to settle ₹${amount.toLocaleString('en-IN')} on ${promiseDate}. Automated ledger monitor scheduled.`,
      result: `Promise Created (₹${amount.toLocaleString('en-IN')})`,
      status: 'completed',
      state: 'WAITING',
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'recovering',
          receivableDetails: {
            ...c.receivableDetails,
            invoiceId: c.receivableDetails?.invoiceId || `INV-${c.paymentId.slice(-5)}`,
            daysOverdue: c.receivableDetails?.daysOverdue || 14,
            promiseToPay: promise,
          },
          timeline: [...c.timeline, newStep],
          currentAction: `Monitoring Promise-to-Pay settlement (Due: ${promiseDate})`,
          nextAction: `Verify payment on ${promiseDate}`,
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Promise-to-Pay Recorded',
      message: `Customer committed to pay ₹${amount.toLocaleString('en-IN')} on ${promiseDate}.`,
    });
  };

  const createPromiseToPay = (
    caseId: string,
    amount: number,
    promisedDate: string,
    source: PromiseToPay['source'] = 'whatsapp',
    notes?: string
  ) => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return;

    const promise: PromiseToPay = {
      id: `prm_${Date.now().toString(36)}`,
      caseId,
      customerId: targetCase.customerId,
      invoiceId: targetCase.receivableDetails?.invoiceId || `INV-${targetCase.paymentId.slice(-5)}`,
      amount,
      promisedDate,
      status: 'promised',
      source,
      notes: notes || 'Customer committed to settlement.',
      createdAt: new Date().toISOString(),
    };

    const timeStr = new Date().toTimeString().split(' ')[0];
    const newStep: TimelineStep = {
      id: `tl_p2p_${Date.now()}`,
      timestamp: timeStr,
      actor: 'Reclaim Agent',
      event: `Promise-to-Pay Created (₹${amount.toLocaleString('en-IN')})`,
      toolUsed: 'promise_to_pay',
      details: `Customer committed to settle invoice on ${promisedDate}. Automated ledger monitor scheduled.`,
      result: `Promise-to-Pay Active`,
      status: 'completed',
      state: 'WAITING',
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          status: 'recovering',
          receivableDetails: {
            ...c.receivableDetails,
            invoiceId: c.receivableDetails?.invoiceId || `INV-${c.paymentId.slice(-5)}`,
            daysOverdue: c.receivableDetails?.daysOverdue || 14,
            promiseToPay: promise,
          },
          timeline: [...c.timeline, newStep],
          currentAction: `Monitoring Promise-to-Pay settlement (Due: ${promisedDate})`,
          nextAction: `Verify payment on ${promisedDate}`,
        };
      })
    );

    addToast({
      type: 'success',
      title: 'Promise-to-Pay Created',
      message: `Logged promise for ₹${amount.toLocaleString('en-IN')} due on ${promisedDate}.`,
    });
  };

  const verifyPromisePayment = async (
    caseId: string,
    simulatedOutcome: 'received' | 'not_received' = 'received'
  ): Promise<boolean> => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return false;

    setAgentState('ACTING');
    await new Promise((res) => setTimeout(res, 350));

    const timeStr = new Date().toTimeString().split(' ')[0];

    if (simulatedOutcome === 'received') {
      // 1. Payment Received State (Prompt Section 14)
      const verifyStep: TimelineStep = {
        id: `tl_v_${Date.now()}`,
        timestamp: timeStr,
        actor: 'System',
        event: 'Promise-to-Pay Payment Verified: SUCCESS',
        toolUsed: 'verify_payment_outcome',
        details: `Ledger reconciliation confirmed ₹${targetCase.amount.toLocaleString('en-IN')} settlement received via RTGS/NetBanking.`,
        result: `✓ ₹${targetCase.amount.toLocaleString('en-IN')} recovered`,
        status: 'completed',
        state: 'RECOVERED',
      };

      const stopStep: TimelineStep = {
        id: `tl_s_${Date.now()}`,
        timestamp: timeStr,
        actor: 'Reclaim Agent',
        event: 'Workflow automatically stopped',
        toolUsed: 'stop_workflow',
        details: 'Promise fulfilled and funds settled. Recovery workflow concluded cleanly.',
        result: 'Clean stop',
        status: 'completed',
        state: 'STOPPED',
      };

      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            status: 'recovered',
            recoveredAmount: c.amount,
            currentAction: 'Promise fulfilled & payment verified',
            nextAction: 'Workflow stopped',
            receivableDetails: {
              ...c.receivableDetails,
              invoiceId: c.receivableDetails?.invoiceId || `INV-9021`,
              daysOverdue: 0,
              promiseToPay: c.receivableDetails?.promiseToPay
                ? {
                    ...c.receivableDetails.promiseToPay,
                    status: 'fulfilled',
                    verifiedAt: new Date().toISOString(),
                  }
                : undefined,
            },
            timeline: [...c.timeline, verifyStep, stopStep],
          };
        })
      );

      setAgentState('RECOVERED');

      addToast({
        type: 'success',
        title: '✓ Promise Fulfilled',
        message: `₹${targetCase.amount.toLocaleString('en-IN')} recovered from ${targetCase.customer.company}. Workflow automatically stopped.`,
      });

      if (typeof window !== 'undefined') {
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#16A34A', '#4F46E5', '#2563EB'],
          });
        });
      }

      setTimeout(() => {
        setAgentState('MONITORING');
      }, 3000);

      return true;
    } else {
      // 2. Broken / Overdue Promise State (Prompt Section 15)
      const overdueStep: TimelineStep = {
        id: `tl_ovd_${Date.now()}`,
        timestamp: timeStr,
        actor: 'System',
        event: 'Promise Overdue: Payment Not Received',
        details: `Promised date arrived but settlement not detected on ledger. Re-evaluating next permitted action.`,
        status: 'failed',
        state: 'ANALYZING',
      };

      const followupStep: TimelineStep = {
        id: `tl_flw_${Date.now()}`,
        timestamp: timeStr,
        actor: 'Reclaim Agent',
        event: 'Scheduled Executive Payment Follow-up',
        toolUsed: 'send_followup',
        details: `Dispatched follow-up notice with instant RTGS payment link. Guardrails checked: PASS.`,
        status: 'completed',
        state: 'ACTING',
      };

      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            status: 'recovering',
            currentAction: 'Promise overdue — follow-up dispatched',
            nextAction: 'Awaiting customer payment / escalation',
            receivableDetails: {
              ...c.receivableDetails,
              invoiceId: c.receivableDetails?.invoiceId || `INV-9021`,
              daysOverdue: (c.receivableDetails?.daysOverdue || 14) + 1,
              promiseToPay: c.receivableDetails?.promiseToPay
                ? {
                    ...c.receivableDetails.promiseToPay,
                    status: 'overdue',
                  }
                : undefined,
            },
            timeline: [...c.timeline, overdueStep, followupStep],
          };
        })
      );

      setAgentState('ACTING');

      addToast({
        type: 'warning',
        title: 'Promise Overdue',
        message: `Payment not detected for ${targetCase.customer.company}. Executing next permitted follow-up intervention.`,
      });

      setTimeout(() => {
        setAgentState('MONITORING');
      }, 3000);

      return false;
    }
  };

  const verifyPromiseToPay = async (caseId: string): Promise<boolean> => {
    return verifyPromisePayment(caseId, 'received');
  };

  // Interactive step-by-step resolution on a single case
  const executeStepOnCase = async (caseId: string): Promise<boolean> => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return false;

    setAgentState('ACTING');

    try {
      // Step 1: Execute initial bounded intervention
      const result1 = await reclaimAgent.executeCaseStep(targetCase, guardrails);

      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? result1.updatedCase : c))
      );

      addToast({
        type: result1.updatedCase.status === 'at_risk' ? 'warning' : 'info',
        title: result1.updatedCase.status === 'at_risk' ? 'Guardrail Check' : 'Autonomous Action Dispatched',
        message: result1.message,
      });

      // If the case is now in 'recovering' status, seamlessly perform outcome verification (simulate gateway response)
      if (result1.updatedCase.status === 'recovering') {
        await new Promise((res) => setTimeout(res, 250));
        setAgentState('ACTING');

        const result2 = await reclaimAgent.executeCaseStep(result1.updatedCase, guardrails);

        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? result2.updatedCase : c))
        );

        if (result2.updatedCase.status === 'recovered') {
          setAgentState('RECOVERED');
          addToast({
            type: 'success',
            title: '✓ Recovery Complete',
            message: `₹${result2.updatedCase.amount.toLocaleString('en-IN')} recovered in full! Workflow automatically stopped.`,
          });

          // Trigger confetti celebration
          if (typeof window !== 'undefined') {
            import('canvas-confetti').then((confetti) => {
              confetti.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#16A34A', '#4F46E5', '#2563EB'],
              });
            });
          }
        }
      }

      setTimeout(() => {
        setAgentState('MONITORING');
      }, 3000);

      return true;
    } catch (e) {
      console.error(e);
      setAgentState('MONITORING');
      return false;
    }
  };

  // 100-Case Batch Simulation
  const runBatchSimulation = async (totalCases = 100) => {
    if (batchProgress.isRunning) return;

    const atRiskPool = 284500; // ₹2,84,500
    setBatchProgress({
      isRunning: true,
      stage: 'detecting',
      totalCases,
      processedCases: 0,
      recoveredCount: 0,
      escalatedCount: 0,
      unrecoveredCount: 0,
      revenueAtRisk: atRiskPool,
      recoveredAmount: 0,
      recoveryRate: 0,
    });
    setAgentState('ANALYZING');

    const stages: BatchProcessingProgress['stage'][] = [
      'detecting',
      'analyzing',
      'prioritizing',
      'selecting',
      'executing',
      'verifying',
    ];

    for (let i = 0; i < stages.length; i++) {
      const currentStage = stages[i];
      const progressPercent = ((i + 1) / stages.length) * totalCases;

      await new Promise((res) => setTimeout(res, 650));

      const currentRecoveredCount = Math.round(progressPercent * 0.64);
      const currentEscalatedCount = Math.round(progressPercent * 0.21);
      const currentUnrecoveredCount = Math.round(progressPercent * 0.15);
      const currentRecoveredAmt = Math.round((currentRecoveredCount / 64) * 172400);

      setBatchProgress((prev) => ({
        ...prev,
        stage: currentStage,
        processedCases: Math.min(totalCases, Math.round(progressPercent)),
        recoveredCount: currentRecoveredCount,
        escalatedCount: currentEscalatedCount,
        unrecoveredCount: currentUnrecoveredCount,
        recoveredAmount: currentRecoveredAmt,
        recoveryRate: Number(((currentRecoveredAmt / atRiskPool) * 100).toFixed(1)),
      }));

      if (currentStage === 'executing') setAgentState('ACTING');
    }

    // Final state calculation
    const finalRecoveredAmt = 172400; // ₹1,72,400 recovered
    const finalRecoveredCount = 64;
    const finalEscalatedCount = 21;
    const finalUnrecoveredCount = 15;
    const finalRate = 60.6;

    setBatchProgress({
      isRunning: false,
      stage: 'completed',
      totalCases,
      processedCases: totalCases,
      recoveredCount: finalRecoveredCount,
      escalatedCount: finalEscalatedCount,
      unrecoveredCount: finalUnrecoveredCount,
      revenueAtRisk: atRiskPool,
      recoveredAmount: finalRecoveredAmt,
      recoveryRate: finalRate,
    });

    setAgentState('RECOVERED');

    addToast({
      type: 'success',
      title: 'Batch Recovery Completed',
      message: `Processed 100 cases: 64 recovered (₹1,72,400 recovered at 60.6% recovery rate).`,
    });

    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      });
    }

    setTimeout(() => {
      setAgentState('MONITORING');
    }, 4000);
  };

  // Custom failure injection tool with Idempotency check & Multi-surface support
  const injectSimulatedPayment = (
    customerId: string,
    amount: number,
    reason: FailureReason,
    surface: RevenueType = 'payment',
    eventId?: string
  ) => {
    const resolvedEventId = eventId || `evt_${surface}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    // Idempotency check: If duplicate event ID, prevent duplicate action
    if (idempotencyRegistry.isDuplicate(resolvedEventId)) {
      addToast({
        type: 'warning',
        title: 'Duplicate Event Prevented (Idempotency)',
        message: `Event ${resolvedEventId} has already been processed. Duplicate recovery action blocked.`,
      });
      return;
    }

    const customer = DEMO_CUSTOMERS.find((c) => c.id === customerId) || DEMO_CUSTOMERS[0];
    const probability = reclaimAgent.calculate_recovery_probability(customer, reason, 0);
    const interventionInfo = reclaimAgent.select_intervention(reason, probability, amount, guardrails, customer, surface);
    const caseId = `case-${Date.now().toString(36)}`;
    const paymentId = `${surface === 'checkout' ? 'chk' : surface === 'receivable' ? 'inv' : 'pay'}_${Date.now().toString(36)}`;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newCase: RecoveryCase = {
      id: caseId,
      customerId: customer.id,
      customer,
      paymentId,
      amount,
      status: 'at_risk',
      riskScore: probability > 75 ? 'Low' : probability > 50 ? 'Medium' : 'High',
      recoveryProbability: probability,
      rootCause: reason,
      recommendedAction: interventionInfo.rationale,
      interventionType: interventionInfo.intervention,
      currentAction: 'Pending agent execution',
      nextAction: interventionInfo.rationale,
      attemptsUsed: 0,
      contactAttemptsUsed: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      revenueType: surface,
      eventId: resolvedEventId,
      checkoutDetails: surface === 'checkout' ? {
        abandonmentPoint: 'Payment confirmation',
        sessionId: `sess_${Math.random().toString(36).substr(2, 6)}`,
        cartValue: amount,
        timeSpentSeconds: 120,
      } : undefined,
      receivableDetails: surface === 'receivable' ? {
        invoiceId: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        daysOverdue: 14,
        dueDate: new Date(now.getTime() - 14 * 86400000).toISOString(),
      } : undefined,
      payment: {
        id: paymentId,
        customerId: customer.id,
        amount,
        currency: 'INR',
        status: 'failed',
        failureReason: reason,
        attemptCount: 1,
        provider: 'Razorpay Sandbox',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      decision: {
        id: `dec-${Date.now().toString(36)}`,
        caseId,
        paymentId,
        recommendedAction: interventionInfo.rationale,
        interventionType: interventionInfo.intervention,
        recoveryProbability: probability,
        expectedRecoveryValue: interventionInfo.expectedValue,
        recoveryOptions: interventionInfo.options,
        explanation: `Simulated ${surface} event for ${customer.company}. Root cause: ${reason}. Expected recovery value: ₹${interventionInfo.expectedValue.toLocaleString('en-IN')}.`,
        rationaleItems: [
          { text: `Failure reason: ${reason}`, passed: true, type: 'risk' },
          { text: `LTV: ₹${(customer.lifetimeValue / 100000).toFixed(1)}L`, passed: true, type: 'value' },
          { text: 'Within guardrail bounds', passed: true, type: 'guardrail' },
        ],
        status: 'pending',
        createdAt: now.toISOString(),
      },
      timeline: [
        {
          id: `tl_${Date.now()}_1`,
          timestamp: timeStr,
          actor: 'System',
          event: `Simulated ${surface} failure: ${reason}`,
          details: `Webhook event received for ₹${amount.toLocaleString('en-IN')} (Event ID: ${resolvedEventId})`,
          status: 'completed',
          state: 'ANALYZING',
        },
        {
          id: `tl_${Date.now()}_2`,
          timestamp: timeStr,
          actor: 'Reclaim Agent',
          event: `Assessed recovery probability: ${probability}% · ERV: ₹${interventionInfo.expectedValue.toLocaleString('en-IN')}`,
          toolUsed: 'calculate_recovery_probability',
          details: `Intervention selected: ${interventionInfo.intervention.replace(/_/g, ' ')}`,
          status: 'completed',
          state: 'DECIDING',
        },
      ],
      guardrailChecks: {
        retryLimitPassed: true,
        contactLimitPassed: true,
        quietHoursPassed: true,
        recoveryWindowPassed: true,
        highValueApprovalRequired: amount >= guardrails.highValueApprovalThreshold,
        idempotencyPassed: true,
        actionEligibilityPassed: true,
      },
    };

    setCases((prev) => [newCase, ...prev]);

    addToast({
      type: 'info',
      title: `${surface.toUpperCase()} Loss Event Injected`,
      message: `Created recovery case for ${customer.company} (₹${amount.toLocaleString('en-IN')}). Expected value: ₹${interventionInfo.expectedValue.toLocaleString('en-IN')}.`,
    });
  };

  return (
    <ReclaimContext.Provider
      value={{
        cases,
        kpis,
        guardrails,
        agentState,
        batchProgress,
        activeFilter,
        revenueFilter,
        searchQuery,
        toasts,
        isAskReclaimOpen,
        askReclaimCaseId,
        openAskReclaim,
        closeAskReclaim,
        toggleAskReclaim,
        setActiveFilter,
        setRevenueFilter,
        setSearchQuery,
        updateGuardrails,
        executeStepOnCase,
        runBatchSimulation,
        injectSimulatedPayment,
        createPromiseToPay,
        requestPaymentCommitment,
        verifyPromisePayment,
        verifyPromiseToPay,
        dismissToast,
        addToast,
        getCaseById,
      }}
    >
      {children}
    </ReclaimContext.Provider>
  );
}

export function useReclaim() {
  const context = useContext(ReclaimContext);
  if (!context) {
    throw new Error('useReclaim must be used within a ReclaimProvider');
  }
  return context;
}

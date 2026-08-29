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
} from '@/lib/types';
import { INITIAL_CASES, INITIAL_KPIS, DEMO_CUSTOMERS } from '@/lib/demo-data';
import { DEFAULT_GUARDRAILS } from '@/lib/guardrail-engine';
import { reclaimAgent } from '@/lib/agent-engine';

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
  searchQuery: string;
  toasts: ToastInfo[];
  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  updateGuardrails: (newGuardrails: Partial<Guardrails>) => void;
  executeStepOnCase: (caseId: string) => Promise<boolean>;
  runBatchSimulation: (totalCases?: number) => Promise<void>;
  injectSimulatedPayment: (customerId: string, amount: number, reason: FailureReason) => void;
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
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
        type: 'info',
        title: 'Autonomous Action Dispatched',
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
          setKpis((prev) => {
            const newRecovered = prev.recovered + result2.updatedCase.amount;
            const newAtRisk = Math.max(0, prev.revenueAtRisk - result2.updatedCase.amount);
            const newRecovering = Math.max(0, prev.recovering - result2.updatedCase.amount);
            const newRate = ((newRecovered / (newRecovered + newAtRisk)) * 100);

            return {
              ...prev,
              recovered: newRecovered,
              revenueAtRisk: newAtRisk,
              recovering: newRecovering,
              recoveryRate: Number(newRate.toFixed(1)),
              actionsTaken: prev.actionsTaken + 1,
              eventsProcessed: prev.eventsProcessed + 2,
            };
          });

          setAgentState('RECOVERED');
          addToast({
            type: 'success',
            title: '✓ Payment Recovered',
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

    // Update global KPIs with the batch results
    setKpis((prev) => {
      const newRecovered = prev.recovered + finalRecoveredAmt;
      const newAtRisk = prev.revenueAtRisk;
      return {
        ...prev,
        recovered: newRecovered,
        recoveryRate: Number(((newRecovered / (newRecovered + newAtRisk)) * 100).toFixed(1)),
        eventsProcessed: prev.eventsProcessed + totalCases,
        actionsTaken: prev.actionsTaken + finalRecoveredCount + finalEscalatedCount,
      };
    });

    setAgentState('RECOVERED');

    addToast({
      type: 'success',
      title: 'Batch Recovery Completed',
      message: `Processed 100 cases: 64 recovered (₹1,72,400 recovered at 60.6% recovery rate).`,
    });

    // Confetti
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

  // Custom failed payment injection tool for buildathon demo
  const injectSimulatedPayment = (
    customerId: string,
    amount: number,
    reason: FailureReason
  ) => {
    const customer = DEMO_CUSTOMERS.find((c) => c.id === customerId) || DEMO_CUSTOMERS[0];
    const probability = reclaimAgent.calculate_recovery_probability(customer, reason, 0);
    const interventionInfo = reclaimAgent.select_intervention(reason, probability, amount, guardrails);
    const caseId = `case-${Date.now().toString(36)}`;
    const paymentId = `pay_${Date.now().toString(36)}`;
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
        explanation: `Simulated gateway event for ${customer.company}. Root cause: ${reason}.`,
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
          event: `Simulated payment failure: ${reason}`,
          details: `Razorpay failure event received for ₹${amount.toLocaleString('en-IN')}`,
          status: 'completed',
          state: 'ANALYZING',
        },
        {
          id: `tl_${Date.now()}_2`,
          timestamp: timeStr,
          actor: 'Reclaim Agent',
          event: `Assessed recovery probability: ${probability}%`,
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
      },
    };

    setCases((prev) => [newCase, ...prev]);
    setKpis((prev) => ({
      ...prev,
      revenueAtRisk: prev.revenueAtRisk + amount,
      activeCasesCount: prev.activeCasesCount + 1,
      eventsProcessed: prev.eventsProcessed + 1,
    }));

    addToast({
      type: 'info',
      title: 'Payment Failure Injected',
      message: `Created recovery case for ${customer.company} (₹${amount.toLocaleString('en-IN')}). Probability: ${probability}%.`,
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
        searchQuery,
        toasts,
        setActiveFilter,
        setSearchQuery,
        updateGuardrails,
        executeStepOnCase,
        runBatchSimulation,
        injectSimulatedPayment,
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

import {
  RecoveryCase,
  Customer,
  FailureReason,
  InterventionType,
  TimelineStep,
  Guardrails,
  AgentDecision,
  RecoveryOption,
} from './types';
import { evaluateGuardrails, evaluateStoppingCondition, DEFAULT_GUARDRAILS } from './guardrail-engine';
import { evaluatePolicyGate } from './policy-gate';
import { generateRecoveryOptions, selectBestAction, calculateBaseRecoveryProbability, calculateERV } from './erv-engine';
import { mockPaymentProvider } from './mock-provider';
import { idempotencyRegistry } from './idempotency';

export interface AgentStepResult {
  updatedCase: RecoveryCase;
  newTimelineStep: TimelineStep;
  isComplete: boolean;
  message: string;
}

export class ReclaimAgentEngine {
  // Tool 1: Get Customer Profile
  async get_customer_profile(customer: Customer) {
    return {
      id: customer.id,
      company: customer.company,
      ltv: customer.lifetimeValue,
      history: customer.paymentHistory,
      preferredChannel: customer.preferredChannel,
    };
  }

  // Tool 2: Analyze Failure Root Cause (Multi-surface)
  async analyze_failure(failureReason: FailureReason) {
    switch (failureReason) {
      case 'Insufficient funds':
        return {
          isTransient: true,
          actionFamily: 'retry' as const,
          optimalWaitHours: 20,
          recommendation: 'Smart retry timed with banking clearing cycles.',
        };
      case 'Card expired':
        return {
          isTransient: false,
          actionFamily: 'method_update' as const,
          optimalWaitHours: 0,
          recommendation: 'Request instant 1-click card update via WhatsApp/Email.',
        };
      case 'Mandate failure':
        return {
          isTransient: false,
          actionFamily: 'mandate_refresh' as const,
          optimalWaitHours: 2,
          recommendation: 'Prompt mandate re-authorization or alternate NetBanking.',
        };
      case 'Bank decline':
        return {
          isTransient: true,
          actionFamily: 'payment_link' as const,
          optimalWaitHours: 4,
          recommendation: 'Generate fallback multi-rail UPI/NetBanking payment link.',
        };
      case 'Invoice overdue':
      case 'Customer delayed payment':
        return {
          isTransient: false,
          actionFamily: 'reminder' as const,
          optimalWaitHours: 0,
          recommendation: 'Send executive conversational WhatsApp reminder with 1-click RTGS/UPI link.',
        };
      case 'Payment page abandonment':
      case 'OTP abandonment':
        return {
          isTransient: true,
          actionFamily: 'payment_link' as const,
          optimalWaitHours: 1,
          recommendation: 'Send personalized recovery payment link via WhatsApp with active cart retention.',
        };
      case 'Session timeout':
      case 'Payment method hesitation':
        return {
          isTransient: true,
          actionFamily: 'retry_checkout' as const,
          optimalWaitHours: 0.5,
          recommendation: 'Offer alternate payment rails (UPI / Instant EMI) with saved session context.',
        };
      case 'Partial payment':
        return {
          isTransient: false,
          actionFamily: 'promise_to_pay' as const,
          optimalWaitHours: 0,
          recommendation: 'Record Promise-to-Pay workflow for remaining ledger balance.',
        };
      case 'Repeated overdue invoice':
      case 'High-value enterprise invoice':
        return {
          isTransient: false,
          actionFamily: 'escalation' as const,
          optimalWaitHours: 0,
          recommendation: 'Route to dedicated Account Manager for executive payment reconciliation.',
        };
      default:
        return {
          isTransient: true,
          actionFamily: 'retry' as const,
          optimalWaitHours: 12,
          recommendation: 'Execute standard scheduled retry within guardrails.',
        };
    }
  }

  // Tool 3: Calculate Recovery Probability
  calculate_recovery_probability(customer: Customer, failureReason: FailureReason, attemptsUsed: number): number {
    return calculateBaseRecoveryProbability(customer, failureReason, attemptsUsed);
  }

  // Tool 4: Generate ERV Options
  generate_recovery_options(
    amount: number,
    customer: Customer,
    failureReason: FailureReason,
    revenueType: RecoveryCase['revenueType'],
    attemptsUsed: number
  ): RecoveryOption[] {
    return generateRecoveryOptions(amount, customer, failureReason, revenueType, attemptsUsed);
  }

  // Tool 5: Select Intervention using Expected Recovery Value
  select_intervention(
    failureReason: FailureReason,
    probability: number,
    amount: number,
    guardrails: Guardrails,
    customer?: Customer,
    revenueType: RecoveryCase['revenueType'] = 'payment',
    attemptsUsed: number = 0
  ): { intervention: InterventionType; rationale: string; expectedValue: number; options: RecoveryOption[] } {
    const dummyCust: Customer = customer || {
      id: 'cust-tmp',
      name: 'Customer',
      company: 'Enterprise',
      email: 'billing@example.com',
      phone: '+91 99999 00000',
      customerType: 'Mid-Market',
      lifetimeValue: 300000,
      paymentHistory: { successfulCount: 5, failedCount: 0, lastPaymentDate: new Date().toISOString(), avgTicketSize: amount },
      preferredChannel: 'whatsapp',
    };

    const options = generateRecoveryOptions(amount, dummyCust, failureReason, revenueType, attemptsUsed);
    const bestOption = selectBestAction(
      options,
      guardrails,
      attemptsUsed,
      0,
      guardrails.maxRetries,
      guardrails.maxContactAttempts
    );

    if (amount >= guardrails.highValueApprovalThreshold && guardrails.highValueApprovalRequired) {
      return {
        intervention: revenueType === 'receivable' ? 'account_manager_escalation' : 'notify_account_manager',
        rationale: `Amount ₹${amount.toLocaleString('en-IN')} exceeds high-value threshold (₹${guardrails.highValueApprovalThreshold.toLocaleString('en-IN')}). Highest ERV action requires human sign-off.`,
        expectedValue: bestOption ? bestOption.expectedValue : calculateERV(probability, amount),
        options,
      };
    }

    if (bestOption) {
      return {
        intervention: bestOption.intervention,
        rationale: bestOption.rationale,
        expectedValue: bestOption.expectedValue,
        options,
      };
    }

    return {
      intervention: 'retry_payment',
      rationale: 'Scheduled smart retry within guardrails.',
      expectedValue: calculateERV(probability, amount),
      options,
    };
  }

  // Execute single interactive step on a case with Deterministic Action Gate
  async executeCaseStep(
    currentCase: RecoveryCase,
    guardrails: Guardrails = DEFAULT_GUARDRAILS
  ): Promise<AgentStepResult> {
    const caseCopy: RecoveryCase = JSON.parse(JSON.stringify(currentCase));
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // If already completed or stopped
    if (caseCopy.status === 'recovered' || caseCopy.status === 'stopped' || caseCopy.status === 'escalated') {
      return {
        updatedCase: caseCopy,
        newTimelineStep: {
          id: `tl_${Date.now()}`,
          timestamp: timeStr,
          actor: 'System',
          event: 'Workflow already concluded',
          details: `Case is in ${caseCopy.status.toUpperCase()} state.`,
          status: 'completed',
          state: 'STOPPED',
        },
        isComplete: true,
        message: 'Workflow has already concluded.',
      };
    }

    // Step Logic based on current state
    if (caseCopy.status === 'at_risk') {
      // 1. Calculate ERV and generate recovery options if not present
      if (!caseCopy.decision.recoveryOptions || caseCopy.decision.recoveryOptions.length === 0) {
        caseCopy.decision.recoveryOptions = generateRecoveryOptions(
          caseCopy.amount,
          caseCopy.customer,
          caseCopy.rootCause,
          caseCopy.revenueType || 'payment',
          caseCopy.attemptsUsed
        );
        const best = caseCopy.decision.recoveryOptions[0];
        if (best) {
          caseCopy.decision.expectedRecoveryValue = best.expectedValue;
        }
      }

      // 2. Evaluate Deterministic Policy Gate
      const policyResult = evaluatePolicyGate(
        caseCopy,
        caseCopy.interventionType,
        guardrails,
        idempotencyRegistry.getRegistry()
      );

      const retryCheck = policyResult.checks.find((c) => c.name === 'Retry limit');
      const contactCheck = policyResult.checks.find((c) => c.name === 'Contact frequency');
      const quietCheck = policyResult.checks.find((c) => c.name === 'Quiet hours');
      const windowCheck = policyResult.checks.find((c) => c.name === 'Recovery window');
      const thresholdCheck = policyResult.checks.find((c) => c.name === 'Amount threshold');
      const idempCheck = policyResult.checks.find((c) => c.name === 'Idempotency');

      caseCopy.guardrailChecks = {
        retryLimitPassed: retryCheck ? retryCheck.passed : true,
        contactLimitPassed: contactCheck ? contactCheck.passed : true,
        quietHoursPassed: quietCheck ? quietCheck.passed : true,
        recoveryWindowPassed: windowCheck ? windowCheck.passed : true,
        highValueApprovalRequired: thresholdCheck ? !thresholdCheck.passed : false,
        idempotencyPassed: idempCheck ? idempCheck.passed : true,
        actionEligibilityPassed: policyResult.approved,
      };

      // Check if policy gate blocked execution
      if (!policyResult.approved) {
        const blockMessage = policyResult.blockReason || 'Action gated by safety boundaries.';
        caseCopy.currentAction = `Policy Blocked: ${blockMessage}`;

        const blockStep: TimelineStep = {
          id: `tl_${Date.now()}`,
          timestamp: timeStr,
          actor: 'Reclaim Agent',
          event: `Deterministic policy gate: Action Blocked`,
          toolUsed: 'check_guardrails',
          details: blockMessage,
          status: 'failed',
          state: 'WAITING',
        };
        caseCopy.timeline.push(blockStep);

        return {
          updatedCase: caseCopy,
          newTimelineStep: blockStep,
          isComplete: false,
          message: blockMessage,
        };
      }

      // Idempotency: register event
      if (caseCopy.eventId) {
        idempotencyRegistry.registerEvent(caseCopy.eventId);
      }

      // Transition to Recovering and execute tool
      caseCopy.status = 'recovering';
      caseCopy.attemptsUsed += 1;
      if (['send_whatsapp_reminder', 'send_email_reminder', 'send_followup', 'send_payment_link'].includes(caseCopy.interventionType)) {
        caseCopy.contactAttemptsUsed += 1;
      }
      caseCopy.currentAction = `Executing ${caseCopy.interventionType.replace(/_/g, ' ')}`;

      const step: TimelineStep = {
        id: `tl_${Date.now()}`,
        timestamp: timeStr,
        actor: 'Reclaim Agent',
        event: `Executed recovery action: ${caseCopy.recommendedAction}`,
        toolUsed: caseCopy.interventionType,
        details: `Dispatched bounded intervention (ERV: ₹${(caseCopy.decision.expectedRecoveryValue || caseCopy.amount).toLocaleString('en-IN')}). Policy gate: APPROVED.`,
        status: 'completed',
        state: 'ACTING',
      };
      caseCopy.timeline.push(step);

      return {
        updatedCase: caseCopy,
        newTimelineStep: step,
        isComplete: false,
        message: `Action approved & executed: ${caseCopy.recommendedAction}`,
      };
    }

    if (caseCopy.status === 'recovering') {
      // Execute Verification & Recovery based on surface
      const paymentResult = await mockPaymentProvider.retryPayment(caseCopy.paymentId);

      if (paymentResult.success) {
        caseCopy.status = 'recovered';
        caseCopy.recoveredAmount = caseCopy.amount;
        caseCopy.payment.status = 'success';
        caseCopy.currentAction = 'Payment verified & recovered';
        caseCopy.nextAction = 'Workflow stopped automatically';

        const surfaceLabel =
          caseCopy.revenueType === 'checkout'
            ? 'Checkout payment confirmed'
            : caseCopy.revenueType === 'receivable'
            ? 'Invoice settlement verified'
            : 'Payment authorization confirmed';

        const verifyStep: TimelineStep = {
          id: `tl_${Date.now()}_v`,
          timestamp: timeStr,
          actor: 'System',
          event: `${surfaceLabel}: SUCCESS`,
          toolUsed: 'verify_payment_outcome',
          details: `Settlement confirmed. ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(caseCopy.amount)} recovered.`,
          result: `✓ ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(caseCopy.amount)} recovered`,
          status: 'completed',
          state: 'RECOVERED',
        };

        const stopStep: TimelineStep = {
          id: `tl_${Date.now()}_s`,
          timestamp: timeStr,
          actor: 'Reclaim Agent',
          event: 'Workflow automatically stopped',
          toolUsed: 'stop_workflow',
          details: 'Recovery objective fulfilled. Bounded execution complete. No further actions needed.',
          result: 'Clean stop',
          status: 'completed',
          state: 'STOPPED',
        };

        caseCopy.timeline.push(verifyStep, stopStep);
        caseCopy.decision.status = 'completed';
        caseCopy.decision.outcome = `Successfully recovered ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(caseCopy.amount)}`;
        caseCopy.decision.recoveredAmount = caseCopy.amount;

        return {
          updatedCase: caseCopy,
          newTimelineStep: stopStep,
          isComplete: true,
          message: `✓ Successfully recovered ₹${caseCopy.amount.toLocaleString('en-IN')}! Workflow stopped.`,
        };
      } else {
        // Failed attempt, check stopping conditions
        const stoppingCheck = evaluateStoppingCondition(caseCopy, guardrails);
        if (stoppingCheck.shouldStop) {
          caseCopy.status = stoppingCheck.nextStatus;
          caseCopy.currentAction = stoppingCheck.reason;
          const stopStep: TimelineStep = {
            id: `tl_${Date.now()}_stp`,
            timestamp: timeStr,
            actor: 'Reclaim Agent',
            event: `Stopping condition triggered: ${stoppingCheck.nextStatus.toUpperCase()}`,
            toolUsed: stoppingCheck.nextStatus === 'escalated' ? 'escalate_case' : 'stop_workflow',
            details: stoppingCheck.reason,
            status: 'completed',
            state: stoppingCheck.nextStatus === 'escalated' ? 'ESCALATED' : 'STOPPED',
          };
          caseCopy.timeline.push(stopStep);
          return {
            updatedCase: caseCopy,
            newTimelineStep: stopStep,
            isComplete: true,
            message: stoppingCheck.reason,
          };
        }
      }
    }

    return {
      updatedCase: caseCopy,
      newTimelineStep: {
        id: `tl_${Date.now()}`,
        timestamp: timeStr,
        actor: 'Reclaim Agent',
        event: 'Action queued',
        details: 'Scheduled for next execution cycle',
        status: 'in_progress',
        state: 'WAITING',
      },
      isComplete: false,
      message: 'Action queued',
    };
  }
}

export const reclaimAgent = new ReclaimAgentEngine();


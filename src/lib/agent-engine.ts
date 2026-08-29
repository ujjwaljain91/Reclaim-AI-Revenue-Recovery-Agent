import {
  RecoveryCase,
  Customer,
  FailureReason,
  InterventionType,
  TimelineStep,
  Guardrails,
  AgentDecision,
} from './types';
import { evaluateGuardrails, evaluateStoppingCondition, DEFAULT_GUARDRAILS } from './guardrail-engine';
import { mockPaymentProvider } from './mock-provider';

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

  // Tool 2: Analyze Failure Root Cause
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
        return {
          isTransient: false,
          actionFamily: 'reminder' as const,
          optimalWaitHours: 0,
          recommendation: 'Send executive conversational WhatsApp reminder.',
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
    let baseScore = 60;

    // History weighting
    if (customer.paymentHistory.failedCount === 0 && customer.paymentHistory.successfulCount > 3) {
      baseScore += 22; // High reliability boost
    } else if (customer.paymentHistory.failedCount > 2) {
      baseScore -= 18;
    }

    // Failure reason weighting
    if (failureReason === 'Insufficient funds') baseScore += 4;
    if (failureReason === 'Invoice overdue') baseScore += 10;
    if (failureReason === 'Bank decline') baseScore -= 5;
    if (failureReason === 'Mandate failure') baseScore -= 10;

    // Attempt degradation
    baseScore -= attemptsUsed * 15;

    // LTV factor
    if (customer.lifetimeValue > 300000) baseScore += 6;

    return Math.min(96, Math.max(15, baseScore));
  }

  // Tool 4: Select Intervention
  select_intervention(
    failureReason: FailureReason,
    probability: number,
    amount: number,
    guardrails: Guardrails
  ): { intervention: InterventionType; rationale: string } {
    if (amount >= guardrails.highValueApprovalThreshold && guardrails.highValueApprovalRequired) {
      return {
        intervention: 'notify_account_manager',
        rationale: `Amount exceeds high-value threshold (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(guardrails.highValueApprovalThreshold)}). Requires human sign-off.`,
      };
    }

    if (failureReason === 'Card expired') {
      return {
        intervention: 'request_payment_method_update',
        rationale: 'Card expiry detected. Direct retry will fail; payment method update requested.',
      };
    }

    if (failureReason === 'Invoice overdue') {
      return {
        intervention: 'send_whatsapp_reminder',
        rationale: 'Overdue invoice; instant conversational WhatsApp reminder recommended.',
      };
    }

    if (failureReason === 'Bank decline') {
      return {
        intervention: 'generate_payment_link',
        rationale: 'Issuer decline; multi-rail UPI/NetBanking payment link generated.',
      };
    }

    return {
      intervention: 'retry_payment',
      rationale: 'Transient failure with strong recovery probability. Scheduled smart retry.',
    };
  }

  // Execute single interactive step on a case
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
      // Step: Run Diagnosis & Guardrail verification -> transition to ACTING / RECOVERING
      const guardrailEval = evaluateGuardrails(caseCopy, guardrails);
      caseCopy.guardrailChecks = {
        retryLimitPassed: guardrailEval.retryLimitPassed,
        contactLimitPassed: guardrailEval.contactLimitPassed,
        quietHoursPassed: guardrailEval.quietHoursPassed,
        recoveryWindowPassed: guardrailEval.recoveryWindowPassed,
        highValueApprovalRequired: guardrailEval.highValueApprovalRequired,
      };

      if (guardrailEval.highValueApprovalRequired && !currentCase.decision.executedAt) {
        caseCopy.currentAction = 'High-value approval required before autonomous action';
        const step: TimelineStep = {
          id: `tl_${Date.now()}`,
          timestamp: timeStr,
          actor: 'Reclaim Agent',
          event: 'Guardrail check: High-value approval required',
          toolUsed: 'check_guardrails',
          details: `Case amount ₹${caseCopy.amount.toLocaleString('en-IN')} exceeds threshold of ₹${guardrails.highValueApprovalThreshold.toLocaleString('en-IN')}.`,
          status: 'completed',
          state: 'WAITING',
        };
        caseCopy.timeline.push(step);
        return {
          updatedCase: caseCopy,
          newTimelineStep: step,
          isComplete: false,
          message: 'Paused for high-value human approval.',
        };
      }

      // Transition to Recovering and execute tool
      caseCopy.status = 'recovering';
      caseCopy.attemptsUsed += 1;
      caseCopy.currentAction = `Executing ${caseCopy.interventionType.replace(/_/g, ' ')}`;

      const step: TimelineStep = {
        id: `tl_${Date.now()}`,
        timestamp: timeStr,
        actor: 'Reclaim Agent',
        event: `Executed recovery action: ${caseCopy.recommendedAction}`,
        toolUsed: caseCopy.interventionType,
        details: `Dispatched bounded recovery action via ${caseCopy.payment.provider}. Attempt ${caseCopy.attemptsUsed}/${guardrails.maxRetries}.`,
        status: 'completed',
        state: 'ACTING',
      };
      caseCopy.timeline.push(step);

      return {
        updatedCase: caseCopy,
        newTimelineStep: step,
        isComplete: false,
        message: `Action executed: ${caseCopy.recommendedAction}`,
      };
    }

    if (caseCopy.status === 'recovering') {
      // Execute Verification & Recovery
      const paymentResult = await mockPaymentProvider.retryPayment(caseCopy.paymentId);

      if (paymentResult.success) {
        caseCopy.status = 'recovered';
        caseCopy.recoveredAmount = caseCopy.amount;
        caseCopy.payment.status = 'success';
        caseCopy.currentAction = 'Payment verified & recovered';
        caseCopy.nextAction = 'Workflow stopped automatically';

        const verifyStep: TimelineStep = {
          id: `tl_${Date.now()}_v`,
          timestamp: timeStr,
          actor: 'System',
          event: 'Payment webhook received: SUCCESS',
          toolUsed: 'verify_payment_outcome',
          details: `Payment authorization confirmed via Razorpay. ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(caseCopy.amount)} recovered.`,
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
          details: 'Recovery objective fulfilled. No further actions or notifications needed.',
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

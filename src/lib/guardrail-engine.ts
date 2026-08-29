import { Guardrails, RecoveryCase, CaseStatus } from './types';

export const DEFAULT_GUARDRAILS: Guardrails = {
  maxRetries: 2,
  maxContactAttempts: 3,
  recoveryWindowDays: 7,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  humanEscalationEnabled: true,
  humanEscalationTrigger: 'after_final_attempt',
  highValueApprovalRequired: true,
  highValueApprovalThreshold: 50000, // INR
  allowedChannels: ['whatsapp', 'email', 'payment_link'],
  autoExecuteHighConfidence: true,
  confidenceThreshold: 75,
};

export function isQuietHours(startStr: string, endStr: string): boolean {
  const now = new Date();
  const currentHours = now.getHours();
  const [startH] = startStr.split(':').map(Number);
  const [endH] = endStr.split(':').map(Number);

  if (startH > endH) {
    // e.g. 22:00 to 08:00
    return currentHours >= startH || currentHours < endH;
  }
  return currentHours >= startH && currentHours < endH;
}

export function evaluateGuardrails(
  recoveryCase: Partial<RecoveryCase>,
  guardrails: Guardrails = DEFAULT_GUARDRAILS
) {
  const attemptsUsed = recoveryCase.attemptsUsed || 0;
  const contactAttemptsUsed = recoveryCase.contactAttemptsUsed || 0;
  const amount = recoveryCase.amount || 0;

  const retryLimitPassed = attemptsUsed < guardrails.maxRetries;
  const contactLimitPassed = contactAttemptsUsed < guardrails.maxContactAttempts;
  const quietHoursPassed = !isQuietHours(guardrails.quietHoursStart, guardrails.quietHoursEnd);
  
  // High value check
  const highValueApprovalRequired = guardrails.highValueApprovalRequired && amount >= guardrails.highValueApprovalThreshold;

  // Recovery window check
  const createdAt = recoveryCase.createdAt ? new Date(recoveryCase.createdAt) : new Date();
  const daysDiff = (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
  const recoveryWindowPassed = daysDiff <= guardrails.recoveryWindowDays;

  return {
    retryLimitPassed,
    contactLimitPassed,
    quietHoursPassed,
    recoveryWindowPassed,
    highValueApprovalRequired,
    canAutoExecute:
      retryLimitPassed &&
      contactLimitPassed &&
      recoveryWindowPassed &&
      !highValueApprovalRequired &&
      (recoveryCase.recoveryProbability || 0) >= guardrails.confidenceThreshold,
  };
}

export function evaluateStoppingCondition(
  recoveryCase: RecoveryCase,
  guardrails: Guardrails = DEFAULT_GUARDRAILS
): { shouldStop: boolean; reason: string; nextStatus: CaseStatus } {
  // 1. Payment Success -> Stop with Recovered
  if (recoveryCase.status === 'recovered' || (recoveryCase.recoveredAmount && recoveryCase.recoveredAmount > 0)) {
    return {
      shouldStop: true,
      reason: `Payment recovered in full (${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(recoveryCase.amount)}). Workflow automatically stopped.`,
      nextStatus: 'recovered',
    };
  }

  // 2. Retry limit exceeded
  if (recoveryCase.attemptsUsed >= guardrails.maxRetries) {
    if (guardrails.humanEscalationEnabled) {
      return {
        shouldStop: true,
        reason: `Exceeded maximum allowed retry attempts (${guardrails.maxRetries}/${guardrails.maxRetries}). Escalated to human operations.`,
        nextStatus: 'escalated',
      };
    }
    return {
      shouldStop: true,
      reason: `Exceeded maximum retry limit (${guardrails.maxRetries}). Stopped bounded recovery workflow.`,
      nextStatus: 'stopped',
    };
  }

  // 3. Contact attempts exceeded
  if (recoveryCase.contactAttemptsUsed >= guardrails.maxContactAttempts) {
    return {
      shouldStop: true,
      reason: `Maximum customer contact attempts reached (${guardrails.maxContactAttempts}). Escalated to account manager.`,
      nextStatus: 'escalated',
    };
  }

  // 4. Recovery window expired
  const createdAt = new Date(recoveryCase.createdAt);
  const daysDiff = (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
  if (daysDiff > guardrails.recoveryWindowDays) {
    return {
      shouldStop: true,
      reason: `Recovery window of ${guardrails.recoveryWindowDays} days has elapsed. Stopped active workflow.`,
      nextStatus: 'stopped',
    };
  }

  return {
    shouldStop: false,
    reason: 'Active within guardrails',
    nextStatus: recoveryCase.status,
  };
}

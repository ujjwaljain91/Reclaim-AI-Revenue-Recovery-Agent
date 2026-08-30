import { Guardrails, RecoveryCase, PolicyCheck, PolicyGateResult, InterventionType } from './types';
import { isQuietHours } from './guardrail-engine';

// ─── Deterministic Policy Gate ───────────────────────────────────────────────
// Sits between AI recommendation and execution. Every action must pass ALL checks.
// Architecture: AI diagnosis → Recovery strategy → ERV → Policy Gate → Execution

const CONTACT_INTERVENTIONS: InterventionType[] = [
  'send_whatsapp_reminder',
  'send_email_reminder',
  'send_payment_link',
  'generate_payment_link',
  'send_followup',
];

const RETRY_INTERVENTIONS: InterventionType[] = [
  'retry_payment',
  'retry_checkout_session',
  'schedule_mandate_retry',
];

export function evaluatePolicyGate(
  recoveryCase: RecoveryCase,
  intervention: InterventionType,
  guardrails: Guardrails,
  processedEventIds?: Set<string>
): PolicyGateResult {
  const checks: PolicyCheck[] = [];
  let approved = true;
  let blockReason: string | undefined;

  // 1. Retry limit check
  const isRetryAction = RETRY_INTERVENTIONS.includes(intervention);
  const retryPassed = !isRetryAction || recoveryCase.attemptsUsed < guardrails.maxRetries;
  checks.push({
    name: 'Retry limit',
    passed: retryPassed,
    detail: retryPassed
      ? `${recoveryCase.attemptsUsed}/${guardrails.maxRetries} attempts used`
      : `Maximum retry limit of ${guardrails.maxRetries} reached`,
  });
  if (!retryPassed) {
    approved = false;
    blockReason = `Retry blocked because the maximum retry limit of ${guardrails.maxRetries} has been reached.`;
  }

  // 2. Contact limit check
  const isContactAction = CONTACT_INTERVENTIONS.includes(intervention);
  const contactPassed = !isContactAction || recoveryCase.contactAttemptsUsed < guardrails.maxContactAttempts;
  checks.push({
    name: 'Contact frequency',
    passed: contactPassed,
    detail: contactPassed
      ? `${recoveryCase.contactAttemptsUsed}/${guardrails.maxContactAttempts} contacts used`
      : `Maximum contact limit of ${guardrails.maxContactAttempts} reached`,
  });
  if (!contactPassed && approved) {
    approved = false;
    blockReason = `Contact blocked because the maximum contact limit of ${guardrails.maxContactAttempts} has been reached.`;
  }

  // 3. Recovery window check
  const createdAt = new Date(recoveryCase.createdAt);
  const daysDiff = (new Date().getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
  const windowPassed = daysDiff <= guardrails.recoveryWindowDays;
  checks.push({
    name: 'Recovery window',
    passed: windowPassed,
    detail: windowPassed
      ? `${Math.floor(daysDiff)} of ${guardrails.recoveryWindowDays} days elapsed`
      : `Recovery window of ${guardrails.recoveryWindowDays} days has expired`,
  });
  if (!windowPassed && approved) {
    approved = false;
    blockReason = `Action blocked because the ${guardrails.recoveryWindowDays}-day recovery window has elapsed.`;
  }

  // 4. High-value approval threshold
  const needsApproval = guardrails.highValueApprovalRequired && recoveryCase.amount >= guardrails.highValueApprovalThreshold;
  const isHumanAction = intervention === 'human_escalation' || intervention === 'notify_account_manager' || intervention === 'account_manager_escalation';
  const thresholdPassed = !needsApproval || isHumanAction;
  checks.push({
    name: 'Amount threshold',
    passed: thresholdPassed,
    detail: thresholdPassed
      ? recoveryCase.amount < guardrails.highValueApprovalThreshold
        ? `₹${recoveryCase.amount.toLocaleString('en-IN')} below ₹${guardrails.highValueApprovalThreshold.toLocaleString('en-IN')} threshold`
        : `High-value action routed to human approval`
      : `Amount ₹${recoveryCase.amount.toLocaleString('en-IN')} exceeds autonomous threshold of ₹${guardrails.highValueApprovalThreshold.toLocaleString('en-IN')}`,
  });
  if (!thresholdPassed && approved) {
    approved = false;
    blockReason = `Action blocked because amount ₹${recoveryCase.amount.toLocaleString('en-IN')} exceeds the high-value approval threshold.`;
  }

  // 5. Quiet hours check
  const quietPassed = !isContactAction || !isQuietHours(guardrails.quietHoursStart, guardrails.quietHoursEnd);
  checks.push({
    name: 'Quiet hours',
    passed: quietPassed,
    detail: quietPassed
      ? 'Within permitted contact hours'
      : `Contact blocked during quiet hours (${guardrails.quietHoursStart} – ${guardrails.quietHoursEnd})`,
  });
  if (!quietPassed && approved) {
    approved = false;
    blockReason = `Contact action blocked during quiet hours (${guardrails.quietHoursStart} – ${guardrails.quietHoursEnd}).`;
  }

  // 6. Idempotency check
  const eventId = recoveryCase.eventId;
  const idempotencyPassed = !eventId || !processedEventIds || !processedEventIds.has(eventId);
  checks.push({
    name: 'Idempotency',
    passed: idempotencyPassed,
    detail: idempotencyPassed
      ? 'No duplicate event detected'
      : `Duplicate event ${eventId} detected — action already processed`,
  });
  if (!idempotencyPassed && approved) {
    approved = false;
    blockReason = `Duplicate action prevented — event ${eventId} has already been processed.`;
  }

  // 7. Action eligibility check (terminal states cannot have new actions)
  const terminalStatuses = ['recovered', 'stopped'];
  const eligibilityPassed = !terminalStatuses.includes(recoveryCase.status);
  checks.push({
    name: 'Action eligibility',
    passed: eligibilityPassed,
    detail: eligibilityPassed
      ? `Case is in ${recoveryCase.status} state — eligible for action`
      : `Case is in ${recoveryCase.status} state — no further actions permitted`,
  });
  if (!eligibilityPassed && approved) {
    approved = false;
    blockReason = `Action blocked because the case is already in ${recoveryCase.status} state.`;
  }

  return { approved, checks, blockReason };
}

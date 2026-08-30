import {
  RecoveryCase,
  Customer,
  FailureReason,
  InterventionType,
  RecoveryOption,
  Guardrails,
  RevenueType,
  LearningSignal,
} from './types';
import { learningEngine } from './learning-engine';

// ─── Intervention Profiles by Surface ────────────────────────────────────────

interface InterventionProfile {
  intervention: InterventionType;
  label: string;
  applicableTo: RevenueType[];
  probabilityModifier: (baseProb: number, reason: FailureReason, customer: Customer) => number;
}

const INTERVENTION_PROFILES: InterventionProfile[] = [
  // ── Payment Interventions (Section 2) ──
  {
    intervention: 'retry_payment',
    label: 'Retry payment',
    applicableTo: ['payment'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Insufficient funds') return base * 1.05;
      if (reason === 'Network failure' || reason === 'Payment timeout') return base * 1.1;
      if (reason === 'Card expired') return base * 0.1;
      if (reason === 'Mandate failure') return base * 0.3;
      return base * 0.85;
    },
  },
  {
    intervention: 'generate_payment_link',
    label: 'Payment link',
    applicableTo: ['payment', 'receivable'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Bank decline') return base * 0.95;
      if (reason === 'Invoice overdue' || reason === 'Customer delayed payment') return base * 0.9;
      return base * 0.75;
    },
  },
  {
    intervention: 'request_payment_method_update',
    label: 'Payment-method update',
    applicableTo: ['payment'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Card expired') return base * 1.15;
      if (reason === 'Mandate failure') return base * 0.9;
      return base * 0.5;
    },
  },
  {
    intervention: 'send_whatsapp_reminder',
    label: 'Reminder',
    applicableTo: ['payment', 'checkout', 'receivable'],
    probabilityModifier: (base, reason, customer) => {
      const channelBoost = customer.preferredChannel === 'whatsapp' ? 1.1 : 0.85;
      if (reason === 'Invoice overdue' || reason === 'Customer delayed payment') return base * 1.0 * channelBoost;
      if (reason === 'Payment page abandonment') return base * 0.9 * channelBoost;
      return base * 0.65 * channelBoost;
    },
  },
  {
    intervention: 'human_escalation',
    label: 'Human escalation',
    applicableTo: ['payment', 'checkout'],
    probabilityModifier: (base, reason, customer) => {
      if (customer.customerType === 'Enterprise') return base * 1.1;
      if (customer.lifetimeValue > 500000) return base * 1.05;
      return base * 0.9;
    },
  },

  // ── Checkout Interventions (Section 2) ──
  {
    intervention: 'send_payment_link',
    label: 'Payment link',
    applicableTo: ['checkout'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Payment page abandonment' || reason === 'OTP abandonment') return base * 1.12;
      if (reason === 'High-value checkout abandonment') return base * 0.98;
      if (reason === 'Session timeout') return base * 1.05;
      return base * 0.85;
    },
  },
  {
    intervention: 'retry_checkout_session',
    label: 'Session recovery',
    applicableTo: ['checkout'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Session timeout') return base * 1.15;
      if (reason === 'Payment method hesitation') return base * 0.92;
      return base * 0.7;
    },
  },

  // ── Receivables Interventions (Section 2) ──
  {
    intervention: 'send_followup',
    label: 'Follow-up',
    applicableTo: ['receivable'],
    probabilityModifier: (base, reason) => {
      if (reason === 'Invoice overdue' || reason === 'Customer delayed payment') return base * 1.05;
      if (reason === 'Repeated overdue invoice') return base * 0.7;
      return base * 0.85;
    },
  },
  {
    intervention: 'promise_to_pay',
    label: 'Promise-to-Pay',
    applicableTo: ['receivable'],
    probabilityModifier: (base, reason, customer) => {
      if (customer.paymentHistory.successfulCount > 5) return base * 1.12;
      if (reason === 'Repeated overdue invoice') return base * 0.65;
      return base * 0.95;
    },
  },
  {
    intervention: 'account_manager_escalation',
    label: 'Account-manager escalation',
    applicableTo: ['receivable'],
    probabilityModifier: (base, reason, customer) => {
      if (customer.customerType === 'Enterprise' && customer.lifetimeValue > 300000) return base * 1.15;
      if (reason === 'High-value enterprise invoice') return base * 1.1;
      return base * 0.8;
    },
  },
];

// ─── ERV Calculation ─────────────────────────────────────────────────────────

export function calculateERV(probability: number, amount: number): number {
  return Math.round((probability / 100) * amount);
}

// ─── Base Recovery Probability ───────────────────────────────────────────────

export function calculateBaseRecoveryProbability(
  customer: Customer,
  failureReason: FailureReason,
  attemptsUsed: number
): number {
  let baseScore = 60;

  // History weighting
  if (customer.paymentHistory.failedCount === 0 && customer.paymentHistory.successfulCount > 3) {
    baseScore += 22;
  } else if (customer.paymentHistory.failedCount > 2) {
    baseScore -= 18;
  }

  // Failure reason weighting
  if (failureReason === 'Insufficient funds') baseScore += 4;
  if (failureReason === 'Invoice overdue') baseScore += 10;
  if (failureReason === 'Bank decline') baseScore -= 5;
  if (failureReason === 'Mandate failure') baseScore -= 10;
  if (failureReason === 'Card expired') baseScore += 2;
  if (failureReason === 'Payment page abandonment') baseScore += 8;
  if (failureReason === 'OTP abandonment') baseScore += 5;
  if (failureReason === 'Session timeout') baseScore += 12;
  if (failureReason === 'Customer delayed payment') baseScore += 6;
  if (failureReason === 'Partial payment') baseScore += 15;
  if (failureReason === 'Payment method hesitation') baseScore += 3;
  if (failureReason === 'Repeated overdue invoice') baseScore -= 12;
  if (failureReason === 'High-value enterprise invoice') baseScore -= 3;
  if (failureReason === 'High-value checkout abandonment') baseScore -= 2;

  // Attempt degradation
  baseScore -= attemptsUsed * 15;

  // LTV factor
  if (customer.lifetimeValue > 300000) baseScore += 6;

  return Math.min(96, Math.max(15, baseScore));
}

// ─── Generate Surface-Specific Valid Recovery Options with ERV ───────────────

export function generateRecoveryOptions(
  amount: number,
  customer: Customer,
  failureReason: FailureReason,
  revenueType: RevenueType = 'payment',
  attemptsUsed: number = 0,
  useAdaptiveLearning: boolean = true
): RecoveryOption[] {
  const baseProb = calculateBaseRecoveryProbability(customer, failureReason, attemptsUsed);

  // Filter to strictly valid interventions for this surface
  const applicableProfiles = INTERVENTION_PROFILES.filter((p) =>
    p.applicableTo.includes(revenueType)
  );

  const options: RecoveryOption[] = applicableProfiles.map((profile) => {
    let adjustedProb = Math.round(profile.probabilityModifier(baseProb, failureReason, customer));

    // Phase 5 Learning: Adjust with historical outcome data if available
    if (useAdaptiveLearning) {
      const signal = learningEngine.evaluateLearningSignal(failureReason, profile.intervention, customer.customerType);
      if (signal.sampleSize >= 10) {
        // Apply weighted Bayesian blending between base estimation and historical outcome
        const weight = Math.min(0.35, signal.sampleSize / 400);
        adjustedProb = Math.round((1 - weight) * adjustedProb + weight * signal.historicalRate);
      }
    }

    adjustedProb = Math.min(96, Math.max(5, adjustedProb));
    const expectedValue = calculateERV(adjustedProb, amount);

    return {
      intervention: profile.intervention,
      label: profile.label,
      probability: adjustedProb,
      expectedValue,
      rationale: `${profile.label}: ${adjustedProb}% probability → ${formatERV(expectedValue)} expected recovery`,
    };
  });

  // Sort by expected value descending
  return options.sort((a, b) => b.expectedValue - a.expectedValue);
}

// ─── Select Best Permitted Action ────────────────────────────────────────────

export function selectBestAction(
  options: RecoveryOption[],
  _guardrails: Guardrails,
  attemptsUsed: number,
  contactAttemptsUsed: number,
  maxRetries: number,
  maxContacts: number
): RecoveryOption | null {
  for (const option of options) {
    // Filter out retry if at limit
    if (option.intervention === 'retry_payment' && attemptsUsed >= maxRetries) continue;
    if (option.intervention === 'retry_checkout_session' && attemptsUsed >= maxRetries) continue;

    // Filter out contact-based actions if at contact limit
    const contactActions: InterventionType[] = [
      'send_whatsapp_reminder',
      'send_email_reminder',
      'send_payment_link',
      'send_followup',
    ];
    if (contactActions.includes(option.intervention) && contactAttemptsUsed >= maxContacts) continue;

    return option;
  }
  // Fallback to escalation
  return options.find((o) => o.intervention === 'human_escalation' || o.intervention === 'account_manager_escalation') || null;
}

function formatERV(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

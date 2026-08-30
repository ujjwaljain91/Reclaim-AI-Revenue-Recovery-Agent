import {
  RecoveryCase,
  Customer,
  Payment,
  AgentDecision,
  SimulationConfig,
  FailureReason,
  RevenueType,
  InterventionType,
  CheckoutDetails,
  ReceivableDetails,
} from './types';
import { calculateBaseRecoveryProbability, generateRecoveryOptions } from './erv-engine';
import { DEFAULT_GUARDRAILS } from './guardrail-engine';

// ─── Seeded Random ───────────────────────────────────────────────────────────
// Deterministic RNG for reproducible demo results

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

// ─── Name Pools ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Aarav', 'Rohan', 'Priya', 'Ananya', 'Siddharth', 'Kavita', 'Arjun', 'Devika',
  'Sameer', 'Nisha', 'Rahul', 'Meera', 'Vikram', 'Neha', 'Karan', 'Riya',
  'Aditya', 'Pooja', 'Manish', 'Shreya', 'Gaurav', 'Anjali', 'Amit', 'Sunita',
  'Rajesh', 'Divya', 'Suresh', 'Tanvi', 'Varun', 'Ishita', 'Nikhil', 'Pallavi',
  'Deepak', 'Swati', 'Harish', 'Jyoti', 'Mohit', 'Komal', 'Ashish', 'Bhavna',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Deshmukh', 'Varma', 'Nair', 'Gupta', 'Kulkarni',
  'Singhania', 'Rao', 'Mehta', 'Joshi', 'Kumar', 'Reddy', 'Chauhan', 'Verma',
  'Iyer', 'Agarwal', 'Mishra', 'Bhat', 'Shah', 'Das', 'Kapoor', 'Malhotra',
  'Shetty', 'Pillai', 'Thakur', 'Saxena', 'Trivedi', 'Pandey',
];

const COMPANIES = [
  'TechVista Solutions', 'CloudNine SaaS', 'DataPulse Analytics', 'QuantumEdge AI',
  'NovaBridge Technologies', 'HexaWave Digital', 'Pinnacle Software', 'BlueShift Labs',
  'IronMesh Networks', 'VelocityPay', 'FinStack India', 'OmniPay Solutions',
  'Arclight Technologies', 'SkyForge Cloud', 'Meridian Payments', 'CyberRoot Systems',
  'ApexLogic AI', 'NebulaSync', 'GridPoint Infra', 'Zentra Commerce',
  'PulseMetric Inc', 'ShieldWall Security', 'BrightPath Analytics', 'IndiGo Fintech',
  'TurboScale Cloud', 'LuminaAI', 'FluxPoint SaaS', 'CorePay Systems',
  'NexaWorks Digital', 'PrimeTech Solutions', 'Orion Commerce', 'StratosPay',
  'AetherSoft', 'VibrantEdge', 'MetaFlow Systems', 'RapidFin Technologies',
  'NorthStar Digital', 'EcoSphere SaaS', 'CrystalByte Labs', 'FusionPay',
];

const ACCOUNT_MANAGERS = ['Priya Mehta', 'Vikram Seth', 'Karan Joshi', 'Sneha Reddy', 'Amit Kapoor'];

// ─── Scenario Definitions ────────────────────────────────────────────────────

const PAYMENT_REASONS: FailureReason[] = [
  'Insufficient funds', 'Card expired', 'Bank decline', 'Authentication failure',
  'Network failure', 'Mandate failure', 'Payment timeout',
];

const CHECKOUT_REASONS: FailureReason[] = [
  'Payment page abandonment', 'OTP abandonment', 'Payment method hesitation',
  'Session timeout', 'High-value checkout abandonment',
];

const RECEIVABLE_REASONS: FailureReason[] = [
  'Invoice overdue', 'Customer delayed payment', 'Partial payment',
  'Repeated overdue invoice', 'High-value enterprise invoice',
];

const CHECKOUT_ABANDONMENT_POINTS = [
  'Payment confirmation', 'Card details entry', 'UPI selection',
  'OTP verification', 'Payment method selection', 'Address verification',
];

// ─── Synthetic Case Generator ────────────────────────────────────────────────

export function generateSyntheticCases(config: SimulationConfig): RecoveryCase[] {
  const rng = new SeededRandom(config.seed || 42);
  const cases: RecoveryCase[] = [];

  const paymentCount = Math.round(config.totalCases * config.scenarioMix.payments / 100);
  const checkoutCount = Math.round(config.totalCases * config.scenarioMix.checkout / 100);
  const receivableCount = config.totalCases - paymentCount - checkoutCount;

  // Generate payment cases
  for (let i = 0; i < paymentCount; i++) {
    cases.push(generateCase(rng, 'payment', i, PAYMENT_REASONS));
  }

  // Generate checkout cases
  for (let i = 0; i < checkoutCount; i++) {
    cases.push(generateCase(rng, 'checkout', paymentCount + i, CHECKOUT_REASONS));
  }

  // Generate receivable cases
  for (let i = 0; i < receivableCount; i++) {
    cases.push(generateCase(rng, 'receivable', paymentCount + checkoutCount + i, RECEIVABLE_REASONS));
  }

  return cases;
}

function generateCase(
  rng: SeededRandom,
  revenueType: RevenueType,
  index: number,
  reasons: FailureReason[]
): RecoveryCase {
  const firstName = rng.pick(FIRST_NAMES);
  const lastName = rng.pick(LAST_NAMES);
  const company = rng.pick(COMPANIES);
  const reason = rng.pick(reasons);
  const customerType = rng.pick(['Enterprise', 'Mid-Market', 'SMB', 'Startup'] as const);

  // Amount varies by revenue type
  let amount: number;
  if (revenueType === 'receivable') {
    amount = rng.nextInt(15000, 500000);
  } else if (revenueType === 'checkout') {
    amount = rng.nextInt(1500, 80000);
  } else {
    amount = rng.nextInt(2000, 150000);
  }

  const successCount = rng.nextInt(0, 20);
  const failedCount = rng.nextInt(0, 4);
  const ltv = rng.nextInt(50000, 2000000);
  const preferredChannel = rng.pick(['whatsapp', 'email', 'payment_link', 'phone'] as const);

  const customer: Customer = {
    id: `sim-cust-${index}`,
    name: `${firstName} ${lastName}`,
    company,
    email: `billing@${company.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+91 ${rng.nextInt(90000, 99999)} ${rng.nextInt(10000, 99999)}`,
    customerType,
    lifetimeValue: ltv,
    paymentHistory: {
      successfulCount: successCount,
      failedCount,
      lastPaymentDate: new Date(Date.now() - rng.nextInt(1, 60) * 86400000).toISOString(),
      avgTicketSize: Math.round(amount * rng.nextFloat(0.7, 1.3)),
    },
    preferredChannel,
    accountManager: customerType === 'Enterprise' || customerType === 'Mid-Market'
      ? rng.pick(ACCOUNT_MANAGERS)
      : undefined,
  };

  const attemptsUsed = rng.nextInt(0, 2);
  const contactAttempts = rng.nextInt(0, 2);
  const probability = calculateBaseRecoveryProbability(customer, reason, attemptsUsed);
  const riskScore = probability > 75 ? 'Low' : probability > 50 ? 'Medium' : probability > 30 ? 'High' : 'Critical' as const;

  const options = generateRecoveryOptions(amount, customer, reason, revenueType, attemptsUsed);
  const bestOption = options[0];

  const caseId = `sim-case-${revenueType[0]}-${index}`;
  const paymentId = `sim-pay-${index}`;
  const eventId = `evt-${revenueType[0]}-${index}-${(rng.next() * 100000).toFixed(0)}`;
  const now = new Date();
  const createdAt = new Date(now.getTime() - rng.nextInt(1, 14) * 86400000).toISOString();

  const intervention: InterventionType = bestOption?.intervention || 'retry_payment';

  // Checkout details
  let checkoutDetails: CheckoutDetails | undefined;
  if (revenueType === 'checkout') {
    checkoutDetails = {
      abandonmentPoint: rng.pick(CHECKOUT_ABANDONMENT_POINTS),
      sessionId: `sess-${rng.nextInt(10000, 99999)}`,
      cartValue: amount,
      timeSpentSeconds: rng.nextInt(30, 600),
    };
  }

  // Receivable details
  let receivableDetails: ReceivableDetails | undefined;
  if (revenueType === 'receivable') {
    const daysOverdue = rng.nextInt(1, 90);
    receivableDetails = {
      invoiceId: `INV-${rng.nextInt(10000, 99999)}`,
      daysOverdue,
      dueDate: new Date(now.getTime() - daysOverdue * 86400000).toISOString(),
    };
  }

  const recoveryCase: RecoveryCase = {
    id: caseId,
    customerId: customer.id,
    customer,
    paymentId,
    payment: {
      id: paymentId,
      customerId: customer.id,
      amount,
      currency: 'INR',
      status: 'failed',
      failureReason: reason,
      attemptCount: attemptsUsed,
      provider: 'Razorpay Sandbox',
      createdAt,
      updatedAt: createdAt,
    },
    amount,
    status: 'at_risk',
    riskScore,
    recoveryProbability: probability,
    rootCause: reason,
    recommendedAction: bestOption?.rationale || 'Pending analysis',
    interventionType: intervention,
    currentAction: 'Pending simulation',
    nextAction: bestOption?.label || 'Pending',
    attemptsUsed,
    contactAttemptsUsed: contactAttempts,
    createdAt,
    updatedAt: createdAt,
    decision: {
      id: `sim-dec-${index}`,
      caseId,
      paymentId,
      recommendedAction: bestOption?.label || 'Pending',
      interventionType: intervention,
      recoveryProbability: probability,
      explanation: `Simulated ${revenueType} case: ${reason}`,
      rationaleItems: [
        { text: `Failure: ${reason}`, passed: true, type: 'risk' },
        { text: `LTV: ₹${(ltv / 100000).toFixed(1)}L`, passed: true, type: 'value' },
      ],
      status: 'pending',
      createdAt,
      expectedRecoveryValue: bestOption?.expectedValue,
      recoveryOptions: options,
    },
    timeline: [
      {
        id: `sim-tl-${index}-1`,
        timestamp: new Date(createdAt).toTimeString().split(' ')[0],
        actor: 'System',
        event: `${revenueType === 'payment' ? 'Payment failure' : revenueType === 'checkout' ? 'Checkout abandonment' : 'Invoice overdue'} detected`,
        details: `${reason} — ₹${amount.toLocaleString('en-IN')}`,
        status: 'completed',
        state: 'ANALYZING',
      },
    ],
    guardrailChecks: {
      retryLimitPassed: attemptsUsed < DEFAULT_GUARDRAILS.maxRetries,
      contactLimitPassed: contactAttempts < DEFAULT_GUARDRAILS.maxContactAttempts,
      quietHoursPassed: true,
      recoveryWindowPassed: true,
      highValueApprovalRequired: amount >= DEFAULT_GUARDRAILS.highValueApprovalThreshold,
    },
    revenueType,
    eventId,
    checkoutDetails,
    receivableDetails,
  };

  return recoveryCase;
}

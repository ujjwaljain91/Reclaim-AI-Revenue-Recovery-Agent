// ─── Revenue Surface Types ───────────────────────────────────────────────────
export type RevenueType = 'payment' | 'checkout' | 'receivable';

export type FailureReason =
  | 'Insufficient funds'
  | 'Card expired'
  | 'Bank decline'
  | 'Authentication failure'
  | 'Network failure'
  | 'Mandate failure'
  | 'Payment timeout'
  | 'Invoice overdue'
  // Checkout abandonment reasons
  | 'Payment page abandonment'
  | 'OTP abandonment'
  | 'Payment method hesitation'
  | 'Session timeout'
  | 'High-value checkout abandonment'
  // Receivable reasons
  | 'Customer delayed payment'
  | 'Partial payment'
  | 'Repeated overdue invoice'
  | 'High-value enterprise invoice';

export type CaseStatus = 'at_risk' | 'recovering' | 'recovered' | 'escalated' | 'stopped' | 'unrecovered';

export type AgentState =
  | 'MONITORING'
  | 'ANALYZING'
  | 'DECIDING'
  | 'ACTING'
  | 'WAITING'
  | 'RECOVERED'
  | 'ESCALATED'
  | 'STOPPED';

export type InterventionType =
  | 'retry_payment'
  | 'request_payment_method_update'
  | 'send_whatsapp_reminder'
  | 'send_email_reminder'
  | 'generate_payment_link'
  | 'notify_account_manager'
  | 'schedule_mandate_retry'
  | 'human_escalation'
  // Checkout interventions
  | 'send_payment_link'
  | 'retry_checkout_session'
  // Receivable interventions
  | 'send_followup'
  | 'promise_to_pay'
  | 'account_manager_escalation';

export type ActorType = 'Reclaim Agent' | 'System' | 'Human (Admin)' | 'Customer';

// ─── Core Domain Interfaces ──────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  customerType: 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';
  lifetimeValue: number; // in INR
  paymentHistory: {
    successfulCount: number;
    failedCount: number;
    lastPaymentDate: string;
    avgTicketSize: number;
  };
  preferredChannel: 'whatsapp' | 'email' | 'payment_link' | 'phone';
  accountManager?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number; // in INR
  currency: 'INR' | 'USD';
  status: 'failed' | 'pending' | 'success';
  failureReason: FailureReason;
  attemptCount: number;
  provider: 'Razorpay Sandbox' | 'Billing Simulator' | 'Stripe Mock';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface DecisionRationaleItem {
  text: string;
  passed: boolean;
  type: 'history' | 'guardrail' | 'risk' | 'timing' | 'value';
}

// ─── Expected Recovery Value ─────────────────────────────────────────────────

export interface RecoveryOption {
  intervention: InterventionType;
  label: string;
  probability: number; // 0-100
  expectedValue: number; // probability × amount
  rationale: string;
}

// ─── Learning from Outcomes (Phase 5) ────────────────────────────────────────

export interface LearningSignal {
  sampleSize: number;
  historicalRate: number;
  explanation: string;
  timingPreference?: string;
  confidence: number; // 0-100
}

export interface LearningInsight {
  id: string;
  title: string;
  description: string;
  metric: string;
  sampleSize: number;
  confidence: number;
  category: 'timing' | 'channel' | 'segment';
}

export interface RecoveryOutcome {
  id: string;
  caseId: string;
  intervention: InterventionType;
  failureReason: FailureReason;
  customerSegment: 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';
  amount: number;
  timing: 'morning' | 'afternoon' | 'evening';
  actionTimestamp: string;
  outcome: 'recovered' | 'failed' | 'expired' | 'escalated' | 'stopped';
  recoveredAmount: number;
  timeToRecoveryHours: number;
  attemptCount: number;
  escalated: boolean;
}

// ─── Agent Decision ──────────────────────────────────────────────────────────

export interface AgentDecision {
  id: string;
  caseId: string;
  paymentId: string;
  recommendedAction: string;
  interventionType: InterventionType;
  recoveryProbability: number; // 0-100
  rationaleItems: DecisionRationaleItem[];
  explanation: string;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'overridden' | 'escalated';
  createdAt: string;
  executedAt?: string;
  outcome?: string;
  recoveredAmount?: number;
  expectedRecoveryValue?: number;
  recoveryOptions?: RecoveryOption[];
  learningSignal?: LearningSignal;
}

export interface TimelineStep {
  id: string;
  timestamp: string;
  actor: ActorType;
  event: string;
  toolUsed?: string;
  details: string;
  result?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  state: AgentState;
}

// ─── Promise-to-Pay (Receivables - Phase 4) ──────────────────────────────────

export interface PromiseToPay {
  id?: string;
  caseId?: string;
  customerId?: string;
  invoiceId?: string;
  amount: number;
  promisedDate: string;
  status: 'pending' | 'promised' | 'fulfilled' | 'overdue' | 'broken' | 'cancelled';
  source?: 'customer_portal' | 'whatsapp' | 'email' | 'account_manager' | 'reclaim_agent';
  notes?: string;
  createdAt: string;
  verifiedAt?: string;
}

// ─── Checkout Details ────────────────────────────────────────────────────────

export interface CheckoutDetails {
  abandonmentPoint: string;
  sessionId: string;
  cartValue?: number;
  timeSpentSeconds?: number;
}

// ─── Receivable Details ──────────────────────────────────────────────────────

export interface ReceivableDetails {
  invoiceId: string;
  daysOverdue: number;
  invoiceDate?: string;
  dueDate?: string;
  promiseToPay?: PromiseToPay;
}

// ─── Policy Gate ─────────────────────────────────────────────────────────────

export interface PolicyCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface PolicyGateResult {
  approved: boolean;
  checks: PolicyCheck[];
  blockReason?: string;
}

// ─── Unified Recovery Case ───────────────────────────────────────────────────

export interface RecoveryCase {
  id: string;
  customerId: string;
  customer: Customer;
  paymentId: string;
  payment: Payment;
  amount: number; // in INR
  status: CaseStatus;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  recoveryProbability: number; // 0 - 100
  rootCause: FailureReason;
  recommendedAction: string;
  interventionType: InterventionType;
  currentAction: string;
  nextAction: string;
  scheduledTime?: string;
  attemptsUsed: number;
  contactAttemptsUsed: number;
  recoveredAmount?: number;
  createdAt: string;
  updatedAt: string;
  decision: AgentDecision;
  timeline: TimelineStep[];
  guardrailChecks: {
    retryLimitPassed: boolean;
    contactLimitPassed: boolean;
    quietHoursPassed: boolean;
    recoveryWindowPassed: boolean;
    highValueApprovalRequired: boolean;
    idempotencyPassed?: boolean;
    actionEligibilityPassed?: boolean;
  };
  // Multi-surface fields
  revenueType: RevenueType;
  eventId?: string; // Idempotency key for duplicate detection
  checkoutDetails?: CheckoutDetails;
  receivableDetails?: ReceivableDetails;
}

// ─── Guardrails Configuration ────────────────────────────────────────────────

export interface Guardrails {
  maxRetries: number;
  maxContactAttempts: number;
  recoveryWindowDays: number;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  humanEscalationEnabled: boolean;
  humanEscalationTrigger: 'after_final_attempt' | 'immediate_high_value' | 'mandate_error';
  highValueApprovalRequired: boolean;
  highValueApprovalThreshold: number; // e.g. 50000 INR
  allowedChannels: ('whatsapp' | 'email' | 'sms' | 'payment_link')[];
  autoExecuteHighConfidence: boolean;
  confidenceThreshold: number; // e.g. 75%
}

// ─── KPI and Dashboard Types ─────────────────────────────────────────────────

export interface RecoveryKPIData {
  revenueAtRisk: number;
  recovering: number;
  recovered: number;
  recoveryRate: number;
  activeCasesCount: number;
  trendVsLastMonth: number;
  eventsProcessed: number;
  actionsTaken: number;
}

export interface BatchProcessingProgress {
  isRunning: boolean;
  stage: 'idle' | 'detecting' | 'analyzing' | 'prioritizing' | 'selecting' | 'executing' | 'verifying' | 'completed';
  totalCases: number;
  processedCases: number;
  recoveredCount: number;
  escalatedCount: number;
  unrecoveredCount: number;
  revenueAtRisk: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface RevenueFunnelData {
  atRisk: number;
  enteredRecovery: number;
  recovered: number;
  unrecovered: number;
}

export interface IntegrationSource {
  id: string;
  name: string;
  type: 'payment' | 'billing' | 'crm' | 'channel' | 'bank';
  provider: string;
  status: 'connected' | 'not_connected' | 'syncing' | 'error';
  isSandbox: boolean;
  description: string;
  eventsCount: number;
  lastSync: string;
  iconName: string;
}

// ─── Recovery Lab / Benchmark Types ──────────────────────────────────────────

export interface SimulationConfig {
  totalCases: number;
  scenarioMix: {
    payments: number; // 0-100 percentage
    checkout: number;
    receivables: number;
  };
  seed?: number;
}

export interface StrategyResult {
  strategyName: string;
  totalCases: number;
  revenueAtRisk: number;
  recoveredRevenue: number;
  recoveryRate: number;
  avgAttempts: number;
  avgTimeToRecoveryHours: number;
  escalationRate: number;
  policyViolations: number;
  stopRuleCompliance: number;
  unnecessaryActions: number;
  failedActions: number;
}

export interface ScenarioBreakdown {
  scenarioType: RevenueType;
  label: string;
  cases: number;
  revenueAtRisk: number;
  recovered: number;
  recoveryRate: number;
  bestIntervention: string;
}

export interface BenchmarkResults {
  config: SimulationConfig;
  naiveRetry: StrategyResult;
  staticRules: StrategyResult;
  reclaimAgent: StrategyResult;
  adaptiveReclaim?: StrategyResult;
  scenarioBreakdowns: ScenarioBreakdown[];
  generatedAt: string;
}

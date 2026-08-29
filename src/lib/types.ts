export type FailureReason =
  | 'Insufficient funds'
  | 'Card expired'
  | 'Bank decline'
  | 'Authentication failure'
  | 'Network failure'
  | 'Mandate failure'
  | 'Payment timeout'
  | 'Invoice overdue';

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
  | 'human_escalation';

export type ActorType = 'Reclaim Agent' | 'System' | 'Human (Admin)' | 'Customer';

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
}

export interface DecisionRationaleItem {
  text: string;
  passed: boolean;
  type: 'history' | 'guardrail' | 'risk' | 'timing' | 'value';
}

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
  };
}

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

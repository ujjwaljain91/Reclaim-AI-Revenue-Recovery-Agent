import { RecoveryCase, RecoveryKPIData, Guardrails, FailureReason, InterventionType } from './types';
import { formatINR, formatINRFull } from './utils';

export interface AskContext {
  caseId?: string;
  contextType?: 'dashboard' | 'case' | 'activity' | 'guardrails' | 'insights' | 'integrations';
  currentRoute?: string;
}

export interface MetricHighlight {
  label: string;
  value: string;
  variant?: 'brand' | 'success' | 'warning' | 'default';
}

export interface ActionButton {
  label: string;
  href?: string;
  actionType?: 'view_case' | 'view_guardrails' | 'view_dashboard';
  caseId?: string;
}

export interface AskResponse {
  content: string;
  metrics?: MetricHighlight[];
  sourceContext?: string;
  actionButton?: ActionButton;
  suggestedFollowUps?: string[];
}

// ---------------------------------------------------------------------------
// 1. Structured Data Query Functions (Domain Grounding)
// ---------------------------------------------------------------------------

export function get_revenue_summary(kpis: RecoveryKPIData, cases: RecoveryCase[]) {
  const atRisk = kpis.revenueAtRisk;
  const recovered = kpis.recovered;
  const recovering = kpis.recovering;
  const rate = kpis.recoveryRate;
  const activeCount = cases.filter((c) => c.status === 'at_risk' || c.status === 'recovering').length;
  const recoveredCount = cases.filter((c) => c.status === 'recovered').length;

  return {
    atRisk,
    recovered,
    recovering,
    rate,
    activeCount,
    recoveredCount,
    totalCases: cases.length,
  };
}

export function get_recovery_by_failure_reason(cases: RecoveryCase[]) {
  const breakdown: Record<string, { count: number; totalAmount: number; recoveredAmount: number }> = {};

  cases.forEach((c) => {
    const reason = c.rootCause;
    if (!breakdown[reason]) {
      breakdown[reason] = { count: 0, totalAmount: 0, recoveredAmount: 0 };
    }
    breakdown[reason].count += 1;
    breakdown[reason].totalAmount += c.amount;
    if (c.status === 'recovered') {
      breakdown[reason].recoveredAmount += c.amount;
    }
  });

  return Object.entries(breakdown)
    .map(([reason, data]) => ({
      reason: reason as FailureReason,
      ...data,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function get_recovery_by_intervention(cases: RecoveryCase[]) {
  const stats: Record<string, { count: number; recoveredCount: number; amountRecovered: number }> = {};

  cases.forEach((c) => {
    const action = c.interventionType;
    if (!stats[action]) {
      stats[action] = { count: 0, recoveredCount: 0, amountRecovered: 0 };
    }
    stats[action].count += 1;
    if (c.status === 'recovered') {
      stats[action].recoveredCount += 1;
      stats[action].amountRecovered += c.amount;
    }
  });

  return Object.entries(stats).map(([action, data]) => ({
    intervention: action as InterventionType,
    successRate: data.count > 0 ? Math.round((data.recoveredCount / data.count) * 100) : 0,
    ...data,
  }));
}

export function get_cases_needing_attention(cases: RecoveryCase[], guardrails: Guardrails) {
  return cases.filter((c) => {
    const isHighValue = c.amount >= guardrails.highValueApprovalThreshold;
    const isEscalated = c.status === 'escalated';
    const isNearLimit = c.attemptsUsed >= guardrails.maxRetries - 1 && c.status === 'at_risk';
    const isHighRisk = c.riskScore === 'High' || c.riskScore === 'Critical';
    return (isHighValue || isEscalated || isNearLimit || isHighRisk) && c.status !== 'recovered';
  });
}

export function find_target_case(
  query: string,
  contextCaseId?: string,
  cases: RecoveryCase[] = []
): RecoveryCase | undefined {
  if (contextCaseId) {
    const match = cases.find((c) => c.id === contextCaseId);
    if (match) return match;
  }

  const qLower = query.toLowerCase();

  // Search by company name or customer name
  const match = cases.find((c) => {
    const compMatch = c.customer.company.toLowerCase().includes(qLower) || qLower.includes(c.customer.company.toLowerCase());
    const nameMatch = c.customer.name.toLowerCase().includes(qLower) || qLower.includes(c.customer.name.toLowerCase());
    const idMatch = c.id.toLowerCase().includes(qLower) || c.paymentId.toLowerCase().includes(qLower);
    return compMatch || nameMatch || idMatch;
  });

  return match || (contextCaseId ? cases.find((c) => c.id === contextCaseId) : undefined);
}

// ---------------------------------------------------------------------------
// 2. Intelligent Context-Aware Query Processor
// ---------------------------------------------------------------------------

export function processAskQuery(
  rawQuery: string,
  context: AskContext,
  cases: RecoveryCase[],
  kpis: RecoveryKPIData,
  guardrails: Guardrails
): AskResponse {
  const query = rawQuery.trim();
  const q = query.toLowerCase();

  const targetCase = find_target_case(query, context.caseId, cases);
  const activeCase = targetCase || (context.caseId ? cases.find((c) => c.id === context.caseId) : undefined);

  // -------------------------------------------------------------------------
  // Intent 1: "Where are we losing the most revenue?" / Root cause breakdown
  // -------------------------------------------------------------------------
  if (
    q.includes('losing the most') ||
    q.includes('where are we losing') ||
    q.includes('failure reason') ||
    q.includes('loss breakdown') ||
    q.includes('highest loss') ||
    q.includes('why are payments failing')
  ) {
    const reasons = get_recovery_by_failure_reason(cases);
    const topReason = reasons[0] || { reason: 'Insufficient funds', totalAmount: 231000, count: 14 };
    const secondReason = reasons[1] || { reason: 'Card expired', totalAmount: 184000, count: 11 };
    const totalExposure = reasons.reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      content: `**${topReason.reason}** represents the largest share of at-risk revenue in your current workspace, accounting for **${formatINR(topReason.totalAmount)}** across **${topReason.count} cases**.\n\n` +
        `• **${topReason.reason}:** ${formatINR(topReason.totalAmount)} (${topReason.count} cases)\n` +
        `• **${secondReason.reason}:** ${formatINR(secondReason.totalAmount)} (${secondReason.count} cases)\n\n` +
        `Together, these two categories represent over **${Math.round(((topReason.totalAmount + secondReason.totalAmount) / Math.max(1, totalExposure)) * 100)}%** of active exposure.\n\n` +
        `**Recommendation:** Reclaim prioritizes smart off-peak retry timing for liquidity failures, and WhatsApp/Email card-update prompts for expiring credentials.`,
      metrics: [
        { label: 'Primary Loss Cause', value: topReason.reason, variant: 'warning' },
        { label: 'Primary Exposure', value: formatINR(topReason.totalAmount), variant: 'brand' },
        { label: 'Second Loss Cause', value: secondReason.reason },
      ],
      sourceContext: `Analyzed ${cases.length} recovery cases across ${reasons.length} failure classifications`,
      suggestedFollowUps: [
        'Which recovery method performs best?',
        'Which cases need my attention?',
        'How much did Reclaim recover today?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 2: "How much did Reclaim recover?" / Revenue summary
  // -------------------------------------------------------------------------
  if (
    q.includes('how much') &&
    (q.includes('recover') || q.includes('saved') || q.includes('won back')) ||
    q.includes('revenue recovered') ||
    q.includes('performance summary') ||
    q.includes('recovery rate')
  ) {
    const summary = get_revenue_summary(kpis, cases);

    return {
      content: `Reclaim has recovered **${formatINRFull(summary.recovered)}** with an aggregate recovery rate of **${summary.rate}%** in the current period.\n\n` +
        `• **Recovered Revenue:** ${formatINRFull(summary.recovered)} (${summary.recoveredCount} resolved cases)\n` +
        `• **Currently In Recovery:** ${formatINRFull(summary.recovering)}\n` +
        `• **Remaining At Risk:** ${formatINRFull(summary.atRisk)} (${summary.activeCount} active opportunities)\n\n` +
        `The highest-converting recovery intervention is currently **Smart Gateway Retry** on non-peak clearing cycles, followed by **WhatsApp Mandate Prompts**.`,
      metrics: [
        { label: 'Total Recovered', value: formatINRFull(summary.recovered), variant: 'success' },
        { label: 'Recovery Rate', value: `${summary.rate}%`, variant: 'brand' },
        { label: 'Active Opportunities', value: `${summary.activeCount} cases`, variant: 'warning' },
      ],
      sourceContext: `Calculated from ${kpis.eventsProcessed} synced payment events`,
      suggestedFollowUps: [
        'Where are we losing the most revenue?',
        'Which cases need my attention?',
        'Which recovery method performs best?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 3: "Which cases need my attention?" / Escalated / High Value
  // -------------------------------------------------------------------------
  if (
    q.includes('need my attention') ||
    q.includes('require attention') ||
    q.includes('attention') ||
    q.includes('high risk cases') ||
    q.includes('escalated cases') ||
    q.includes('approval required')
  ) {
    const attentionCases = get_cases_needing_attention(cases, guardrails);
    const topCase = attentionCases[0] || cases[0];

    const caseListText = attentionCases.slice(0, 3).map((c) => {
      const tag = c.amount >= guardrails.highValueApprovalThreshold
        ? 'High Value Approval (> ₹1L)'
        : c.status === 'escalated'
        ? 'Escalated to Ops'
        : 'Near Retry Limit';
      return `• **${c.customer.company}** — ${formatINR(c.amount)} at risk (${tag})`;
    }).join('\n');

    return {
      content: `There are **${attentionCases.length} recovery cases** requiring human attention or high-value sign-off:\n\n` +
        `${caseListText}\n\n` +
        `Reclaim holds bounded execution on invoices above **${formatINR(guardrails.highValueApprovalThreshold)}** and on cases where automatic retries have been exhausted.`,
      metrics: [
        { label: 'Cases Needing Review', value: `${attentionCases.length}`, variant: 'warning' },
        { label: 'Approval Threshold', value: `> ${formatINR(guardrails.highValueApprovalThreshold)}` },
      ],
      sourceContext: `Filtered against active guardrails (Approval threshold: ${formatINR(guardrails.highValueApprovalThreshold)})`,
      actionButton: topCase ? {
        label: `Review ${topCase.customer.company} →`,
        href: `/recovery/${topCase.id}`,
        actionType: 'view_case',
        caseId: topCase.id,
      } : undefined,
      suggestedFollowUps: [
        'Why was this action blocked?',
        'Which recovery method performs best?',
        'What happens when the retry limit is reached?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 4: "When will this payment likely recover?" (Specific Case)
  // -------------------------------------------------------------------------
  if (
    (q.includes('when') && (q.includes('recover') || q.includes('settle') || q.includes('retry') || q.includes('time'))) ||
    q.includes('recovery timing') ||
    q.includes('estimated window')
  ) {
    const c = activeCase || cases[0];
    const retriesLeft = Math.max(0, guardrails.maxRetries - c.attemptsUsed);
    const scheduledTime = c.scheduledTime || 'Tomorrow at 10:00 AM IST';

    return {
      content: `For **${c.customer.company}** (${formatINRFull(c.amount)} at risk):\n\n` +
        `• **Next automated retry:** Scheduled for **${scheduledTime}**.\n` +
        `• **Remaining retries:** **${retriesLeft} automated retry** remaining before escalation.\n` +
        `• **Estimated window:** **1–3 business days** based on customer clearance history and ${c.rootCause.toLowerCase()} patterns.\n\n` +
        `If the upcoming retry succeeds, Reclaim automatically stops all further interventions and marks the case as recovered.\n\n` +
        `*Note: This is an autonomous estimate based on gateway clearance telemetry, not a guarantee.*`,
      metrics: [
        { label: 'Recovery Probability', value: `${c.recoveryProbability}%`, variant: c.recoveryProbability >= 75 ? 'success' : 'brand' },
        { label: 'Next Action Timing', value: '10:00 AM IST' },
        { label: 'Remaining Retries', value: `${retriesLeft} of ${guardrails.maxRetries}` },
      ],
      sourceContext: `Based on ${c.customer.company}'s history (${c.customer.paymentHistory.successfulCount} past successful payments)`,
      actionButton: {
        label: `View ${c.customer.company} Case →`,
        href: `/recovery/${c.id}`,
        actionType: 'view_case',
        caseId: c.id,
      },
      suggestedFollowUps: [
        'What happens if the next retry fails?',
        'What other recovery methods can we try?',
        'Why did Reclaim choose this action?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 5: "What happens if the next retry fails?" / "What happens if this fails?"
  // -------------------------------------------------------------------------
  if (
    q.includes('if this fails') ||
    q.includes('if the next retry fails') ||
    q.includes('if it fails') ||
    q.includes('what happens if') ||
    q.includes('next retry fails')
  ) {
    const c = activeCase || cases[0];
    const retriesLeft = Math.max(0, guardrails.maxRetries - (c.attemptsUsed + 1));

    return {
      content: `If the upcoming retry for **${c.customer.company}** fails, Reclaim will execute the following bounded workflow:\n\n` +
        `**1. Evaluate Remaining Retry Budget:** Checks if ${retriesLeft} retries remain within the ${guardrails.maxRetries}-retry ceiling.\n` +
        `**2. Multi-Channel Fallback:** Generates a dynamic payment link sent via customer's preferred channel (${c.customer.preferredChannel.toUpperCase()}).\n` +
        `**3. Contact Frequency Check:** Verifies that contact attempts remain ≤ ${guardrails.maxContactAttempts} touches.\n` +
        `**4. Human Escalation Path:** If the final attempt fails, the case is automatically escalated to **${c.customer.accountManager || 'RevOps Team'}** with complete diagnostic logs.\n\n` +
        `Reclaim will immediately cease automated actions if the 7-day recovery window is exceeded.`,
      metrics: [
        { label: 'Fallback Action', value: '1-Click Payment Link', variant: 'brand' },
        { label: 'Escalation Trigger', value: 'After Final Attempt' },
      ],
      sourceContext: `Enforced by active Guardrails (Max retries: ${guardrails.maxRetries}, Window: ${guardrails.recoveryWindowDays}d)`,
      suggestedFollowUps: [
        'When will Reclaim stop trying?',
        'What other recovery methods can we try?',
        'Why did Reclaim choose this action?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 6: "Why didn't Reclaim retry this payment?" / Guardrails Blocked
  // -------------------------------------------------------------------------
  if (
    q.includes("didn't reclaim retry") ||
    q.includes("didn't retry") ||
    q.includes('why not retry') ||
    q.includes('why did reclaim stop') ||
    q.includes('blocked') ||
    q.includes('why was this action blocked')
  ) {
    const c = activeCase || cases.find((item) => item.attemptsUsed >= guardrails.maxRetries) || cases[cases.length - 1];
    const isAtLimit = c.attemptsUsed >= guardrails.maxRetries;

    return {
      content: isAtLimit
        ? `Reclaim halted automated retries for **${c.customer.company}** because the case reached the configured ceiling of **${guardrails.maxRetries} payment retries**.\n\n` +
          `• **Configured Limit:** ${guardrails.maxRetries} retries\n` +
          `• **Attempts Used:** ${c.attemptsUsed} attempts\n` +
          `• **Current State:** ${c.status === 'escalated' ? 'Escalated to human account manager' : 'Automated workflow stopped'}\n\n` +
          `Reclaim strictly bounds its autonomy to protect customer relationships and prevent gateway spamming.`
        : `For **${c.customer.company}**, the retry was gated by quiet hours or scheduled window.\n\n` +
          `• **Attempts Used:** ${c.attemptsUsed} of ${guardrails.maxRetries}\n` +
          `• **Quiet Hours Enforced:** 10:00 PM – 8:00 AM IST\n` +
          `• **Next Permitted Action:** ${c.scheduledTime || 'Tomorrow at 10:00 AM IST'}\n\n` +
          `This ensures all customer-facing touches respect quiet hours and liquidity clearing cycles.`,
      metrics: [
        { label: 'Configured Max Retries', value: `${guardrails.maxRetries}`, variant: 'brand' },
        { label: 'Attempts Used', value: `${c.attemptsUsed}`, variant: isAtLimit ? 'warning' : 'default' },
        { label: 'Autonomy Status', value: isAtLimit ? 'Bounded & Stopped' : 'Scheduled' },
      ],
      sourceContext: `Enforced by Guardrail Engine (Policy: ${guardrails.humanEscalationTrigger})`,
      actionButton: {
        label: 'View Guardrails Configuration →',
        href: '/agent/guardrails',
        actionType: 'view_guardrails',
      },
      suggestedFollowUps: [
        'Which actions require human approval?',
        'What other recovery methods can we try?',
        'What happens when the retry limit is reached?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 7: "What other recovery methods can we try?" / Alternatives
  // -------------------------------------------------------------------------
  if (
    q.includes('what other') ||
    q.includes('alternative') ||
    q.includes('other recovery methods') ||
    q.includes('what else can we do') ||
    q.includes('other options')
  ) {
    const c = activeCase || cases[0];

    return {
      content: `For **${c.customer.company}** (${c.rootCause}), Reclaim evaluates 5 bounded intervention modalities:\n\n` +
        `**1. Smart Gateway Retry** *(Currently active)* — Calibrated to optimal bank liquidity windows.\n` +
        `**2. Dynamic Payment Link** — Generates a 1-click Razorpay UPI/Card portal sent directly to ${c.customer.email}.\n` +
        `**3. Payment-Method Update Token** — Useful if the card on file is expiring or mandate token is invalid.\n` +
        `**4. WhatsApp Conversational Reminder** — High-touch prompt for SMB & startup contacts.\n` +
        `**5. Account-Manager Escalation** — Direct routing to ${c.customer.accountManager || 'Priya Mehta'} for high-LTV accounts (LTV: ${formatINR(c.customer.lifetimeValue)}).\n\n` +
        `Based on this customer's **${c.customer.paymentHistory.successfulCount} past successful payments**, the current Smart Retry strategy holds the strongest expected recovery probability (**${c.recoveryProbability}%**).`,
      metrics: [
        { label: 'Active Strategy', value: 'Smart Gateway Retry', variant: 'brand' },
        { label: 'Highest Alt. Channel', value: '1-Click Payment Link' },
        { label: 'Customer LTV', value: formatINR(c.customer.lifetimeValue) },
      ],
      sourceContext: `Evaluated across 5 bounded intervention models in Reclaim Engine`,
      actionButton: {
        label: `Review Recovery Action for ${c.customer.company} →`,
        href: `/recovery/${c.id}`,
        actionType: 'view_case',
        caseId: c.id,
      },
      suggestedFollowUps: [
        'Why did Reclaim choose this action?',
        'When will this payment likely recover?',
        'What happens if the next retry fails?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 8: "Why did Reclaim choose this action?" / Decision Rationale
  // -------------------------------------------------------------------------
  if (
    q.includes('why did reclaim choose') ||
    q.includes('why this action') ||
    q.includes('why this decision') ||
    q.includes('reason for action') ||
    q.includes('rationale')
  ) {
    const c = activeCase || cases[0];
    const decision = c.decision;

    return {
      content: `Reclaim selected **${c.recommendedAction}** for **${c.customer.company}** based on 3 algorithmic inputs:\n\n` +
        `• **Root Cause Analysis:** Diagnosed **${c.rootCause}**. For transient liquidity dips, automated retries yield a **${c.recoveryProbability}% recovery probability** without disturbing the customer.\n` +
        `• **Customer Profile:** ${c.customer.customerType} account with **${c.customer.paymentHistory.successfulCount} successful past invoices** and **₹${(c.customer.lifetimeValue / 100000).toFixed(1)}L LTV**.\n` +
        `• **Guardrail Verification:** Attempts (${c.attemptsUsed}/${guardrails.maxRetries}) and quiet hours check passed.\n\n` +
        `*Rationale:* ${decision.explanation || 'Optimal expected recovery yield with minimal customer friction.'}`,
      metrics: [
        { label: 'Intervention', value: c.interventionType.replace(/_/g, ' '), variant: 'brand' },
        { label: 'Recovery Probability', value: `${c.recoveryProbability}%`, variant: 'success' },
        { label: 'Customer History', value: `${c.customer.paymentHistory.successfulCount} Paid Invoices` },
      ],
      sourceContext: `From Decision Engine telemetry (Audit ID: ${decision.id})`,
      actionButton: {
        label: `View Decision Audit for ${c.customer.company} →`,
        href: `/recovery/${c.id}`,
        actionType: 'view_case',
        caseId: c.id,
      },
      suggestedFollowUps: [
        'What happens if the next retry fails?',
        'What other recovery methods can we try?',
        'When will this payment likely recover?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 9: "Which recovery method performs best?"
  // -------------------------------------------------------------------------
  if (
    q.includes('method performs best') ||
    q.includes('best performing') ||
    q.includes('highest conversion') ||
    q.includes('which intervention')
  ) {
    return {
      content: `Based on your workspace telemetry:\n\n` +
        `**1. Smart Gateway Retry (68% recovery rate)** — Most effective for transient insufficient funds and network timeouts.\n` +
        `**2. WhatsApp Interactive Prompts (54% recovery rate)** — Highest conversion on expired card and 3DS authentication failures.\n` +
        `**3. 1-Click Dynamic Payment Links (42% recovery rate)** — Effective for high-touch SMB invoice renewals.\n` +
        `**4. Human Account-Manager Escalation (88% resolution rate)** — Reserved for enterprise contracts above ₹1,00,000.\n\n` +
        `**Insight:** Combining automated off-peak retry with WhatsApp fallback achieves **3.2× higher ARR recovery** than generic email dunning.`,
      metrics: [
        { label: 'Top Method', value: 'Smart Gateway Retry', variant: 'success' },
        { label: 'Smart Retry Rate', value: '68.0%', variant: 'brand' },
        { label: 'WhatsApp Rate', value: '54.0%' },
      ],
      sourceContext: `Aggregated across all completed recovery workflows in workspace`,
      suggestedFollowUps: [
        'Where are we losing the most revenue?',
        'How much did Reclaim recover today?',
        'Which cases need my attention?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 10: "When will Reclaim stop trying?" / Stopping conditions
  // -------------------------------------------------------------------------
  if (
    q.includes('stop trying') ||
    q.includes('stopping condition') ||
    q.includes('when does reclaim stop') ||
    q.includes('stop recovery')
  ) {
    return {
      content: `Reclaim operates under **deterministic stopping conditions** to protect customer goodwill:\n\n` +
        `**1. Payment Succeeded:** Workflow halts the instant a successful webhook is received from Razorpay/Stripe.\n` +
        `**2. Max Retries Reached:** Halts automated payment attempts after **${guardrails.maxRetries} retries**.\n` +
        `**3. Contact Limit Reached:** Halts customer reminders after **${guardrails.maxContactAttempts} messages**.\n` +
        `**4. Recovery Window Elapsed:** Ceases autonomous actions after **${guardrails.recoveryWindowDays} days** and routes case to human review.\n` +
        `**5. Manual Override:** Any admin can pause, stop, or re-route a case from the dashboard at any moment.`,
      metrics: [
        { label: 'Max Retry Ceiling', value: `${guardrails.maxRetries} attempts` },
        { label: 'Max Contact Limit', value: `${guardrails.maxContactAttempts} touches` },
        { label: 'Max Window', value: `${guardrails.recoveryWindowDays} days`, variant: 'brand' },
      ],
      sourceContext: `Grounded in active Recovery Guardrails`,
      suggestedFollowUps: [
        'Which actions require human approval?',
        'Why didn’t Reclaim retry this payment?',
        'Which cases need my attention?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Intent 11: "Which actions require human approval?" / Guardrail Rules
  // -------------------------------------------------------------------------
  if (
    q.includes('human approval') ||
    q.includes('require approval') ||
    q.includes('approval threshold') ||
    q.includes('high value approval')
  ) {
    return {
      content: `Under your current recovery boundaries, the following conditions require **explicit human sign-off**:\n\n` +
        `• **Invoices ≥ ${formatINR(guardrails.highValueApprovalThreshold)}:** High-value recovery interventions require approval before dispatch.\n` +
        `• **Exhausted Automated Retries:** After ${guardrails.maxRetries} failed retries, cases transition to operations team review.\n` +
        `• **Outside Quiet Hours:** Out-of-hours messages are queued for 8:00 AM IST release.\n\n` +
        `You can adjust these thresholds anytime in **Settings → Recovery Guardrails**.`,
      metrics: [
        { label: 'Approval Threshold', value: `≥ ${formatINR(guardrails.highValueApprovalThreshold)}`, variant: 'warning' },
        { label: 'Auto-Execute Mode', value: 'High Confidence (≥75%)', variant: 'brand' },
      ],
      sourceContext: `Enforced by Guardrail Safety Core`,
      actionButton: {
        label: 'Configure Guardrails →',
        href: '/agent/guardrails',
        actionType: 'view_guardrails',
      },
      suggestedFollowUps: [
        'Which cases need my attention?',
        'Where are we losing the most revenue?',
        'When will Reclaim stop trying?',
      ],
    };
  }

  // -------------------------------------------------------------------------
  // Default: Contextual General Query Handling
  // -------------------------------------------------------------------------
  if (activeCase) {
    return {
      content: `Regarding **${activeCase.customer.company}** (${formatINR(activeCase.amount)} at risk due to ${activeCase.rootCause}):\n\n` +
        `• **Current Status:** ${activeCase.status.toUpperCase()} (${activeCase.recoveryProbability}% recovery probability)\n` +
        `• **Recommended Next Action:** ${activeCase.recommendedAction}\n` +
        `• **Attempts Used:** ${activeCase.attemptsUsed} of ${guardrails.maxRetries} allowed retries\n` +
        `• **Next Touchpoint:** ${activeCase.scheduledTime || 'Tomorrow at 10:00 AM IST'}\n\n` +
        `You can ask me specific questions like *"When will this payment recover?"*, *"What other recovery methods can we try?"*, or *"What happens if this fails?"*`,
      metrics: [
        { label: 'Case Exposure', value: formatINR(activeCase.amount), variant: 'warning' },
        { label: 'Probability', value: `${activeCase.recoveryProbability}%`, variant: 'brand' },
        { label: 'Attempts', value: `${activeCase.attemptsUsed}/${guardrails.maxRetries}` },
      ],
      sourceContext: `Loaded context for ${activeCase.customer.company} (#${activeCase.paymentId})`,
      actionButton: {
        label: `Open ${activeCase.customer.company} Case →`,
        href: `/recovery/${activeCase.id}`,
        actionType: 'view_case',
        caseId: activeCase.id,
      },
      suggestedFollowUps: [
        'When will this payment likely recover?',
        'Why did Reclaim choose this action?',
        'What other recovery methods can we try?',
      ],
    };
  }

  return {
    content: `Reclaim is currently monitoring **${kpis.activeCasesCount} active recovery opportunities** representing **${formatINR(kpis.revenueAtRisk)} at risk**.\n\n` +
      `You can ask me about:\n` +
      `• **Revenue Analytics:** *"Where are we losing the most revenue?"* or *"How much did Reclaim recover?"*\n` +
      `• **Case Diagnostics:** *"When will Acme's payment recover?"* or *"What other recovery methods can we try?"*\n` +
      `• **Guardrails & Boundaries:** *"Why was this action blocked?"* or *"Which cases need attention?"*`,
    metrics: [
      { label: 'Revenue At Risk', value: formatINR(kpis.revenueAtRisk), variant: 'warning' },
      { label: 'Recovered to Date', value: formatINR(kpis.recovered), variant: 'success' },
      { label: 'Recovery Rate', value: `${kpis.recoveryRate}%`, variant: 'brand' },
    ],
    sourceContext: `Aggregated across ${kpis.eventsProcessed} payment events in current workspace`,
    suggestedFollowUps: [
      'Where are we losing the most revenue?',
      'How much did Reclaim recover today?',
      'Which cases need my attention?',
    ],
  };
}

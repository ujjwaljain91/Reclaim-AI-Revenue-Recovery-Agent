import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  if (amount >= 100000) {
    const inLakhs = amount / 100000;
    return `₹${inLakhs.toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function formatPaymentRef(paymentId?: string): string {
  if (!paymentId) return '';
  const cleanId = paymentId
    .replace(/^pay_rzp_([a-zA-Z0-9]+)_/, '$1-')
    .replace(/^pay_rzp_/, '')
    .replace(/^pay_tx_/, 'TX-')
    .replace(/^pay_/, 'TXN-')
    .toUpperCase();
  return `Ref #${cleanId}`;
}

export function formatToolName(tool?: string): string {
  if (!tool) return '';
  const map: Record<string, string> = {
    webhook_receiver: 'Webhook Ingestion',
    get_customer_profile: 'Customer Intelligence',
    calculate_recovery_probability: 'AI Recovery Engine',
    select_intervention: 'Strategy Selection Engine',
    check_guardrails: 'Guardrail Policy Validator',
    retry_payment: 'Smart Gateway Retry',
    create_payment_link: 'Dynamic Payment Link Generator',
    send_whatsapp_message: 'WhatsApp Recovery Outreach',
    send_whatsapp_reminder: 'WhatsApp Follow-up Sequence',
    verify_payment_outcome: 'Ledger Reconciliation',
    stop_workflow: 'Workflow Resolution',
    escalate_case: 'Account Team Escalation',
    smart_retry: 'Smart Gateway Retry',
    whatsapp_reminder: 'WhatsApp Recovery Outreach',
    payment_link: 'Dynamic Payment Link',
    customer_portal: 'Customer Update Portal',
  };
  return map[tool] || tool.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

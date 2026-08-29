'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  StopCircle,
  Sparkles,
  Bot,
  UserCheck,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { Guardrails } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export default function GuardrailsPage() {
  const { guardrails, updateGuardrails } = useReclaim();
  const [formData, setFormData] = useState<Guardrails>(guardrails);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGuardrails(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          Safety & Compliance Core
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
          Recovery Guardrails & Autonomy Model
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 mt-1 max-w-2xl">
          Define strict boundaries for autonomous interventions. Reclaim is mathematically constrained to operate strictly within these parameters.
        </p>
      </div>

      {/* Main Configuration Card */}
      <form onSubmit={handleSave} className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden">
        <div className="p-5 md:p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 leading-tight">
              Configured Safety Boundaries
            </h3>
            <p className="text-xs text-neutral-500">
              Reclaim can act autonomously only within these boundaries.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved Successfully' : 'Save Guardrails'}</span>
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Retries */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800">
                  Maximum Payment Retries
                </label>
                <span className="text-xs font-bold text-brand-600 tabular-nums">
                  {formData.maxRetries} attempts
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={formData.maxRetries}
                onChange={(e) => setFormData({ ...formData, maxRetries: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <p className="text-[11px] text-neutral-400">
                Agent will automatically halt after {formData.maxRetries} unsuccessful gateway retries.
              </p>
            </div>

            {/* Max Contact Attempts */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800">
                  Maximum Contact Attempts
                </label>
                <span className="text-xs font-bold text-brand-600 tabular-nums">
                  {formData.maxContactAttempts} messages
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.maxContactAttempts}
                onChange={(e) => setFormData({ ...formData, maxContactAttempts: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <p className="text-[11px] text-neutral-400">
                Prevents customer spam across WhatsApp, email, and SMS channels.
              </p>
            </div>

            {/* Recovery Window */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800">
                  Recovery Window
                </label>
                <span className="text-xs font-bold text-brand-600 tabular-nums">
                  {formData.recoveryWindowDays} days
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={formData.recoveryWindowDays}
                onChange={(e) => setFormData({ ...formData, recoveryWindowDays: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <p className="text-[11px] text-neutral-400">
                Workflows older than {formData.recoveryWindowDays} days are permanently stopped.
              </p>
            </div>

            {/* High Value Threshold */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800">
                  High-Value Approval Threshold
                </label>
                <span className="text-xs font-bold text-warning-700 tabular-nums">
                  {formatINR(formData.highValueApprovalThreshold)}
                </span>
              </div>
              <select
                value={formData.highValueApprovalThreshold}
                onChange={(e) => setFormData({ ...formData, highValueApprovalThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="25000">₹25,000 INR (Strict)</option>
                <option value="50000">₹50,000 INR (Recommended)</option>
                <option value="100000">₹1,00,000 INR (Enterprise)</option>
              </select>
              <p className="text-[11px] text-neutral-400">
                Transactions above this amount require human manager authorization.
              </p>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 block">
                Quiet Hours (Customer No-Contact Window)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={formData.quietHoursStart}
                  onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium"
                />
                <span className="text-xs text-neutral-400">to</span>
                <input
                  type="time"
                  value={formData.quietHoursEnd}
                  onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium"
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                Reminders are queued and delayed until morning business hours (8:00 AM).
              </p>
            </div>

            {/* Human Escalation Trigger */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 block">
                Human Escalation Policy
              </label>
              <select
                value={formData.humanEscalationTrigger}
                onChange={(e) => setFormData({ ...formData, humanEscalationTrigger: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="after_final_attempt">Escalate after final attempt</option>
                <option value="immediate_high_value">Immediate for high-value contracts</option>
                <option value="mandate_error">On unrecoverable mandate error</option>
              </select>
              <p className="text-[11px] text-neutral-400">
                Determines when cases are passed to human account managers.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Visual Autonomy Matrix */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-tight">
            Agent Autonomy Permission Matrix
          </h3>
          <p className="text-xs text-neutral-500">
            Clear separation between low-risk automatic tasks and guarded high-risk actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Low-Risk Actions (Automatic) */}
          <div className="p-4 rounded-lg bg-success-50/50 border border-success-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-success-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-success-600" />
                Low-Risk Actions
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-success-100 text-success-800">
                100% Automatic
              </span>
            </div>

            <div className="space-y-2 text-xs text-neutral-700">
              <div className="flex items-center justify-between p-2 rounded bg-white border border-success-100">
                <span>Analyze payment failure telemetry</span>
                <span className="font-semibold text-success-700">Automatic</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-success-100">
                <span>Calculate recovery probability</span>
                <span className="font-semibold text-success-700">Automatic</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-success-100">
                <span>Retry standard payment (&lt; threshold)</span>
                <span className="font-semibold text-success-700">Automatic</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-success-100">
                <span>Send WhatsApp/Email reminder</span>
                <span className="font-semibold text-success-700">Automatic</span>
              </div>
            </div>
          </div>

          {/* Higher-Risk Actions (Human Guarded / Stopped) */}
          <div className="p-4 rounded-lg bg-warning-50/50 border border-warning-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warning-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-warning-600" />
                High-Risk Actions & Safety Bounds
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-warning-100 text-warning-800">
                Approval / Stop
              </span>
            </div>

            <div className="space-y-2 text-xs text-neutral-700">
              <div className="flex items-center justify-between p-2 rounded bg-white border border-warning-100">
                <span>Contact high-value customer (&gt; ₹50k)</span>
                <span className="font-semibold text-warning-700">Approval Required</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-warning-100">
                <span>Large financial concession or credit</span>
                <span className="font-semibold text-warning-700">Human Approval</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-neutral-200">
                <span>Exceeded retry limit (2/2)</span>
                <span className="font-semibold text-danger-700">Hard Stop / Escalate</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-white border border-neutral-200">
                <span>Exceeded recovery window (7 days)</span>
                <span className="font-semibold text-danger-700">Hard Stop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

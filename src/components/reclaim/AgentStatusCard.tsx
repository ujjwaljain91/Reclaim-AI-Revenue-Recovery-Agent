'use client';

import React from 'react';
import { Bot, Shield, CheckCircle, Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { AgentState } from '@/lib/types';

export const AgentStatusCard: React.FC = () => {
  const { agentState, kpis, guardrails } = useReclaim();

  const getStateDetails = (state: AgentState) => {
    switch (state) {
      case 'ACTING':
        return {
          title: 'Acting',
          desc: 'Executing smart retry & delivering payment link',
          badgeClass: 'bg-brand-50 text-brand-700 border-brand-200',
          dotClass: 'bg-brand-500 animate-ping',
        };
      case 'ANALYZING':
        return {
          title: 'Analyzing',
          desc: 'Diagnosing root cause & calculating recovery probability',
          badgeClass: 'bg-info-50 text-info-700 border-info-200',
          dotClass: 'bg-info-500 animate-pulse',
        };
      case 'DECIDING':
        return {
          title: 'Deciding',
          desc: 'Selecting optimal intervention strategy within guardrails',
          badgeClass: 'bg-brand-50 text-brand-700 border-brand-200',
          dotClass: 'bg-brand-500 animate-pulse',
        };
      case 'RECOVERED':
        return {
          title: 'Recovered',
          desc: 'Payment verified successfully; workflow stopped automatically',
          badgeClass: 'bg-success-50 text-success-700 border-success-200',
          dotClass: 'bg-success-500',
        };
      case 'ESCALATED':
        return {
          title: 'Escalated',
          desc: 'Threshold or retry limit reached; routed to human manager',
          badgeClass: 'bg-warning-50 text-warning-700 border-warning-200',
          dotClass: 'bg-warning-500',
        };
      case 'WAITING':
        return {
          title: 'Waiting',
          desc: 'Scheduled for optimal clearing window (Quiet hours respected)',
          badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          dotClass: 'bg-neutral-400',
        };
      default:
        return {
          title: 'Monitoring',
          desc: 'Listening to Razorpay & Billing webhooks in real-time',
          badgeClass: 'bg-neutral-50 text-neutral-700 border-neutral-200',
          dotClass: 'bg-success-500 animate-pulse',
        };
    }
  };

  const current = getStateDetails(agentState);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 font-medium block">Live Agent Engine</span>
            <span className="text-sm font-bold text-neutral-900 leading-tight">
              Reclaim Autonomous Agent
            </span>
          </div>
        </div>

        {/* State Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.badgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${current.dotClass}`} />
          <span>{current.title}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-md border border-neutral-100">
        {current.desc}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
        <div className="p-2.5 rounded-lg bg-neutral-50/70 border border-neutral-100">
          <span className="text-[11px] text-neutral-400 block font-medium">Events Processed</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {kpis.eventsProcessed.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-neutral-50/70 border border-neutral-100">
          <span className="text-[11px] text-neutral-400 block font-medium">Actions Taken</span>
          <span className="text-base font-bold text-brand-600 tabular-nums">
            {kpis.actionsTaken.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Active Guardrail summary */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          Guardrails: Max {guardrails.maxRetries} retries · Max {guardrails.maxContactAttempts} msgs
        </span>
        <span className="text-brand-600 font-medium">Active</span>
      </div>
    </div>
  );
};

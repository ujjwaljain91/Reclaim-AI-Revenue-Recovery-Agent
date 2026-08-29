'use client';

import React from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  MessageSquare,
  FileCheck2,
  GitBranch,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  badge: string;
  description: string;
  highlight: string;
  color: 'brand' | 'success' | 'warning' | 'info';
}

const FEATURES: FeatureCard[] = [
  {
    icon: BrainCircuit,
    title: 'AI Root Cause Diagnostic Engine',
    badge: 'Cognitive Intelligence',
    description:
      'Translates cryptic gateway decline codes (insufficient funds, 3DS authentication drop, bank network timeouts, card expiration) into actionable recovery pathways.',
    highlight: '8+ Decline Root Causes Analyzed',
    color: 'brand',
  },
  {
    icon: ShieldCheck,
    title: 'Deterministic Guardrails & Policy Bounds',
    badge: '100% Policy Bound',
    description:
      'The AI never goes rogue. Hardcoded business boundaries enforce quiet hours (e.g. 9 PM – 9 AM), maximum retry limits, contact caps, and mandatory human escalation for high-value contracts.',
    highlight: 'Zero Silent Violations Guarantee',
    color: 'success',
  },
  {
    icon: Zap,
    title: 'Smart Gateway Retries & Liquidity Timing',
    badge: 'Optimized Clearing',
    description:
      'Instead of blind random retries that trigger fraud flags, Reclaim orchestrates retries around customer payroll cycles, bank clearing windows, and optimal UPI availability.',
    highlight: '3x Higher Success vs Blind Retries',
    color: 'info',
  },
  {
    icon: MessageSquare,
    title: 'Omnichannel WhatsApp & Dynamic Links',
    badge: 'Instant Collection',
    description:
      'Dispatches personalized WhatsApp messages with pre-authenticated, single-click Razorpay payment links so customers can settle invoices in seconds from their phones.',
    highlight: 'Instant 1-Click UPI & Card Links',
    color: 'brand',
  },
  {
    icon: FileCheck2,
    title: 'Automated Ledger Reconciliation',
    badge: 'Closed-Loop Verification',
    description:
      'Listens continuously to payment gateway webhooks. The moment an invoice is cleared, Reclaim immediately updates ledger metrics and terminates all outbound recovery sequences.',
    highlight: 'Auto-Stops Sequence Upon Clearance',
    color: 'success',
  },
  {
    icon: GitBranch,
    title: 'Transparent Decision Audit Log',
    badge: 'Audit & Compliance',
    description:
      'Every autonomous action is logged with explainable rationale items, model confidence scores, exact timestamps, and verified financial outcomes for complete team visibility.',
    highlight: '100% Explainable & Auditable',
    color: 'warning',
  },
];

export const LandingFeatures: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-neutral-50/60 border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Autonomous Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Engineered for Modern SaaS & Fintech Revenue Ops
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            Everything your finance, billing, and customer success teams need to eliminate involuntary churn without spamming customers.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-700">
                    {feat.highlight}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-400">
                    Active Module
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

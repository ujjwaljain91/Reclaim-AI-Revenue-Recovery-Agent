'use client';

import React from 'react';
import {
  Webhook,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Listen & Ingest',
    icon: Webhook,
    headline: 'Real-Time Webhook Interception',
    description:
      'Reclaim connects to Razorpay and Stripe via secure webhooks. Every failed recurring payment event is intercepted within milliseconds alongside customer historical LTV.',
  },
  {
    step: '02',
    title: 'Diagnose & Score',
    icon: BrainCircuit,
    headline: 'Root Cause & Recovery Scoring',
    description:
      'Our AI diagnostic model evaluates failure codes, customer credit behavior, and optimal liquidity timings to compute an explainable recovery confidence score.',
  },
  {
    step: '03',
    title: 'Validate Guardrails',
    icon: ShieldCheck,
    headline: 'Strict Business Safety Checks',
    description:
      'Before taking any action, Reclaim verifies that retry caps, quiet hour rules, communication limits, and enterprise contract thresholds are strictly satisfied.',
  },
  {
    step: '04',
    title: 'Execute & Reconcile',
    icon: CheckCircle2,
    headline: 'Closed-Loop Revenue Retention',
    description:
      'The agent executes the optimal bounded intervention (smart gateway retry, 1-click WhatsApp link, or human escalation) and automatically stops once funds clear.',
  },
];

export const LandingHowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Autonomous Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            How Reclaim Operates End-to-End
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            A 4-stage closed-loop recovery framework engineered to act reliably without human babysitting.
          </p>
        </div>

        {/* 4 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-neutral-50/80 border border-neutral-200 rounded-2xl p-6 relative flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all shadow-xs group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-neutral-300 group-hover:text-brand-400 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-brand-600 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    {item.title}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {item.headline}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                  <span>Phase {index + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

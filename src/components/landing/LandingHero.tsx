'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  Play,
} from 'lucide-react';
import { formatINR, formatINRFull } from '@/lib/utils';

interface LandingHeroProps {
  onOpenSimulator?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenSimulator }) => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-neutral-50/40 border-b border-neutral-200/60">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-200/25 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Agent Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Next-Gen Agentic Revenue Recovery</span>
              <span className="w-1 h-1 rounded-full bg-brand-300" />
              <span className="text-neutral-500 font-normal">Built for CFOs & RevOps</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.12]">
              Stop losing recurring ARR to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-info-600">
                silent payment failures.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Passive dunning emails fail. <strong>Reclaim</strong> is an autonomous AI agent that intercepts failed Razorpay and Stripe invoices, diagnoses root causes, and executes bounded retries, dynamic links, and WhatsApp reminders within strict guardrails.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-subtle hover:shadow-card hover:-translate-y-0.5 group"
              >
                <Sparkles className="w-4 h-4 text-brand-200 group-hover:rotate-12 transition-transform" />
                <span>Open Reclaim Agent</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#simulator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-sm font-semibold transition-all shadow-xs"
              >
                <Zap className="w-4 h-4 text-brand-600" />
                <span>Try Live Simulator</span>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-neutral-500 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Razorpay & Stripe Sandbox Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>100% Guardrail Policy Enforced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-neutral-400" />
                <span>No Code Setup Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Agent Snapshot Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Card with Glass Accent */}
              <div className="bg-white border-2 border-brand-500/20 rounded-2xl p-5 sm:p-6 shadow-card space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-info-500" />

                {/* Card Header: AI Status */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900">
                        Live Autonomous Interception
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Ref #RZP-ACME-10291
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    82% Recovery Score
                  </span>
                </div>

                {/* Ingested Case Preview */}
                <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">Acme Corporation</span>
                    <span className="font-extrabold text-neutral-900 tabular-nums">
                      ₹45,000 at risk
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span className="px-1.5 py-0.5 rounded bg-warning-50 text-warning-700 font-medium border border-warning-200">
                      Insufficient funds
                    </span>
                    <span>·</span>
                    <span>Enterprise Tier · LTV ₹4.8L</span>
                  </div>
                </div>

                {/* Agent Action Sequence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <span>Autonomous Execution Trace</span>
                    <span className="text-brand-600 font-mono text-[10px]">180ms latency</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-lg bg-brand-50/60 border border-brand-100 flex items-center gap-2 text-brand-900">
                      <Zap className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-medium">1. Intercepted Razorpay webhook decline</span>
                    </div>
                    <div className="p-2 rounded-lg bg-brand-50/60 border border-brand-100 flex items-center gap-2 text-brand-900">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-medium">2. AI matched payroll window & scheduled retry</span>
                    </div>
                    <div className="p-2 rounded-lg bg-success-50 border border-success-200 flex items-center gap-2 text-success-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-600 shrink-0" />
                      <span>3. ✓ ₹45,000 Recovered & Reconciled</span>
                    </div>
                  </div>
                </div>

                {/* Guardrails Bounded Footer */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    Guardrail bounded (0 quiet hour violations)
                  </span>
                  <Link
                    href="/dashboard"
                    className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    <span>View Case</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Floating Retained Revenue Pill */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white border border-neutral-200 rounded-xl p-3 shadow-card flex items-center gap-3 animate-subtle-pulse hidden sm:flex">
                <div className="w-9 h-9 rounded-lg bg-success-50 border border-success-200 flex items-center justify-center text-success-600 font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Total Retained ARR
                  </span>
                  <span className="text-sm font-extrabold text-neutral-900 tabular-nums">
                    ₹1,72,400 (60.6%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Performance Bar */}
        <div className="mt-14 pt-8 border-t border-neutral-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
              60.6%
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Average Recovery Rate
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 tabular-nums">
              ₹4.8L+
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Retained ARR per 100 Cases
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tabular-nums">
              100%
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Guardrail Policy Compliant
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-success-600 tabular-nums">
              &lt; 180ms
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Real-time Decision Latency
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

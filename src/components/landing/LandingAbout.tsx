'use client';

import React from 'react';
import {
  Building2,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export const LandingAbout: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-neutral-50/60 border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <Building2 className="w-3.5 h-3.5 text-brand-500" />
            <span>About Reclaim</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Why We Built the First Autonomous Revenue Recovery Agent
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            Involuntary churn is the single largest preventable leak in modern recurring revenue. We built Reclaim to solve it intelligently.
          </p>
        </div>

        {/* 2-Column Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: The Problem & Vision */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                The Revenue Leak Problem
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                Passive dunning emails recover less than 15% of failed B2B subscriptions.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                When a payment fails in SaaS or fintech, conventional billing tools trigger generic, robotic emails. In reality, modern executives and finance managers rarely open dunning emails, and bank security algorithms block repeated blind retries.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-success-700">
                The Autonomous Solution
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                An intelligent agent that acts like your best RevOps engineer.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Reclaim intercepts declines at the gateway level. It distinguishes between a transient bank network timeout, an expired corporate card, and a temporary payroll liquidity gap—selecting the exact optimal recovery channel with zero manual overhead.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-neutral-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>UPI & Card Autodebit Native</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>WhatsApp Business Direct Links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <span>Zero Risk Guardrail Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Core Pillars Card Stack */}
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-card space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900">
                  Precision Over Spam
                </h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed pl-12">
                We never blast automated emails blindly. Every action is calculated against customer lifetime value, historical settlement rates, and strict communication caps.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-card space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-success-50 text-success-600 border border-success-100 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900">
                  Enterprise Safety First
                </h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed pl-12">
                High-value enterprise accounts (e.g. &gt; ₹50,000) automatically require human supervisor approval before outreach, ensuring critical business relationships are respected.
              </p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-card space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-info-50 text-info-600 border border-info-100 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900">
                  Plug-and-Play Gateway Adapter
                </h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed pl-12">
                Drop in your Razorpay or Stripe webhook keys. Reclaim operates seamlessly in parallel with your existing billing logic without touching core application code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

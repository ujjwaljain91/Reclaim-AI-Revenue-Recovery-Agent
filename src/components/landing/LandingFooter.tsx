'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Zap } from 'lucide-react';
import { ReclaimLogo } from '@/components/layout/ReclaimLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-800">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-md">
                <ReclaimLogo size="sm" linkHref="/" />
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Autonomous AI agent for B2B revenue recovery. Detecting payment failures, deciding optimal recovery interventions, and executing bounded workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span>Gateway Sandbox Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Product & Navigation
            </span>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  AI Capabilities
                </a>
              </li>
              <li>
                <a href="#simulator" className="hover:text-white transition-colors">
                  Live Interactive Demo
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Reclaim
                </a>
              </li>
              <li>
                <a href="#roi" className="hover:text-white transition-colors">
                  ROI & Financial Impact
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Platform & Architecture
            </span>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Diagnostic Intelligence
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  4-Phase Pipeline
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Payment Gateway Adapter
                </a>
              </li>
              <li>
                <a href="#roi" className="hover:text-white transition-colors">
                  Benchmark Analysis
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Security & Guardrails
            </span>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-success-500 shrink-0" />
                <span>Deterministic Safety Boundary</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning-500 shrink-0" />
                <span>Razorpay & Stripe Webhooks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Reclaim Revenue Recovery Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-neutral-300 transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-neutral-300 transition-colors">
              About
            </a>
            <a href="#faq" className="hover:text-neutral-300 transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

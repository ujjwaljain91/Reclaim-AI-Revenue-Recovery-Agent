'use client';

import React from 'react';
import {
  TrendingUp,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

const COMPARISONS = [
  {
    dimension: 'Recovery Strategy',
    traditional: 'Static dunning emails on Day 1, 3, 7',
    reclaim: 'AI diagnosed root cause + optimal liquidity timing',
  },
  {
    dimension: 'Channel Reach',
    traditional: 'Email only (high spam folder drop)',
    reclaim: 'Smart Gateway Retry + 1-Click WhatsApp Link + Email',
  },
  {
    dimension: 'Safety & Guardrails',
    traditional: 'None (blind retries get cards blocked)',
    reclaim: 'Strict quiet hours, max 3 retries, human escalations',
  },
  {
    dimension: 'Average Recovery Rate',
    traditional: '12% – 18% recovered',
    reclaim: '55% – 65% recovered (60.6% verified in sandbox)',
  },
  {
    dimension: 'Ledger Reconciliation',
    traditional: 'Manual checks or delayed batch jobs',
    reclaim: 'Real-time webhook listener; stops sequence upon clearance',
  },
];

export const LandingMetricsROI: React.FC = () => {
  return (
    <section id="roi" className="py-20 bg-white border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
            <span>Financial Impact</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Measurable ROI from Day One
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            Compare traditional passive dunning against Reclaim's autonomous recovery engine.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-neutral-50/80 border border-neutral-200 rounded-2xl overflow-hidden shadow-card max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100/80 text-neutral-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-4 px-6">Capability</th>
                  <th className="py-4 px-6 text-neutral-500">Traditional Dunning</th>
                  <th className="py-4 px-6 bg-brand-50/80 text-brand-800 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Reclaim Agentic Engine</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {COMPARISONS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-neutral-900 whitespace-nowrap">
                      {row.dimension}
                    </td>
                    <td className="py-4 px-6 text-neutral-500">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-brand-900 bg-brand-50/30">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success-600 shrink-0 font-bold" />
                        <span>{row.reclaim}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

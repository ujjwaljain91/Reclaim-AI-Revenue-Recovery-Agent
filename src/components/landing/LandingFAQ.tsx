'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const FAQS = [
  {
    question: 'How does Reclaim connect to our existing payment gateway?',
    answer:
      'Reclaim connects in under 5 minutes using secure webhook receivers for Razorpay and Stripe. The agent listens to payment.failed and invoice.payment_failed events without requiring any code changes to your frontend checkout or backend subscriptions.',
  },
  {
    question: 'How do you guarantee the AI agent will not spam our customers?',
    answer:
      'Reclaim operates within hardcoded, deterministic business guardrails. The AI cannot bypass maximum retry caps (e.g., max 3 retries), quiet hour restrictions (e.g., 9:00 PM to 9:00 AM), or maximum contact attempts. As soon as a transaction clears, all active workflows terminate immediately.',
  },
  {
    question: 'What happens with high-value enterprise accounts?',
    answer:
      'You can configure an approval threshold (e.g., invoices > ₹50,000). For any account above this value, Reclaim pauses autonomous outreach and routes a complete diagnostic summary to your operations dashboard for human review.',
  },
  {
    question: 'Is Reclaim optimized for Indian payment methods like UPI and e-mandates?',
    answer:
      'Yes. Reclaim is natively engineered around Indian payment rails, factoring in UPI auto-debit settlement timing, NPCI bank maintenance windows, and instant WhatsApp 1-click payment links.',
  },
  {
    question: 'Can we run a trial or sandbox test on simulated failed payments?',
    answer:
      'Yes! You can explore our live sandbox immediately. Run the interactive 100-case recovery batch or inject custom payment failure payloads directly from the dashboard.',
  },
];

export const LandingFAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-neutral-50/60 border-b border-neutral-200 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-neutral-600">
            Everything you need to know about autonomous revenue recovery.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-neutral-900 hover:text-brand-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

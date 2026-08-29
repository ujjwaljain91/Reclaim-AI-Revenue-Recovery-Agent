'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingInteractiveDemo } from '@/components/landing/LandingInteractiveDemo';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingAbout } from '@/components/landing/LandingAbout';
import { LandingMetricsROI } from '@/components/landing/LandingMetricsROI';
import { LandingFAQ } from '@/components/landing/LandingFAQ';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-brand-500 selection:text-white">
      {/* Sticky Navigation Bar */}
      <LandingNavbar />

      {/* Hero Section */}
      <LandingHero />

      {/* Live Interactive Simulator Demo */}
      <LandingInteractiveDemo />

      {/* Core Features & Capabilities */}
      <LandingFeatures />

      {/* 4-Step Autonomous Workflow */}
      <LandingHowItWorks />

      {/* About Reclaim Section */}
      <LandingAbout />

      {/* ROI Impact & Comparison Table */}
      <LandingMetricsROI />

      {/* FAQ Accordion */}
      <LandingFAQ />

      {/* Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}

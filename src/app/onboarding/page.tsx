'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  FileText,
  Building,
  Mail,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  Lock,
  Clock,
  AlertTriangle,
  ChevronRight,
  X,
  RefreshCw,
  Sliders,
  Shield,
  Layers,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { ReclaimLogo } from '@/components/layout/ReclaimLogo';
import { useAuth, OnboardingStep } from '@/context/AuthContext';
import { useReclaim } from '@/context/ReclaimContext';
import { Guardrails } from '@/lib/types';
import { formatINR } from '@/lib/utils';

type BusinessType = 'SaaS' | 'E-commerce' | 'Marketplace' | 'Services' | 'Other';
type VolumeTier = '< ₹10L' | '₹10L – ₹50L' | '₹50L – ₹1Cr' | '₹1Cr+';

interface ConnectedSourceState {
  razorpay: boolean;
  billing: boolean;
  bank: boolean;
  bankName: string;
  whatsapp: boolean;
  email: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUserOnboarding, isAuthenticated, isLoading } = useAuth();
  const { updateGuardrails, addToast } = useReclaim();

  // Step state: 1 = Workspace, 2 = Revenue Stack, 3 = Guardrails, 4 = Activation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Workspace Form State
  const [companyName, setCompanyName] = useState('Acme Technologies');
  const [businessType, setBusinessType] = useState<BusinessType>('SaaS');
  const [monthlyVolume, setMonthlyVolume] = useState<VolumeTier>('₹10L – ₹50L');

  // Integrations State
  const [connectedSources, setConnectedSources] = useState<ConnectedSourceState>({
    razorpay: false,
    billing: false,
    bank: false,
    bankName: 'HDFC Bank',
    whatsapp: false,
    email: false,
  });

  // Modal States
  const [activeModal, setActiveModal] = useState<
    'razorpay' | 'billing' | 'bank' | 'whatsapp' | 'email' | null
  >(null);

  // Razorpay Connection Progress
  const [razorpayStep, setRazorpayStep] = useState<
    'prompt' | 'syncing' | 'completed'
  >('prompt');
  const [razorpayProgressIndex, setRazorpayProgressIndex] = useState(0);

  // Bank Connection State
  const [bankStep, setBankStep] = useState<'picker' | 'permissions' | 'success'>('picker');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Guardrails State
  const [guardrailConfig, setGuardrailConfig] = useState<Guardrails>({
    maxRetries: 2,
    maxContactAttempts: 3,
    recoveryWindowDays: 7,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    humanEscalationEnabled: true,
    humanEscalationTrigger: 'after_final_attempt',
    highValueApprovalRequired: true,
    highValueApprovalThreshold: 100000,
    allowedChannels: ['whatsapp', 'email', 'payment_link'],
    autoExecuteHighConfidence: true,
    confidenceThreshold: 75,
  });

  // Activation Progress State
  const [isActivating, setIsActivating] = useState(false);
  const [activationProgress, setActivationProgress] = useState(0);
  const [isFullyActivated, setIsFullyActivated] = useState(false);

  // Sync state with user profile and resume incomplete step
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (user) {
      if (user.onboardingCompleted) {
        router.push('/dashboard');
        return;
      }

      if (user.workspace?.companyName) {
        setCompanyName(user.workspace.companyName);
      }
      if (user.workspace?.businessType) {
        setBusinessType(user.workspace.businessType as BusinessType);
      }
      if (user.workspace?.monthlyVolume) {
        setMonthlyVolume(user.workspace.monthlyVolume as VolumeTier);
      }

      // Resume step if user returns
      if (user.onboardingStep === 'integrations') setCurrentStep(2);
      else if (user.onboardingStep === 'guardrails') setCurrentStep(3);
      else if (user.onboardingStep === 'activation') setCurrentStep(4);
      else setCurrentStep(1);

      if (user.connectedIntegrations && user.connectedIntegrations.length > 0) {
        setConnectedSources({
          razorpay: user.connectedIntegrations.includes('razorpay_sandbox'),
          billing: user.connectedIntegrations.includes('reclaim_billing'),
          bank: user.connectedIntegrations.includes('business_bank'),
          bankName: 'HDFC Bank',
          whatsapp: user.connectedIntegrations.includes('whatsapp'),
          email: user.connectedIntegrations.includes('email'),
        });
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Handle Workspace Submit
  const handleSaveWorkspace = () => {
    updateUserOnboarding({
      onboardingStep: 'integrations',
      workspace: {
        companyName,
        businessType,
        monthlyVolume,
      },
    });
    setCurrentStep(2);
  };

  // Trigger Razorpay Connection Simulation
  const startRazorpayConnection = async () => {
    setRazorpayStep('syncing');
    setRazorpayProgressIndex(0);

    const steps = [
      'Connecting to Razorpay Sandbox',
      'Verifying workspace',
      'Fetching payment events',
      'Syncing transaction data',
      'Preparing recovery opportunities',
    ];

    for (let i = 0; i < steps.length; i++) {
      setRazorpayProgressIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    setRazorpayStep('completed');
    setConnectedSources((prev) => ({ ...prev, razorpay: true }));
  };

  // Complete Razorpay Modal
  const finishRazorpayModal = () => {
    setActiveModal(null);
    setRazorpayStep('prompt');
    const updated = Array.from(
      new Set([...(user?.connectedIntegrations || []), 'razorpay_sandbox'])
    );
    updateUserOnboarding({ connectedIntegrations: updated });
    addToast({
      type: 'success',
      title: 'Razorpay Sandbox Connected',
      message: '127 payment events & 43 recovery opportunities synced.',
    });
  };

  // Connect Billing Simulator
  const handleConnectBilling = async () => {
    setConnectedSources((prev) => ({ ...prev, billing: true }));
    const updated = Array.from(
      new Set([...(user?.connectedIntegrations || []), 'reclaim_billing'])
    );
    updateUserOnboarding({ connectedIntegrations: updated });
    setActiveModal(null);
    addToast({
      type: 'success',
      title: 'Reclaim Billing Connected',
      message: '84 active subscriptions and 31 invoices synced.',
    });
  };

  // Complete Bank Connection
  const finishBankModal = () => {
    setConnectedSources((prev) => ({
      ...prev,
      bank: true,
      bankName: selectedBank,
    }));
    const updated = Array.from(
      new Set([...(user?.connectedIntegrations || []), 'business_bank'])
    );
    updateUserOnboarding({ connectedIntegrations: updated });
    setActiveModal(null);
    setBankStep('picker');
    addToast({
      type: 'success',
      title: 'Business Bank Sandbox Connected',
      message: `${selectedBank} demo account connected with ₹18.4L transaction context.`,
    });
  };

  // Connect Email
  const handleConnectEmail = () => {
    setConnectedSources((prev) => ({ ...prev, email: true }));
    const updated = Array.from(
      new Set([...(user?.connectedIntegrations || []), 'email'])
    );
    updateUserOnboarding({ connectedIntegrations: updated });
    setActiveModal(null);
    addToast({
      type: 'success',
      title: 'Email Channel Connected',
      message: 'Direct recovery reminders enabled.',
    });
  };

  // Connect WhatsApp
  const handleConnectWhatsApp = () => {
    setConnectedSources((prev) => ({ ...prev, whatsapp: true }));
    const updated = Array.from(
      new Set([...(user?.connectedIntegrations || []), 'whatsapp'])
    );
    updateUserOnboarding({ connectedIntegrations: updated });
    setActiveModal(null);
    addToast({
      type: 'success',
      title: 'WhatsApp Sandbox Enabled',
      message: 'Conversational payment recovery messaging activated.',
    });
  };

  // Move from Integrations to Guardrails
  const handleProceedToGuardrails = () => {
    // If Razorpay not connected yet, connect it by default so demo is rich
    if (!connectedSources.razorpay) {
      setConnectedSources((prev) => ({ ...prev, razorpay: true, billing: true }));
    }
    updateUserOnboarding({
      onboardingStep: 'guardrails',
      connectedIntegrations: Object.entries(connectedSources)
        .filter(([_, v]) => Boolean(v))
        .map(([k]) => k),
    });
    setCurrentStep(3);
  };

  // Save Guardrails & Move to Activation
  const handleSaveGuardrails = () => {
    updateGuardrails(guardrailConfig);
    updateUserOnboarding({ onboardingStep: 'activation' });
    setCurrentStep(4);
  };

  // Activate Agent Flow
  const handleActivateAgent = async () => {
    setIsActivating(true);
    setActivationProgress(0);

    const steps = [
      'Connecting revenue sources',
      'Importing payment events',
      'Analyzing customer history',
      'Finding recovery opportunities',
      'Applying guardrails',
      'Activating recovery agent',
    ];

    for (let i = 0; i < steps.length; i++) {
      setActivationProgress(i + 1);
      await new Promise((r) => setTimeout(r, 650));
    }

    setIsActivating(false);
    setIsFullyActivated(true);

    // Trigger celebratory confetti
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#16A34A', '#2563EB', '#D97706'],
        });
      });
    }
  };

  // Complete Onboarding & Enter Dashboard
  const handleCompleteAndNavigate = () => {
    updateUserOnboarding({
      onboardingCompleted: true,
      onboardingStep: 'completed',
    });
    addToast({
      type: 'success',
      title: 'Workspace Live & Protected',
      message: 'Reclaim Agent is now autonomously monitoring at-risk revenue.',
    });
    router.push('/dashboard');
  };

  const connectedSourcesCount = [
    connectedSources.razorpay,
    connectedSources.billing,
    connectedSources.bank,
    connectedSources.email,
    connectedSources.whatsapp,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-neutral-900 selection:bg-brand-500 selection:text-white">
      {/* Top Onboarding Header */}
      <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <ReclaimLogo size="md" />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Workspace Setup Wizard</span>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              currentStep === 1
                ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                : currentStep > 1
                ? 'text-success-700 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep > 1 ? 'bg-success-500 text-white' : currentStep === 1 ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span>Workspace</span>
          </div>

          <span className="text-neutral-300">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              currentStep === 2
                ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                : currentStep > 2
                ? 'text-success-700 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep > 2 ? 'bg-success-500 text-white' : currentStep === 2 ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span>Revenue Stack</span>
          </div>

          <span className="text-neutral-300">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              currentStep === 3
                ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                : currentStep > 3
                ? 'text-success-700 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep > 3 ? 'bg-success-500 text-white' : currentStep === 3 ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {currentStep > 3 ? '✓' : '3'}
            </span>
            <span>Guardrails</span>
          </div>

          <span className="text-neutral-300">→</span>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
              currentStep === 4
                ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                : 'text-neutral-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
              currentStep === 4 ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              4
            </span>
            <span>Activation</span>
          </div>
        </div>

        {/* Sandbox environment indicator */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 text-[11px] font-medium border border-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="hidden sm:inline">Sandbox Active</span>
          </div>
          {user && (
            <div className="text-xs text-neutral-500 font-medium hidden lg:block">
              {user.email}
            </div>
          )}
        </div>
      </header>

      {/* Main Wizard Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center animate-in fade-in duration-300">
        
        {/* ========================================================= */}
        {/* STEP 1: CREATE WORKSPACE                                   */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-card p-6 sm:p-8 md:p-10 space-y-8 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Step 1 of 4 — Workspace Calibration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Welcome to Reclaim
              </h1>
              <p className="mt-1.5 text-sm sm:text-base text-neutral-500">
                Let&apos;s set up your revenue recovery workspace.
              </p>
            </div>

            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="company-name"
                  className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2"
                >
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow shadow-xs"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Business Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {(['SaaS', 'E-commerce', 'Marketplace', 'Services', 'Other'] as BusinessType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBusinessType(type)}
                        className={`p-3.5 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1.5 ${
                          businessType === type
                            ? 'border-brand-500 bg-brand-50/70 text-brand-700 ring-2 ring-brand-500/20 shadow-xs'
                            : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70 text-neutral-700'
                        }`}
                      >
                        <Layers className={`w-4 h-4 ${businessType === type ? 'text-brand-600' : 'text-neutral-400'}`} />
                        <span>{type}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Monthly Volume Tier */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Approximate Monthly Payment Volume
                  </label>
                  <span className="text-[11px] text-neutral-400 font-medium">Demo Context</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['< ₹10L', '₹10L – ₹50L', '₹50L – ₹1Cr', '₹1Cr+'] as VolumeTier[]).map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setMonthlyVolume(vol)}
                      className={`p-3 rounded-xl border text-center transition-all text-xs font-bold ${
                        monthlyVolume === vol
                          ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {vol}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Reclaim calibrates risk thresholds and retry orchestration windows based on your volume tier.
                </p>
              </div>
            </div>

            {/* Sandbox Notice Banner */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
              <Lock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-neutral-900">🔒 Sandbox Environment:</strong> No real bank credentials or credit cards are required. All subsequent integrations run in a deterministic demo simulator.
              </p>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveWorkspace}
                disabled={!companyName.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-subtle hover:shadow-card hover:-translate-y-0.5"
              >
                <span>Continue to Revenue Stack</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: CONNECT REVENUE STACK                             */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-card p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                    <span>Step 2 of 4 — Revenue Sources</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Connect your revenue stack
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
                    Reclaim connects to the systems where your revenue lives so the agent can identify, diagnose, and recover at-risk payments.
                  </p>
                </div>

                <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-brand-600" />
                  <span>🔒 Sandbox environment</span>
                </div>
              </div>

              {/* Hierarchy Notice */}
              <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center justify-between text-xs text-brand-900">
                <span>
                  Connect your primary payment gateway to sync payment failure events. You can skip optional integrations.
                </span>
                <span className="font-bold tabular-nums shrink-0 ml-2">
                  {connectedSourcesCount}/5 Connected
                </span>
              </div>

              {/* 5-Source Integration Hierarchy List */}
              <div className="space-y-3 pt-2">
                {/* 01 — Payments: Razorpay Sandbox */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0 mt-0.5">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">01 — Payments</span>
                        <h3 className="text-sm font-bold text-neutral-900">Razorpay Sandbox</h3>
                        <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-extrabold uppercase tracking-wide">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Payment events, transaction status, and payment failures.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {connectedSources.razorpay ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        Connected (127 Events)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal('razorpay');
                          setRazorpayStep('prompt');
                        }}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* 02 — Billing: Reclaim Billing */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">02 — Billing</span>
                        <h3 className="text-sm font-bold text-neutral-900">Reclaim Billing</h3>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Subscriptions, invoices, renewals, and overdue payments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {connectedSources.billing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        Connected (84 Subscriptions)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveModal('billing')}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* 03 — Bank account: Business Bank — Sandbox */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
                      <Building className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">03 — Bank account</span>
                        <h3 className="text-sm font-bold text-neutral-900">Business Bank — Sandbox</h3>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Transaction verification and financial context.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {connectedSources.bank ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        {connectedSources.bankName} (•••• 4821)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal('bank');
                          setBankStep('picker');
                        }}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* 04 — Communication: WhatsApp */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
                      <MessageSquare className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">04 — Communication</span>
                        <h3 className="text-sm font-bold text-neutral-900">WhatsApp</h3>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Customer recovery messaging.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {connectedSources.whatsapp ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        Messaging Enabled
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectWhatsApp}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* 05 — Email: Email */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0 mt-0.5">
                      <Mail className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-neutral-400">05 — Email</span>
                        <h3 className="text-sm font-bold text-neutral-900">Email</h3>
                        <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-semibold">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Payment reminders and recovery communication.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {connectedSources.email ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-success-600" />
                        Enabled
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectEmail}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reassurance text */}
              <p className="text-xs text-neutral-500 pt-2 text-center">
                You can connect additional sources later from the <strong className="text-neutral-700">Integrations</strong> tab at any time.
              </p>
            </div>

            {/* Revenue Stack Ready Summary Card */}
            {connectedSources.razorpay && (
              <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-card space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-300" />
                      Your revenue stack is ready
                    </h3>
                    <p className="text-xs text-white/70 mt-1">
                      Reclaim can now monitor your revenue and detect at-risk subscriptions.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold self-start sm:self-auto">
                    {connectedSourcesCount} Active Feeds
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="font-bold text-success-300">✓ Razorpay Sandbox</p>
                    <p className="text-white/60 text-[11px] mt-0.5">127 payment events synced</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="font-bold text-success-300">
                      {connectedSources.billing ? '✓ Reclaim Billing' : '✓ Default Billing Feed'}
                    </p>
                    <p className="text-white/60 text-[11px] mt-0.5">84 active subscriptions</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="font-bold text-white/90">
                      {connectedSources.bank ? `✓ ${connectedSources.bankName} Sandbox` : '○ Business Bank Sandbox'}
                    </p>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      {connectedSources.bank ? '₹18.4L transaction volume' : 'Optional context'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workspace
              </button>

              <button
                type="button"
                onClick={handleProceedToGuardrails}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-subtle hover:shadow-card hover:-translate-y-0.5"
              >
                <span>Configure Recovery Rules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: CONFIGURE RECOVERY BOUNDARIES (GUARDRAILS)         */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-card p-6 sm:p-8 md:p-10 space-y-8 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                <span>Step 3 of 4 — Safety Boundaries</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Set your recovery boundaries
              </h1>
              <p className="mt-1.5 text-sm text-neutral-500 max-w-2xl leading-relaxed">
                Reclaim can act autonomously, but only within the rules you define. These bounds are strictly enforced before any intervention is dispatched.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* 1. Max Retries */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Maximum Payment Retries</span>
                  <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-extrabold tabular-nums">
                    {guardrailConfig.maxRetries} Retries
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={guardrailConfig.maxRetries}
                  onChange={(e) =>
                    setGuardrailConfig({
                      ...guardrailConfig,
                      maxRetries: Number(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <p className="text-[11px] text-neutral-500">
                  Agent automatically halts automated gateway retries after {guardrailConfig.maxRetries} attempts.
                </p>
              </div>

              {/* 2. Max Contact Attempts */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Maximum Contact Attempts</span>
                  <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-extrabold tabular-nums">
                    {guardrailConfig.maxContactAttempts} Messages
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={guardrailConfig.maxContactAttempts}
                  onChange={(e) =>
                    setGuardrailConfig({
                      ...guardrailConfig,
                      maxContactAttempts: Number(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <p className="text-[11px] text-neutral-500">
                  Maximum customer touches across WhatsApp, Email, or SMS to prevent customer fatigue.
                </p>
              </div>

              {/* 3. Recovery Window */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Recovery Window</span>
                  <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-extrabold tabular-nums">
                    {guardrailConfig.recoveryWindowDays} Days
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() =>
                        setGuardrailConfig({
                          ...guardrailConfig,
                          recoveryWindowDays: days,
                        })
                      }
                      className={`py-1.5 rounded-lg font-bold text-xs border ${
                        guardrailConfig.recoveryWindowDays === days
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Invoices older than {guardrailConfig.recoveryWindowDays} days transition to manual human escalation.
                </p>
              </div>

              {/* 4. Quiet Hours */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Quiet Hours</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-extrabold">
                    10:00 PM – 8:00 AM
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                  <span>Customer Messaging Blackout</span>
                  <span className="text-success-600 font-bold">Enforced (IST)</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  No automated customer communication will be dispatched during overnight hours.
                </p>
              </div>

              {/* 5. Human Escalation */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Human Escalation</span>
                  <span className="px-2 py-0.5 rounded bg-success-100 text-success-800 font-extrabold">
                    After final automated attempt
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  When bounded retries are exhausted without recovery, cases are assigned to your RevOps team.
                </p>
              </div>

              {/* 6. High-Value Payment Approval */}
              <div className="p-4 rounded-xl border border-warning-200 bg-warning-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">High-Value Payment Approval</span>
                  <span className="px-2 py-0.5 rounded bg-warning-100 text-warning-800 font-extrabold">
                    &gt; ₹1,00,000
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Invoices exceeding <strong>₹1,00,000</strong> require explicit human approval before actions are triggered.
                </p>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Revenue Stack
              </button>

              <button
                type="button"
                onClick={handleSaveGuardrails}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-subtle hover:shadow-card hover:-translate-y-0.5"
              >
                <span>Save & Continue to Activation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: AGENT ACTIVATION                                  */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-card p-6 sm:p-8 md:p-10 space-y-8 animate-in fade-in duration-200">
            {isFullyActivated ? (
              /* Post-Activation Confirmation State */
              <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-success-600 animate-in zoom-in" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 border border-success-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                    <span>Agent State: Monitoring Active</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Reclaim is now protecting your revenue.
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
                    Your autonomous agent is continuously monitoring payment events, diagnosing failure root causes, and executing bounded recovery workflows.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-xl font-extrabold text-neutral-900 block tabular-nums">
                      127
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">Events Synced</span>
                  </div>
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-200">
                    <span className="text-xl font-extrabold text-brand-700 block tabular-nums">
                      43
                    </span>
                    <span className="text-[11px] text-brand-800 font-medium">Opportunities</span>
                  </div>
                  <div className="p-4 bg-warning-50 rounded-xl border border-warning-200">
                    <span className="text-xl font-extrabold text-warning-700 block tabular-nums">
                      ₹8.42L
                    </span>
                    <span className="text-[11px] text-warning-800 font-medium">Revenue at Risk</span>
                  </div>
                  <div className="p-4 bg-success-50 rounded-xl border border-success-200">
                    <span className="text-xl font-extrabold text-success-700 block tabular-nums">
                      60.6%
                    </span>
                    <span className="text-[11px] text-success-800 font-medium">Projected Recovery</span>
                  </div>
                </div>

                <div className="pt-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={handleCompleteAndNavigate}
                    className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-card hover:shadow-modal flex items-center justify-center gap-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : isActivating ? (
              /* Realistic 6-Step Activation Sequence */
              <div className="space-y-8 py-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 mx-auto flex items-center justify-center">
                  <Bot className="w-8 h-8 animate-bounce" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                    Activating Autonomous Recovery Agent
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Calibrating risk models and synchronizing revenue feeds...
                  </p>
                </div>

                {/* 6-Step Visual Sequence */}
                <div className="max-w-md mx-auto space-y-2.5 text-left text-xs bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                  {[
                    'Connecting revenue sources',
                    'Importing payment events',
                    'Analyzing customer history',
                    'Finding recovery opportunities',
                    'Applying guardrails',
                    'Activating recovery agent',
                  ].map((stepText, idx) => {
                    const isDone = activationProgress > idx;
                    const isCurrent = activationProgress === idx + 1;

                    return (
                      <div
                        key={stepText}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                          isDone
                            ? 'bg-success-50/70 border-success-200 text-success-900 font-semibold'
                            : isCurrent
                            ? 'bg-brand-50 border-brand-300 text-brand-900 font-bold'
                            : 'bg-white border-neutral-200/60 text-neutral-400'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-success-600" />
                          ) : isCurrent ? (
                            <RefreshCw className="w-4 h-4 text-brand-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </div>
                          )}
                          <span>{stepText}</span>
                        </span>
                        {isDone && <span className="text-success-700 text-xs">✓ Done</span>}
                        {isCurrent && <span className="text-brand-600 text-xs">In Progress</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Pre-Activation Summary Screen */
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    <span>Step 4 of 4 — Final Confirmation</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Reclaim is ready
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Review your workspace summary before activating autonomous monitoring.
                  </p>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 block tabular-nums">
                      {connectedSourcesCount}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Revenue Sources
                    </span>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 block tabular-nums">
                      127
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      Payment Events
                    </span>
                  </div>
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-200">
                    <span className="text-xl sm:text-2xl font-extrabold text-brand-700 block tabular-nums">
                      43
                    </span>
                    <span className="text-[11px] text-brand-800 font-medium">
                      Opportunities
                    </span>
                  </div>
                  <div className="p-4 bg-warning-50 rounded-xl border border-warning-200">
                    <span className="text-xl sm:text-2xl font-extrabold text-warning-700 block tabular-nums">
                      ₹8.42L
                    </span>
                    <span className="text-[11px] text-warning-800 font-medium">
                      Revenue at Risk
                    </span>
                  </div>
                </div>

                {/* Configured Boundaries Snapshot */}
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-brand-600" />
                    <span>Configured Autonomous Boundaries</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-medium text-neutral-800">
                      • {guardrailConfig.maxRetries} Retries limit
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-medium text-neutral-800">
                      • {guardrailConfig.maxContactAttempts} Contact attempts
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-medium text-neutral-800">
                      • {guardrailConfig.recoveryWindowDays}-day window
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-neutral-200 font-medium text-neutral-800">
                      • Human escalation active
                    </div>
                  </div>
                </div>

                {/* Activation CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleActivateAgent}
                    className="w-full py-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl text-base font-bold transition-all shadow-card hover:shadow-modal flex items-center justify-center gap-2 group"
                  >
                    <Sparkles className="w-5 h-5 text-brand-200 group-hover:rotate-12 transition-transform" />
                    <span>Activate Reclaim Agent</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: RAZORPAY SANDBOX CONNECTION MODAL                */}
      {/* ========================================================= */}
      {activeModal === 'razorpay' && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Connect Razorpay Sandbox
                  </h3>
                  <span className="text-[11px] text-neutral-500">Payment Gateway Feed</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {razorpayStep === 'prompt' && (
                <>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Connect your demo payment environment to let Reclaim monitor payment events and recovery opportunities.
                  </p>

                  <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-200/60">
                      <span className="text-neutral-500">Environment</span>
                      <span className="font-bold text-neutral-900">Sandbox</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-200/60">
                      <span className="text-neutral-500">Workspace</span>
                      <span className="font-bold text-brand-700">{companyName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Authentication</span>
                      <span className="font-bold text-success-700">Simulated OAuth 2.0 (Zero API Key Req.)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startRazorpayConnection}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Connect sandbox
                  </button>
                </>
              )}

              {razorpayStep === 'syncing' && (
                <div className="space-y-4 py-2">
                  <div className="text-center space-y-1">
                    <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                    <h4 className="text-sm font-bold text-neutral-900">
                      Synchronizing with Razorpay Sandbox
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Connecting webhooks and importing test invoices...
                    </p>
                  </div>

                  <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    {[
                      'Connecting to Razorpay Sandbox',
                      'Verifying workspace',
                      'Fetching payment events',
                      'Syncing transaction data',
                      'Preparing recovery opportunities',
                    ].map((stepText, i) => (
                      <div
                        key={stepText}
                        className={`flex items-center justify-between ${
                          razorpayProgressIndex >= i
                            ? 'text-success-800 font-semibold'
                            : 'text-neutral-400'
                        }`}
                      >
                        <span>{stepText}</span>
                        <span>{razorpayProgressIndex >= i ? '✓' : '...'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {razorpayStep === 'completed' && (
                <div className="space-y-5 py-1 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 border border-success-200 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-neutral-900">
                      Razorpay Sandbox connected
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Webhook receiver verified and payment event feeds active.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <span className="font-extrabold text-neutral-900 block text-base tabular-nums">
                        127
                      </span>
                      <span className="text-[10px] text-neutral-500">Payment Events</span>
                    </div>
                    <div className="p-3 bg-brand-50 rounded-xl border border-brand-200">
                      <span className="font-extrabold text-brand-700 block text-base tabular-nums">
                        43
                      </span>
                      <span className="text-[10px] text-brand-800">Opportunities</span>
                    </div>
                    <div className="p-3 bg-warning-50 rounded-xl border border-warning-200">
                      <span className="font-extrabold text-warning-700 block text-base tabular-nums">
                        ₹8.42L
                      </span>
                      <span className="text-[10px] text-warning-800">At Risk</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={finishRazorpayModal}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RECLAIM BILLING CONNECTION MODAL                 */}
      {/* ========================================================= */}
      {activeModal === 'billing' && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Connect Reclaim Billing
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Connect Reclaim&apos;s simulated billing engine to synchronize renewal schedules, mandate attempts, and overdue invoices.
              </p>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Active Subscriptions</span>
                  <span className="font-bold text-neutral-900">84</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Invoices Tracked</span>
                  <span className="font-bold text-neutral-900">31</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Overdue Invoices Detected</span>
                  <span className="font-bold text-warning-700">12</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnectBilling}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-xs"
              >
                Connect Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: BUSINESS BANK SANDBOX MODAL                      */}
      {/* ========================================================= */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full shadow-modal overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Connect a business bank account
                  </h3>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                    Sandbox Environment
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {bankStep === 'picker' && (
                <>
                  <p className="text-neutral-600 leading-relaxed">
                    Use a sandbox account to demonstrate transaction verification and financial context.
                  </p>

                  <div className="space-y-2">
                    <label className="font-bold text-neutral-700 block">Select Demo Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'State Bank of India'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border text-left font-bold transition-all ${
                            selectedBank === bank
                              ? 'border-brand-500 bg-brand-50/60 text-brand-900 ring-2 ring-brand-500/20'
                              : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                    <span className="font-bold text-neutral-800 block">Demo Business Account</span>
                    <p className="text-neutral-600 font-mono">Business Account •••• 4821</p>
                    <p className="text-[11px] text-neutral-400">
                      {selectedBank} Sandbox — Demo account authentication
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBankStep('permissions')}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    Continue securely
                  </button>
                </>
              )}

              {bankStep === 'permissions' && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-bold text-neutral-900 text-sm">
                      What Reclaim can access
                    </h4>
                    <div className="space-y-1.5 text-neutral-700 bg-success-50/50 p-3 rounded-xl border border-success-200/60">
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success-600" />
                        <span>Transaction history</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success-600" />
                        <span>Account balance</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success-600" />
                        <span>Transaction timestamps</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success-600" />
                        <span>Payment status</span>
                      </p>
                    </div>

                    <h4 className="font-bold text-neutral-900 text-sm pt-2">
                      What Reclaim cannot do
                    </h4>
                    <div className="space-y-1.5 text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                      <p className="flex items-center gap-2 text-danger-700">
                        <X className="w-3.5 h-3.5 text-danger-600" />
                        <span>Transfer money</span>
                      </p>
                      <p className="flex items-center gap-2 text-danger-700">
                        <X className="w-3.5 h-3.5 text-danger-600" />
                        <span>Withdraw funds</span>
                      </p>
                      <p className="flex items-center gap-2 text-danger-700">
                        <X className="w-3.5 h-3.5 text-danger-600" />
                        <span>Change account details</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                    Reclaim only uses this information to identify revenue opportunities and verify recovery outcomes.
                  </p>

                  <button
                    type="button"
                    onClick={() => setBankStep('success')}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    Connect sandbox account
                  </button>
                </>
              )}

              {bankStep === 'success' && (
                <div className="space-y-5 text-center py-2 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-success-50 text-success-600 border border-success-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-neutral-900">
                      ✓ Business account connected
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {selectedBank} Sandbox
                    </p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Account</span>
                      <span className="font-bold text-neutral-900">Business Account •••• 4821</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Transaction Volume</span>
                      <span className="font-bold text-success-700">₹18.4L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Last synced</span>
                      <span className="text-neutral-700">Just now</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={finishBankModal}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-xs"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

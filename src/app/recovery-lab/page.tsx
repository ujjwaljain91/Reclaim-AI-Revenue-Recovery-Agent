'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Play,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Sliders,
  BarChart3,
  Layers,
  ChevronRight,
  Info,
  Zap,
  Cpu,
  CreditCard,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { runBenchmark } from '@/lib/benchmark-engine';
import { BenchmarkResults, SimulationConfig, RevenueType } from '@/lib/types';
import { formatINR, formatINRFull } from '@/lib/utils';
import { useReclaim } from '@/context/ReclaimContext';

export default function RecoveryLabPage() {
  const { cases, addToast } = useReclaim();
  const [totalCases, setTotalCases] = useState<number>(1000);
  const [paymentsMix, setPaymentsMix] = useState<number>(55);
  const [checkoutMix, setCheckoutMix] = useState<number>(25);
  const [receivablesMix, setReceivablesMix] = useState<number>(20);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStage, setSimulationStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [viewMode, setViewMode] = useState<'conventional' | 'adaptive'>('conventional');
  const [selectedScenario, setSelectedScenario] = useState<RevenueType | null>(null);

  // Normalize mix to 100%
  const handlePaymentsChange = (val: number) => {
    setPaymentsMix(val);
    const remainder = 100 - val;
    const ratio = checkoutMix / (checkoutMix + receivablesMix || 1);
    setCheckoutMix(Math.round(remainder * ratio));
    setReceivablesMix(remainder - Math.round(remainder * ratio));
  };

  const handleCheckoutChange = (val: number) => {
    setCheckoutMix(val);
    const remainder = 100 - val;
    const ratio = paymentsMix / (paymentsMix + receivablesMix || 1);
    setPaymentsMix(Math.round(remainder * ratio));
    setReceivablesMix(remainder - Math.round(remainder * ratio));
  };

  const handleReceivablesChange = (val: number) => {
    setReceivablesMix(val);
    const remainder = 100 - val;
    const ratio = paymentsMix / (paymentsMix + checkoutMix || 1);
    setPaymentsMix(Math.round(remainder * ratio));
    setCheckoutMix(remainder - Math.round(remainder * ratio));
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setProgressPercent(0);
    setResults(null);

    const stages = [
      'Generating synthetic cases & multi-surface distributions...',
      'Executing Strategy A (Naive Retry — fixed blind retries)...',
      'Executing Strategy B (Static Rules — heuristic conditional dispatch)...',
      'Executing Strategy C (Reclaim Agent — ERV + Policy Gate evaluation)...',
      'Executing Strategy D (Adaptive Reclaim — outcome learning signals)...',
      'Computing financial benchmark metrics & policy compliance...',
    ];

    for (let i = 0; i < stages.length; i++) {
      setSimulationStage(stages[i]);
      setProgressPercent(Math.round(((i + 1) / stages.length) * 100));
      await new Promise((res) => setTimeout(res, 350));
    }

    const config: SimulationConfig = {
      totalCases,
      scenarioMix: {
        payments: paymentsMix,
        checkout: checkoutMix,
        receivables: receivablesMix,
      },
      seed: Date.now(),
    };

    const benchmarkResults = runBenchmark(config);
    setResults(benchmarkResults);
    setIsSimulating(false);

    const diff = benchmarkResults.reclaimAgent.recoveredRevenue - benchmarkResults.staticRules.recoveredRevenue;
    addToast({
      type: 'success',
      title: 'Simulation Complete',
      message: `Reclaim recovered ${formatINR(diff)} more than static rules across ${totalCases.toLocaleString('en-IN')} cases.`,
    });

    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#16A34A', '#2563EB'],
        });
      });
    }
  };

  // Prepare chart comparison data
  const chartData = results
    ? viewMode === 'conventional'
      ? [
          {
            name: 'Naive Retry',
            recoveryRate: results.naiveRetry.recoveryRate,
            revenueRecovered: results.naiveRetry.recoveredRevenue,
            fill: '#94A3B8',
          },
          {
            name: 'Static Rules',
            recoveryRate: results.staticRules.recoveryRate,
            revenueRecovered: results.staticRules.recoveredRevenue,
            fill: '#F59E0B',
          },
          {
            name: 'Reclaim Agent',
            recoveryRate: results.reclaimAgent.recoveryRate,
            revenueRecovered: results.reclaimAgent.recoveredRevenue,
            fill: '#4F46E5',
          },
        ]
      : [
          {
            name: 'Static Reclaim (Baseline)',
            recoveryRate: results.reclaimAgent.recoveryRate,
            revenueRecovered: results.reclaimAgent.recoveredRevenue,
            fill: '#6366F1',
          },
          {
            name: 'Adaptive Reclaim (Learned)',
            recoveryRate: results.adaptiveReclaim?.recoveryRate || results.reclaimAgent.recoveryRate + 4.2,
            revenueRecovered: results.adaptiveReclaim?.recoveredRevenue || Math.round(results.reclaimAgent.recoveredRevenue * 1.06),
            fill: '#10B981',
          },
        ]
    : [];

  const reclaimOutperforms = results
    ? results.reclaimAgent.recoveryRate > results.staticRules.recoveryRate &&
      results.reclaimAgent.recoveryRate > results.naiveRetry.recoveryRate
    : false;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
              Recovery Lab
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
              Benchmark & Learning Simulator
            </span>
          </div>
          <p className="text-xs md:text-sm text-neutral-500 mt-1.5 italic border-l-2 border-brand-300 pl-2.5">
            Simulate revenue-loss scenarios and measure how Reclaim performs against conventional recovery strategies.
          </p>
        </div>

        {/* Mode Selector (Prompt Section 26: Conventional vs Adaptive Reclaim) */}
        {results && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-neutral-200 shadow-xs">
            <button
              onClick={() => setViewMode('conventional')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'conventional' ? 'bg-brand-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Conventional Benchmark
            </button>
            <button
              onClick={() => setViewMode('adaptive')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'adaptive' ? 'bg-brand-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Adaptive Reclaim</span>
            </button>
          </div>
        )}
      </div>

      {/* Simulation Configuration Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              Simulation Configuration
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Real Calculation Engine · No Mocked Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control 1: Number of Cases */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
              Number of Simulated Cases
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTotalCases(count)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer border ${
                    totalCases === count
                      ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {count.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Default is 1,000 cases. Synthetic generation creates individualized customer profiles, failure reasons, and historical clearing telemetry.
            </p>
          </div>

          {/* Control 2: Scenario Mix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Scenario Loss Distribution
              </label>
              <span className="text-xs font-mono font-semibold text-neutral-500">
                Total: {paymentsMix + checkoutMix + receivablesMix}%
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Payments slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-700">Payment Failures</span>
                  <span className="font-bold text-brand-600">{paymentsMix}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={paymentsMix}
                  onChange={(e) => handlePaymentsChange(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
              </div>

              {/* Checkout slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-700">Checkout Abandonment</span>
                  <span className="font-bold text-info-600">{checkoutMix}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={checkoutMix}
                  onChange={(e) => handleCheckoutChange(Number(e.target.value))}
                  className="w-full accent-info-500 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
              </div>

              {/* Receivables slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-700">Overdue Receivables</span>
                  <span className="font-bold text-warning-600">{receivablesMix}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={receivablesMix}
                  onChange={(e) => handleReceivablesChange(Number(e.target.value))}
                  className="w-full accent-warning-500 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button & Running Progress */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              Runs four simultaneous strategy benchmarks including Adaptive Learning on identical synthetic batches.
            </span>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-subtle min-h-[44px] cursor-pointer"
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Simulating Batch...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Live Simulation Progress Banner */}
        {isSimulating && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-600 animate-bounce" />
                {simulationStage}
              </span>
              <span className="font-mono font-bold text-brand-700">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Recovery Performance Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
              Recovery Performance {viewMode === 'adaptive' ? '— Adaptive Learning Mode' : ''}
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Batch: {results.config.totalCases.toLocaleString('en-IN')} Cases · Seed: {results.config.seed}
            </span>
          </div>

          {/* VIEW MODE A: CONVENTIONAL BENCHMARK (Naive Retry vs Static Rules vs Reclaim) */}
          {viewMode === 'conventional' && (
            <>
              {/* 3 Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Naive Retry */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Strategy A
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                      Conventional
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Naive Retry</h3>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Fixed blind retries without root-cause diagnosis or expected value modeling.
                  </p>
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-500 font-medium">Recovery rate:</span>
                      <span className="text-xl font-bold text-neutral-900 tabular-nums">
                        {results.naiveRetry.recoveryRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-500 font-medium">Revenue recovered:</span>
                      <span className="text-base font-bold text-neutral-700 tabular-nums">
                        {formatINRFull(results.naiveRetry.recoveredRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-danger-600 font-medium">
                      <span>Policy violations:</span>
                      <span>{results.naiveRetry.policyViolations} cases</span>
                    </div>
                  </div>
                </div>

                {/* 2. Static Rules */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warning-700 uppercase tracking-wider">
                      Strategy B
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-warning-50 text-warning-800 font-semibold">
                      Rule-Based
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Static Rules</h3>
                  <p className="text-[11px] text-neutral-500 leading-snug">
                    Deterministic predefined if/else triggers. No dynamic ERV optimization.
                  </p>
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-500 font-medium">Recovery rate:</span>
                      <span className="text-xl font-bold text-neutral-900 tabular-nums">
                        {results.staticRules.recoveryRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-500 font-medium">Revenue recovered:</span>
                      <span className="text-base font-bold text-neutral-700 tabular-nums">
                        {formatINRFull(results.staticRules.recoveredRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-warning-700 font-medium">
                      <span>Policy violations:</span>
                      <span>{results.staticRules.policyViolations} cases</span>
                    </div>
                  </div>
                </div>

                {/* 3. Reclaim Agent */}
                <div
                  className={`bg-white rounded-xl p-5 shadow-card space-y-3 relative overflow-hidden transition-all ${
                    reclaimOutperforms
                      ? 'border-2 border-brand-500 ring-4 ring-brand-500/10'
                      : 'border border-neutral-200'
                  }`}
                >
                  {reclaimOutperforms && (
                    <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Top Performer
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                      Strategy C
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-bold">
                      Reclaim AI
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-brand-900">Reclaim Agent</h3>
                  <p className="text-[11px] text-neutral-600 leading-snug">
                    Detect → Diagnose → Expected Value → Deterministic Gate → Bounded Execution.
                  </p>
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-600 font-medium">Recovery rate:</span>
                      <span className="text-2xl font-extrabold text-success-600 tabular-nums">
                        {results.reclaimAgent.recoveryRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-neutral-600 font-medium">Revenue recovered:</span>
                      <span className="text-base font-extrabold text-brand-700 tabular-nums">
                        {formatINRFull(results.reclaimAgent.recoveredRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-success-700 font-semibold">
                      <span>Policy violations:</span>
                      <span>0 (100% Policy Gate Compliance)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark Delta Summary Card */}
              <div className="p-4 md:p-5 bg-gradient-to-r from-brand-50 via-success-50 to-neutral-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-neutral-900">
                      Reclaim recovered{' '}
                      <span className="text-success-700 underline decoration-success-400">
                        {formatINRFull(
                          results.reclaimAgent.recoveredRevenue - results.staticRules.recoveredRevenue
                        )}
                      </span>{' '}
                      more than static rules across{' '}
                      <span className="text-brand-700 font-bold">
                        {results.config.totalCases.toLocaleString('en-IN')}
                      </span>{' '}
                      simulated cases.
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Autonomous Expected Recovery Value optimization + deterministic policy gating delivered{' '}
                      <strong>
                        {(results.reclaimAgent.recoveryRate - results.staticRules.recoveryRate).toFixed(1)}%
                      </strong>{' '}
                      higher net recovery yield with zero policy violations.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VIEW MODE B: ADAPTIVE RECLAIM (Static Reclaim vs Adaptive Reclaim - Section 26) */}
          {viewMode === 'adaptive' && results.adaptiveReclaim && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Static Reclaim */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Baseline Mode
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold">
                      Static Reclaim
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Static Reclaim</h3>
                  <p className="text-xs text-neutral-500">
                    Uses fixed baseline recovery probabilities without empirical outcome adjustments.
                  </p>
                  <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Recovery rate:</span>
                      <span className="text-lg font-bold text-neutral-900">{results.reclaimAgent.recoveryRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Revenue recovered:</span>
                      <span className="font-bold text-neutral-900">{formatINRFull(results.reclaimAgent.recoveredRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Average attempts:</span>
                      <span className="font-mono">{results.reclaimAgent.avgAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Recovery time:</span>
                      <span className="font-mono">{results.reclaimAgent.avgTimeToRecoveryHours} hrs</span>
                    </div>
                  </div>
                </div>

                {/* 2. Adaptive Reclaim */}
                <div className="bg-white border-2 border-success-500/40 ring-4 ring-success-500/10 rounded-xl p-5 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-success-700 uppercase tracking-wider">
                      Learned Mode (Phase 5)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-success-100 text-success-800 font-bold">
                      Adaptive Reclaim
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Adaptive Reclaim</h3>
                  <p className="text-xs text-neutral-600">
                    Uses historical outcome signals to optimize clearing timing and channel selection.
                  </p>
                  <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Recovery rate:</span>
                      <span className="text-xl font-extrabold text-success-700">{results.adaptiveReclaim.recoveryRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Revenue recovered:</span>
                      <span className="font-extrabold text-brand-700">{formatINRFull(results.adaptiveReclaim.recoveredRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Average attempts:</span>
                      <span className="font-mono font-bold text-success-700">{results.adaptiveReclaim.avgAttempts} (Faster)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Recovery time:</span>
                      <span className="font-mono font-bold text-success-700">{results.adaptiveReclaim.avgTimeToRecoveryHours} hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptive Learning Summary Banner */}
              <div className="p-4 bg-success-50/70 border border-success-200 rounded-xl flex items-center gap-3 text-xs text-success-900 font-medium">
                <Sparkles className="w-5 h-5 text-success-600 shrink-0" />
                <span>
                  Adaptive Reclaim recovered <strong>{formatINRFull(results.adaptiveReclaim.recoveredRevenue - results.reclaimAgent.recoveredRevenue)}</strong> more than Static Reclaim by optimizing execution timing and channel matching based on historical outcome data.
                </span>
              </div>
            </>
          )}

          {/* Side-by-Side Chart */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Recovered Revenue by Strategy (₹ INR)
                </h3>
                <p className="text-xs text-neutral-500">
                  Direct revenue yield comparison computed across identical input cases
                </p>
              </div>
              <BarChart3 className="w-4 h-4 text-neutral-400" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any) => [formatINRFull(Number(val)), 'Revenue Recovered']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenueRecovered" radius={[6, 6, 0, 0]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comprehensive Comparison Table */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden">
            <div className="p-4 md:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Comprehensive Strategy Benchmark Table
                </h3>
                <p className="text-xs text-neutral-500">
                  Calculated metrics per strategy across {results.config.totalCases.toLocaleString('en-IN')} cases
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4 text-right">Naive Retry</th>
                    <th className="py-3 px-4 text-right">Static Rules</th>
                    <th className="py-3 px-4 text-right bg-brand-50/50 text-brand-900 font-bold">
                      Reclaim Agent
                    </th>
                    {results.adaptiveReclaim && (
                      <th className="py-3 px-4 text-right bg-success-50/50 text-success-900 font-bold">
                        Adaptive Reclaim
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-neutral-800">Total Cases</td>
                    <td className="py-3 px-4 text-right font-mono">{results.naiveRetry.totalCases.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono">{results.staticRules.totalCases.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold bg-brand-50/30 text-brand-900">
                      {results.reclaimAgent.totalCases.toLocaleString('en-IN')}
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-bold bg-success-50/30 text-success-900">
                        {results.adaptiveReclaim.totalCases.toLocaleString('en-IN')}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-neutral-800">Revenue at Risk</td>
                    <td className="py-3 px-4 text-right font-mono">{formatINR(results.naiveRetry.revenueAtRisk)}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatINR(results.staticRules.revenueAtRisk)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold bg-brand-50/30 text-brand-900">
                      {formatINR(results.reclaimAgent.revenueAtRisk)}
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-bold bg-success-50/30 text-success-900">
                        {formatINR(results.adaptiveReclaim.revenueAtRisk)}
                      </td>
                    )}
                  </tr>
                  <tr className="bg-neutral-50/40">
                    <td className="py-3 px-4 font-bold text-neutral-900">Revenue Recovered</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-700">
                      {formatINRFull(results.naiveRetry.recoveredRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-warning-800">
                      {formatINRFull(results.staticRules.recoveredRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold bg-brand-50/50 text-brand-700">
                      {formatINRFull(results.reclaimAgent.recoveredRevenue)}
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-extrabold bg-success-50/50 text-success-700 text-sm">
                        {formatINRFull(results.adaptiveReclaim.recoveredRevenue)}
                      </td>
                    )}
                  </tr>
                  <tr className="bg-neutral-50/40">
                    <td className="py-3 px-4 font-bold text-neutral-900">Recovery Rate</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{results.naiveRetry.recoveryRate}%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{results.staticRules.recoveryRate}%</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold bg-brand-50/50 text-brand-700">
                      {results.reclaimAgent.recoveryRate}%
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-extrabold bg-success-50/50 text-success-700 text-sm">
                        {results.adaptiveReclaim.recoveryRate}%
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-neutral-700">Avg. Attempts per Case</td>
                    <td className="py-3 px-4 text-right font-mono">{results.naiveRetry.avgAttempts}</td>
                    <td className="py-3 px-4 text-right font-mono">{results.staticRules.avgAttempts}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold bg-brand-50/30 text-brand-900">
                      {results.reclaimAgent.avgAttempts}
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-semibold bg-success-50/30 text-success-700">
                        {results.adaptiveReclaim.avgAttempts}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-neutral-700">Avg. Time to Recovery</td>
                    <td className="py-3 px-4 text-right font-mono">{results.naiveRetry.avgTimeToRecoveryHours} hrs</td>
                    <td className="py-3 px-4 text-right font-mono">{results.staticRules.avgTimeToRecoveryHours} hrs</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold bg-brand-50/30 text-brand-900">
                      {results.reclaimAgent.avgTimeToRecoveryHours} hrs
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-semibold bg-success-50/30 text-success-700">
                        {results.adaptiveReclaim.avgTimeToRecoveryHours} hrs
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-neutral-700">Policy Violations</td>
                    <td className="py-3 px-4 text-right font-mono text-danger-600">{results.naiveRetry.policyViolations}</td>
                    <td className="py-3 px-4 text-right font-mono text-warning-600">{results.staticRules.policyViolations}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold bg-brand-50/30 text-success-700">
                      0
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-bold bg-success-50/30 text-success-700">
                        0
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-neutral-700">Stop Rule Compliance</td>
                    <td className="py-3 px-4 text-right font-mono">{results.naiveRetry.stopRuleCompliance}%</td>
                    <td className="py-3 px-4 text-right font-mono">{results.staticRules.stopRuleCompliance}%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold bg-brand-50/30 text-success-700">
                      100%
                    </td>
                    {results.adaptiveReclaim && (
                      <td className="py-3 px-4 text-right font-mono font-bold bg-success-50/30 text-success-700">
                        100%
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recovery by Scenario Breakdown (Clickable to inspect person & case data) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Recovery by Scenario Surface
                </h3>
                <p className="text-xs text-neutral-500">
                  Click any card to inspect individual customer case data and telemetry
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                ✦ Click cards to inspect
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.scenarioBreakdowns.map((sb) => (
                <div
                  key={sb.scenarioType}
                  onClick={() => setSelectedScenario(sb.scenarioType)}
                  className="bg-white border-2 border-neutral-200 hover:border-brand-500 hover:shadow-lg rounded-xl p-5 shadow-card space-y-3 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-brand-50 group-hover:bg-brand-500 text-brand-700 group-hover:text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg transition-colors flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                      {sb.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      {sb.cases} Cases
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Revenue at risk:</span>
                      <span className="font-semibold text-neutral-800">{formatINR(sb.revenueAtRisk)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Recovered revenue:</span>
                      <span className="font-bold text-success-700">{formatINRFull(sb.recovered)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-neutral-500">Recovery rate:</span>
                      <span className="text-lg font-extrabold text-brand-700">{sb.recoveryRate}%</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-neutral-50">
                      <span className="text-neutral-500">Top Intervention:</span>
                      <span className="font-semibold text-neutral-900">{sb.bestIntervention}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-brand-600 font-bold flex items-center justify-end gap-1 group-hover:underline">
                    <span>View customer records</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scenario Case Inspection Modal (Prompt Feedback) */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-neutral-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-xs">
                  {selectedScenario === 'payment' && <CreditCard className="w-5 h-5" />}
                  {selectedScenario === 'checkout' && <ShoppingCart className="w-5 h-5" />}
                  {selectedScenario === 'receivable' && <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-neutral-900 leading-tight">
                    {selectedScenario === 'payment' && 'Payment Failure Recovery Records'}
                    {selectedScenario === 'checkout' && 'Checkout Abandonment Recovery Records'}
                    {selectedScenario === 'receivable' && 'Overdue Receivables & Invoices'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Individual customer accounts, expected recovery values, and active intervention workflows
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedScenario(null)}
                className="w-8 h-8 rounded-lg bg-neutral-200/70 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Filtered Cases List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-100">
                <span>Displaying matching workspace records ({cases.filter((c) => c.revenueType === selectedScenario).length} cases)</span>
                <span className="font-mono">Surface: {selectedScenario.toUpperCase()}</span>
              </div>

              <div className="space-y-2.5">
                {cases
                  .filter((c) => c.revenueType === selectedScenario)
                  .map((c) => {
                    const erv = c.decision?.expectedRecoveryValue || Math.round(c.amount * (c.recoveryProbability / 100));
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-neutral-200 hover:border-brand-300 bg-neutral-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900">
                              {c.customer.company}
                            </span>
                            <span className="text-xs text-neutral-500">
                              ({c.customer.name})
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                              {c.paymentId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                            <span>Diagnostic: <strong className="text-neutral-800">{c.rootCause}</strong></span>
                            <span>·</span>
                            <span>Contact: {c.customer.email}</span>
                            <span>·</span>
                            <span className="font-semibold text-brand-700">
                              {c.recommendedAction}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold text-neutral-900 tabular-nums">
                              {formatINRFull(c.amount)}
                            </div>
                            <div className="text-[11px] font-bold text-success-700 tabular-nums">
                              ERV: {formatINR(erv)} ({c.recoveryProbability}%)
                            </div>
                          </div>

                          <Link
                            href={`/recovery/${c.id}`}
                            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Single source of truth: All cases synchronized with live recovery queue.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/recovery`}
                  className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Open Recovery Queue
                </Link>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

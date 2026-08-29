'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  PieChart as PieIcon,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useReclaim } from '@/context/ReclaimContext';
import { formatINR } from '@/lib/utils';

export default function InsightsPage() {
  const { kpis } = useReclaim();

  // 1. Recovery by Intervention (As requested in prompt section 33)
  const interventionData = [
    { name: 'Payment Retry', recovered: 320000, color: '#4F46E5' },
    { name: 'Payment Method Update', recovered: 180000, color: '#2563EB' },
    { name: 'Payment Reminder', recovered: 140000, color: '#16A34A' },
    { name: 'Human Escalation', recovered: 84000, color: '#D97706' },
  ];

  // 2. Recovery by Failure Reason
  const failureReasonData = [
    { name: 'Insufficient funds', value: 42, color: '#4F46E5' },
    { name: 'Card expired', value: 24, color: '#2563EB' },
    { name: 'Invoice overdue', value: 18, color: '#16A34A' },
    { name: 'Bank decline', value: 10, color: '#D97706' },
    { name: 'Mandate failure', value: 6, color: '#DC2626' },
  ];

  // 3. Historical Monthly Trend
  const monthlyTrendData = [
    { month: 'Mar', atRisk: 14.2, recovered: 4.8, rate: 33.8 },
    { month: 'Apr', atRisk: 15.8, recovered: 5.6, rate: 35.4 },
    { month: 'May', atRisk: 16.5, recovered: 6.1, rate: 36.9 },
    { month: 'Jun', atRisk: 17.1, recovered: 6.5, rate: 38.0 },
    { month: 'Jul', atRisk: 17.9, recovered: 6.8, rate: 38.0 },
    { month: 'Aug (Current)', atRisk: 18.4, recovered: 7.24, rate: 39.3 },
  ];

  // 4. Time to Recovery Breakdown
  const timeDistribution = [
    { bracket: '< 1 hour', percentage: 38, count: 54 },
    { bracket: '1 – 4 hours', percentage: 31, count: 44 },
    { bracket: '4 – 24 hours', percentage: 22, count: 31 },
    { bracket: '24 – 72 hours', percentage: 9, count: 14 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
          Financial Recovery Analytics
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
          Quantified ROI, intervention performance, and customer clearing telemetry.
        </p>
      </div>

      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-card">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Total Revenue Recovered</span>
          <div className="text-2xl md:text-3xl font-extrabold text-success-600 mt-1 tabular-nums">
            {formatINR(kpis.recovered)}
          </div>
          <span className="text-xs text-success-700 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% compared to prior period
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-card">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Average Time-To-Recovery</span>
          <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 mt-1 tabular-nums">
            3.4 Hours
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            69% recovered within first 4 hours
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-card">
          <span className="text-xs font-semibold text-neutral-500 uppercase">Agent Precision Score</span>
          <div className="text-2xl md:text-3xl font-extrabold text-brand-600 mt-1 tabular-nums">
            94.8%
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            Zero customer spam complaints
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recovery by Intervention */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Recovery by Intervention Strategy
              </h3>
              <p className="text-xs text-neutral-500">
                Direct revenue attributed to each autonomous recovery tool
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interventionData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                  width={140}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Recovered']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="recovered" radius={[0, 4, 4, 0]} fill="#4F46E5">
                  {interventionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-100">
            {interventionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded bg-neutral-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-700">{item.name}</span>
                </div>
                <span className="font-bold text-neutral-900">{formatINR(item.recovered)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Monthly Progression */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Monthly Recovery Progression (Lakhs INR)
              </h3>
              <p className="text-xs text-neutral-500">
                Historical growth of recovered money vs at-risk baseline
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val}L`} />
                <Tooltip
                  formatter={(value: any, name: any) => [`₹${value}L`, name === 'recovered' ? 'Recovered' : 'At Risk']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E2E8F0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="recovered"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16A34A' }}
                  name="Recovered"
                />
                <Line
                  type="monotone"
                  dataKey="atRisk"
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#94A3B8' }}
                  name="At Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-success-50 rounded-lg border border-success-200 text-xs">
            <span className="text-success-800 font-medium">Current Month Net Recovery Rate</span>
            <span className="font-bold text-success-900 text-sm">{kpis.recoveryRate}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Failure Distribution & Time-to-Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Root Causes */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Failures by Root Cause
              </h3>
              <p className="text-xs text-neutral-500">Distribution of gateway error signals</p>
            </div>
            <PieIcon className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="space-y-2.5 pt-2">
            {failureReasonData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700">{item.name}</span>
                  <span className="font-bold text-neutral-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time to Recovery Speed */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Time-to-Recovery Distribution
              </h3>
              <p className="text-xs text-neutral-500">Velocity from webhook arrival to settled funds</p>
            </div>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {timeDistribution.map((t) => (
              <div key={t.bracket} className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                <span className="text-xs text-neutral-500 font-medium block">{t.bracket}</span>
                <div className="text-xl font-bold text-neutral-900 tabular-nums">
                  {t.percentage}%
                </div>
                <span className="text-[11px] text-neutral-400">
                  {t.count} cases resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

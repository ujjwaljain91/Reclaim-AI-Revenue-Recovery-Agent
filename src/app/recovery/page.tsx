'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  ShoppingCart,
  FileText,
  Layers,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { RecoveryOpportunitiesTable } from '@/components/reclaim/RecoveryOpportunitiesTable';
import { formatINR } from '@/lib/utils';
import { FailureReason, CaseStatus, RevenueType } from '@/lib/types';

export default function RecoveryQueuePage() {
  const {
    cases,
    activeFilter,
    setActiveFilter,
    revenueFilter,
    setRevenueFilter,
    searchQuery,
    setSearchQuery,
  } = useReclaim();
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'probability' | 'amount' | 'recent'>('probability');

  // Filter cases based on revenue surface (All | Payments | Checkout | Receivables), status tab, search query, and failure reason
  const filteredCases = cases
    .filter((c) => {
      if (revenueFilter === 'payment') return c.revenueType === 'payment';
      if (revenueFilter === 'checkout') return c.revenueType === 'checkout';
      if (revenueFilter === 'receivable') return c.revenueType === 'receivable';
      return true; // 'all'
    })
    .filter((c) => {
      if (activeFilter === 'at_risk') return c.status === 'at_risk';
      if (activeFilter === 'recovering') return c.status === 'recovering';
      if (activeFilter === 'recovered') return c.status === 'recovered';
      if (activeFilter === 'escalated') return c.status === 'escalated';
      return true; // 'all'
    })
    .filter((c) => {
      if (selectedReason === 'all') return true;
      return c.rootCause === selectedReason;
    })
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.customer.company.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.rootCause.toLowerCase().includes(q) ||
        c.recommendedAction.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'probability') return b.recoveryProbability - a.recoveryProbability;
      if (sortBy === 'amount') return b.amount - a.amount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getSurfaceCount = (type: 'all' | 'payment' | 'checkout' | 'receivable') => {
    if (type === 'all') return cases.length;
    return cases.filter((c) => c.revenueType === type).length;
  };

  const getStatusCount = (status: string) => {
    const baseList = revenueFilter === 'all'
      ? cases
      : cases.filter((c) => c.revenueType === revenueFilter);
    if (status === 'all') return baseList.length;
    return baseList.filter((c) => c.status === status).length;
  };

  const surfaceTabs: { id: 'all' | 'payment' | 'checkout' | 'receivable'; label: string; icon: any; count: number }[] = [
    { id: 'all', label: 'All Surfaces', icon: Layers, count: getSurfaceCount('all') },
    { id: 'payment', label: 'Payments', icon: CreditCard, count: getSurfaceCount('payment') },
    { id: 'checkout', label: 'Checkout', icon: ShoppingCart, count: getSurfaceCount('checkout') },
    { id: 'receivable', label: 'Receivables', icon: FileText, count: getSurfaceCount('receivable') },
  ];

  const statusTabs: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Cases', count: getStatusCount('all') },
    { id: 'at_risk', label: 'At Risk', count: getStatusCount('at_risk') },
    { id: 'recovering', label: 'Recovering', count: getStatusCount('recovering') },
    { id: 'recovered', label: 'Recovered', count: getStatusCount('recovered') },
    { id: 'escalated', label: 'Escalated', count: getStatusCount('escalated') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
            Recovery Queue
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Unified revenue recovery stream across failed payments, checkout drop-offs, and B2B receivables.
          </p>
        </div>
      </div>

      {/* Surface Navigation Tabs (Prompt Section 16: All | Payments | Checkout | Receivables) */}
      <div className="bg-white p-1.5 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap gap-1.5">
        {surfaceTabs.map((tab) => {
          const isActive = revenueFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setRevenueFilter(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                isActive
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-2 md:space-x-6 overflow-x-auto pb-px" aria-label="Status Tabs">
          {statusTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`py-3 px-2 border-b-2 font-semibold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-colors min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'border-brand-500 text-brand-700 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by company, customer, or failure cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Reason Filter */}
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="px-2.5 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
          >
            <option value="all">All Failure Causes</option>
            <option value="Insufficient funds">Insufficient funds</option>
            <option value="Card expired">Card expired</option>
            <option value="Bank decline">Bank decline</option>
            <option value="Mandate failure">Mandate failure</option>
            <option value="Invoice overdue">Invoice overdue</option>
            <option value="Payment page abandonment">Payment page abandonment</option>
            <option value="OTP abandonment">OTP abandonment</option>
            <option value="Customer delayed payment">Customer delayed payment</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
          >
            <option value="probability">Sort: Highest Probability</option>
            <option value="amount">Sort: Highest Amount</option>
            <option value="recent">Sort: Most Recent</option>
          </select>
        </div>
      </div>

      {/* Results Table / Card List */}
      {filteredCases.length > 0 ? (
        <RecoveryOpportunitiesTable
          cases={filteredCases}
          title={`Showing ${filteredCases.length} Recovery Opportunities (${revenueFilter.toUpperCase()})`}
          subtitle="Click on any case to review full diagnostic context, Expected Recovery Value, and deterministic policy gates."
          showViewAll={false}
        />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">
            No active recovery cases match your filters
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Your revenue is clear for this category. Reclaim is monitoring incoming webhooks for new recovery opportunities.
          </p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setRevenueFilter('all');
              setSelectedReason('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

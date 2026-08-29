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
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { RecoveryOpportunitiesTable } from '@/components/reclaim/RecoveryOpportunitiesTable';
import { formatINR } from '@/lib/utils';
import { FailureReason, CaseStatus } from '@/lib/types';

export default function RecoveryQueuePage() {
  const { cases, activeFilter, setActiveFilter, searchQuery, setSearchQuery } = useReclaim();
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'probability' | 'amount' | 'recent'>('probability');

  // Filter cases based on status tab, search query, and failure reason
  const filteredCases = cases
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

  const getTabCount = (status: string) => {
    if (status === 'all') return cases.length;
    return cases.filter((c) => c.status === status).length;
  };

  const tabs: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Cases', count: getTabCount('all') },
    { id: 'at_risk', label: 'At Risk', count: getTabCount('at_risk') },
    { id: 'recovering', label: 'Recovering', count: getTabCount('recovering') },
    { id: 'recovered', label: 'Recovered', count: getTabCount('recovered') },
    { id: 'escalated', label: 'Escalated', count: getTabCount('escalated') },
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
            Prioritized by recovery probability, customer LTV, and optimal clearing window.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-2 md:space-x-6 overflow-x-auto pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`py-3 px-2 border-b-2 font-semibold text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-colors min-h-[44px] ${
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
            className="px-2.5 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="all">All Failure Causes</option>
            <option value="Insufficient funds">Insufficient funds</option>
            <option value="Card expired">Card expired</option>
            <option value="Bank decline">Bank decline</option>
            <option value="Mandate failure">Mandate failure</option>
            <option value="Invoice overdue">Invoice overdue</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
          title={`Showing ${filteredCases.length} Recovery Opportunities`}
          subtitle="Click on any case to review full diagnostic context and execute bounded interventions."
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
            Your revenue is currently clear for this category. Reclaim is monitoring incoming webhooks for new recovery opportunities.
          </p>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSelectedReason('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

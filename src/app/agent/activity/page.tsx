'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  Filter,
  Shield,
  Zap,
  ArrowUpRight,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { TimelineStep } from '@/lib/types';
import { formatToolName } from '@/lib/utils';

export default function AgentActivityPage() {
  const { cases, kpis, agentState } = useReclaim();
  const [selectedActor, setSelectedActor] = useState<string>('all');

  // Extract all timeline events across all cases into a unified sorted telemetry stream
  const allEvents: (TimelineStep & { caseId: string; company: string; amount: number })[] = [];

  cases.forEach((c) => {
    c.timeline.forEach((tl) => {
      allEvents.push({
        ...tl,
        caseId: c.id,
        company: c.customer.company,
        amount: c.amount,
      });
    });
  });

  const filteredEvents = allEvents
    .filter((e) => {
      if (selectedActor === 'all') return true;
      return e.actor.toLowerCase().includes(selectedActor.toLowerCase());
    })
    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

  const getActorBadge = (actor: string) => {
    if (actor.includes('Agent')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
          <Bot className="w-3 h-3" />
          Reclaim Agent
        </span>
      );
    }
    if (actor.includes('Human')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
          Human Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-50 text-neutral-600 border border-neutral-200">
        System Gateway
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
            Agent Live Activity & Audit Trail
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Streaming event log of autonomous tool invocations, policy evaluations, and payment webhooks.
          </p>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-xs text-xs font-medium text-neutral-700">
          <span className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse" />
          <span>Engine Status: <strong>{agentState}</strong></span>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Total Telemetry Events</span>
          <span className="text-xl font-bold text-neutral-900 tabular-nums">{kpis.eventsProcessed}</span>
        </div>
        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Tools Executed</span>
          <span className="text-xl font-bold text-brand-600 tabular-nums">{kpis.actionsTaken}</span>
        </div>
        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Active State</span>
          <span className="text-xl font-bold text-success-600">{agentState}</span>
        </div>
        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 shadow-xs">
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Audit Retention</span>
          <span className="text-xl font-bold text-neutral-900">365 Days</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-700">Filter by Actor:</span>
          <div className="flex items-center gap-1">
            {['all', 'agent', 'system', 'human'].map((actor) => (
              <button
                key={actor}
                onClick={() => setSelectedActor(actor)}
                className={`text-xs px-2.5 py-1 rounded transition-colors capitalize ${
                  selectedActor === actor
                    ? 'bg-brand-500 text-white font-semibold'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {actor === 'all' ? 'All Actors' : actor}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-neutral-400 font-mono">
          Showing {filteredEvents.length} recorded operations
        </span>
      </div>

      {/* Telemetry Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Tool Invocations</th>
                <th className="py-3 px-4">Case Context</th>
                <th className="py-3 px-4">Result / State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredEvents.map((evt, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                    {evt.timestamp}
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActorBadge(evt.actor)}
                  </td>

                  {/* Event & Details */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-900 block">{evt.event}</span>
                    <span className="text-[11px] text-neutral-500 leading-tight">{evt.details}</span>
                  </td>

                  {/* Tool */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {evt.toolUsed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                        <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                        {formatToolName(evt.toolUsed)}
                      </span>
                    ) : (
                      <span className="text-neutral-300 font-mono text-[11px]">—</span>
                    )}
                  </td>

                  {/* Case Context Link */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Link
                      href={`/recovery/${evt.caseId}`}
                      className="font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>{evt.company}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>

                  {/* Result */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {evt.result ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-success-50 text-success-700 border border-success-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {evt.result}
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-medium">{evt.state}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

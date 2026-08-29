'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  FileText,
  MessageSquare,
  Users,
  Plug,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ExternalLink,
  Shield,
  Building,
  Mail,
} from 'lucide-react';
import { DEMO_INTEGRATIONS } from '@/lib/demo-data';
import { IntegrationSource } from '@/lib/types';
import { useReclaim } from '@/context/ReclaimContext';

export default function IntegrationsPage() {
  const { addToast } = useReclaim();
  const [integrations, setIntegrations] = useState<IntegrationSource[]>(DEMO_INTEGRATIONS);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const handleSync = async (id: string, name: string) => {
    setIsSyncing(id);
    await new Promise((r) => setTimeout(r, 800));
    setIsSyncing(null);
    addToast({
      type: 'success',
      title: 'Integration Synced',
      message: `${name} webhooks and payment event feeds are synchronized.`,
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return CreditCard;
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Building': return Building;
      case 'Mail': return Mail;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Plug className="w-4 h-4" />
            Revenue Infrastructure
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
            Connected Revenue Sources
          </h2>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Gateways, billing engines, and communication channels providing event feeds to Reclaim.
          </p>
        </div>

        {/* Sandbox Environment Notice */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-800 font-semibold shadow-xs">
          <Shield className="w-4 h-4 text-brand-600" />
          <span>Active Mode: Razorpay Sandbox</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
        <Zap className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-600 space-y-1">
          <span className="font-bold text-neutral-900 block">
            Unified Payment Gateway Architecture
          </span>
          <p className="leading-relaxed">
            Reclaim features an enterprise-grade Payment Orchestration Layer designed to seamlessly connect live Razorpay, Stripe, and custom billing APIs in production with zero code changes.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item) => {
          const Icon = getIcon(item.iconName);
          const isConnected = item.status === 'connected';

          return (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-brand-600 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900">{item.name}</h3>
                        {item.isSandbox && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                            Sandbox
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400">{item.provider}</span>
                    </div>
                  </div>

                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  {isConnected ? `${item.eventsCount} events received` : 'Optional context source'}
                </span>

                {isConnected ? (
                  <button
                    onClick={() => handleSync(item.id, item.name)}
                    disabled={isSyncing === item.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === item.id ? 'animate-spin' : ''}`} />
                    <span>{isSyncing === item.id ? 'Syncing...' : 'Sync Webhooks'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIntegrations((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, status: 'connected', eventsCount: 120 } : i))
                      );
                      addToast({
                        type: 'success',
                        title: 'CRM Connected',
                        message: 'Connected Salesforce Sandbox context feed.',
                      });
                    }}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-semibold text-xs transition-colors"
                  >
                    Connect Sandbox
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook Stream Preview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">
          Real-time Webhook Receiver Telemetry
        </h3>
        <div className="bg-neutral-900 text-neutral-200 font-mono text-xs p-4 rounded-lg space-y-1.5 overflow-x-auto">
          <p className="text-neutral-400"># Listening for incoming payment events on /api/webhooks/razorpay</p>
          <p className="text-success-400">2026-08-21 13:42:01 POST /webhooks/razorpay 200 OK [event: payment.failed] [Ref: #RZP-ACME-10291]</p>
          <p className="text-brand-400">2026-08-21 13:42:02 AGENT_INVOKE: Capability [Customer Intelligence Profiling] [Account: Acme Corp]</p>
          <p className="text-brand-400">2026-08-21 13:42:03 AGENT_DECISION: Recovery Probability 82% [Action: Smart Gateway Retry]</p>
          <p className="text-neutral-300">2026-08-21 13:43:00 SCHEDULED: Optimized gateway retry queued for 10:00 AM IST</p>
        </div>
      </div>
    </div>
  );
}

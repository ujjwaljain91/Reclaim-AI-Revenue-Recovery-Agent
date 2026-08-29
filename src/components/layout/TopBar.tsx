'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Calendar,
  Sparkles,
  Menu,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  LogOut,
} from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { useAuth } from '@/context/AuthContext';
import { AgentState } from '@/lib/types';
import { ReclaimLogo } from './ReclaimLogo';

interface TopBarProps {
  onToggleMobileNav: () => void;
  onOpenBatchSim?: () => void;
  onOpenPaymentSim?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileNav,
  onOpenBatchSim,
  onOpenPaymentSim,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { agentState, searchQuery, setSearchQuery, addToast, openAskReclaim } = useReclaim();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out successfully.',
    });
    signOut();
  };

  const userInitials = user
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const getPageTitle = (path: string) => {
    if (path === '/') return { title: 'Revenue Recovery', subtitle: 'Your AI recovery command center' };
    if (path.startsWith('/recovery/')) return { title: 'Case Investigation', subtitle: 'Detailed root-cause analysis & bounded recovery actions' };
    if (path === '/recovery') return { title: 'Recovery Queue', subtitle: 'Prioritized active recovery opportunities & interventions' };
    if (path === '/agent/activity') return { title: 'Agent Activity', subtitle: 'Real-time telemetry, tool executions & event stream' };
    if (path === '/agent/decisions') return { title: 'Agent Decisions', subtitle: 'Audit log of autonomous decisions and rationales' };
    if (path === '/agent/guardrails') return { title: 'Recovery Guardrails', subtitle: 'Autonomous execution boundaries and safety limits' };
    if (path === '/insights') return { title: 'Financial Insights', subtitle: 'Revenue recovery analytics & intervention effectiveness' };
    if (path === '/integrations') return { title: 'Revenue Stack', subtitle: 'Payment gateways, billing engines & notification channels' };
    if (path === '/settings') return { title: 'Settings', subtitle: 'Workspace preferences, currency & audit policies' };
    if (path === '/onboarding') return { title: 'Get Started with Reclaim', subtitle: '3-step revenue recovery agent activation' };
    return { title: 'Reclaim', subtitle: 'AI Revenue Recovery Agent' };
  };

  const { title, subtitle } = getPageTitle(pathname);

  const getAgentStateBadge = (state: AgentState) => {
    switch (state) {
      case 'ACTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-brand-600 animate-spin" />
            Acting
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-info-50 text-info-700 border border-info-200">
            <Clock className="w-3.5 h-3.5 text-info-600" />
            Analyzing
          </span>
        );
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200">
            <CheckCircle className="w-3.5 h-3.5 text-success-600" />
            Recovered
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-200">
            <AlertCircle className="w-3.5 h-3.5 text-warning-600" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Monitoring
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-md focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden">
          <ReclaimLogo variant="icon" />
        </div>

        <div>
          <h1 className="text-base md:text-lg font-bold text-neutral-900 leading-tight">
            {title}
          </h1>
          <p className="text-xs text-neutral-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Controls, Agent Badge, Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Agent State Badge */}
        <div className="hidden lg:flex items-center">
          {getAgentStateBadge(agentState)}
        </div>

        {/* Date Selector */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 bg-neutral-50 text-xs text-neutral-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span>Last 30 Days</span>
        </div>

        {/* Sandbox Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 text-neutral-600 text-[11px] font-medium border border-neutral-200">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          <span>Razorpay Sandbox</span>
        </div>

        {/* Action Button: Batch runner */}
        <button
          onClick={onOpenBatchSim}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Batch Demo</span>
        </button>

        {/* Ask Reclaim ✦ Trigger Button */}
        <button
          onClick={() => openAskReclaim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100/90 text-brand-700 border border-brand-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
          title="Ask Reclaim ✦ — Revenue Intelligence Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 group-hover:rotate-12 transition-transform" />
          <span>Ask Reclaim</span>
          <span className="text-brand-600 font-extrabold text-[12px]">✦</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-modal p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-900">Agent Notifications</span>
                <span className="text-[10px] text-brand-600 font-medium cursor-pointer" onClick={() => setShowNotifications(false)}>
                  Close
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 bg-success-50 border border-success-100 rounded text-success-800">
                  <p className="font-semibold">✓ ₹24,999 Recovered</p>
                  <p className="text-[11px] text-success-600">Acme Corp smart retry verified via webhook.</p>
                </div>
                <div className="p-2 bg-neutral-50 border border-neutral-100 rounded text-neutral-700">
                  <p className="font-medium">Mandate Retry Scheduled</p>
                  <p className="text-[11px] text-neutral-500">Nova Systems card update token sent via WhatsApp.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-[11px] font-bold text-brand-700" title={user?.email || 'User'}>
            {userInitials}
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

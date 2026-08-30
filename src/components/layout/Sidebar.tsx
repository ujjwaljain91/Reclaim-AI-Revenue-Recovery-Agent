'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Bot,
  Activity,
  GitBranch,
  BarChart3,
  Plug,
  Settings,
  Sparkles,
  Zap,
  LogOut,
  FlaskConical,
  TrendingUp,
} from 'lucide-react';
import { ReclaimLogo } from './ReclaimLogo';
import { useReclaim } from '@/context/ReclaimContext';

interface SidebarProps {
  onOpenBatchSim?: () => void;
  onOpenPaymentSim?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenBatchSim, onOpenPaymentSim }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { kpis, agentState, addToast } = useReclaim();

  const handleLogout = () => {
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out successfully.',
    });
    router.push('/');
  };

  const isNavActive = (href: string) => {
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Recovery Queue',
      href: '/recovery',
      icon: RefreshCw,
      badge: `${kpis.activeCasesCount}`,
    },
    {
      label: 'Agent Hub',
      icon: Bot,
      children: [
        { label: 'Live Activity', href: '/agent/activity', icon: Activity },
        { label: 'Decisions', href: '/agent/decisions', icon: GitBranch },
        { label: 'Recovery Strategy', href: '/agent/strategy', icon: TrendingUp },
        { label: 'Guardrails', href: '/agent/guardrails', icon: ShieldCheck },
      ],
    },
    { label: 'Insights', href: '/insights', icon: BarChart3 },
    { label: 'Recovery Lab', href: '/recovery-lab', icon: FlaskConical, badge: 'Benchmark' },
    { label: 'Integrations', href: '/integrations', icon: Plug, badge: 'Sandbox' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-neutral-200 justify-between">
        <ReclaimLogo size="md" />
        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
          Agent
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.children) {
                const isGroupActive = item.children.some((child) => pathname.startsWith(child.href));
                return (
                  <div key={item.label} className="pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-neutral-500">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="pl-4 space-y-1 mt-1 border-l border-neutral-100 ml-4">
                      {item.children.map((child) => {
                        const active = isNavActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              active
                                ? 'bg-brand-50 text-brand-700 font-semibold'
                                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <child.icon className={`w-3.5 h-3.5 ${active ? 'text-brand-600' : 'text-neutral-400'}`} />
                              <span>{child.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const active = isNavActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        active
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Simulation Trigger Card */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              Buildathon Demo
            </span>
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Test Reclaim with 100 batch cases or inject custom failure events.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={onOpenBatchSim}
              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run 100-Case Batch
            </button>
            <button
              onClick={onOpenPaymentSim}
              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded text-[11px] font-medium transition-colors"
            >
              Simulate Failure
            </button>
          </div>
        </div>
      </div>

      {/* User & Organization Footer */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200 shrink-0">
              AC
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-900 leading-tight truncate">Acme Corp</span>
              <span className="text-[10px] text-neutral-400 truncate">Admin · Live Sandbox</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out to landing page"
            aria-label="Log out to landing page"
            className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

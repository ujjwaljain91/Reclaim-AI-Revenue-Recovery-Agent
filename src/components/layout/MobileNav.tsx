'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  RefreshCw,
  Bot,
  BarChart3,
  Settings,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  GitBranch,
  LogOut,
} from 'lucide-react';
import { ReclaimLogo } from './ReclaimLogo';
import { useReclaim } from '@/context/ReclaimContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBatchSim?: () => void;
  onOpenPaymentSim?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenBatchSim,
  onOpenPaymentSim,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { kpis, addToast, openAskReclaim } = useReclaim();

  const handleLogout = () => {
    onClose();
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

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Recovery Queue', href: '/recovery', icon: RefreshCw, badge: `${kpis.activeCasesCount}` },
    { label: 'Live Activity', href: '/agent/activity', icon: Activity },
    { label: 'AI Decisions', href: '/agent/decisions', icon: GitBranch },
    { label: 'Guardrails', href: '/agent/guardrails', icon: ShieldCheck },
    { label: 'Financial Insights', href: '/insights', icon: BarChart3 },
    { label: 'Integrations', href: '/integrations', icon: Zap },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col shadow-modal ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-4 border-b border-neutral-200 flex items-center justify-between">
          <ReclaimLogo size="md" />
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-900 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Ask Reclaim ✦
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-200/60 text-brand-800 font-bold uppercase">
                Copilot
              </span>
            </div>
            <p className="text-[11px] text-brand-700 leading-snug">
              Ask about revenue at risk, timing, or agent decisions.
            </p>
            <button
              onClick={() => {
                onClose();
                openAskReclaim();
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-2xs min-h-[40px] cursor-pointer"
            >
              <span>✦ Open Copilot</span>
            </button>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-neutral-700 block">Buildathon Simulation</span>
            <button
              onClick={() => {
                onClose();
                onOpenBatchSim?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold shadow-xs min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
              Run 100-Case Batch
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
              AC
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Acme Corp</p>
              <p className="text-[10px] text-neutral-500">Razorpay Sandbox Active</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 z-30 flex items-center justify-around px-2 shadow-subtle">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-16 h-full text-[11px] font-medium min-h-[44px] min-w-[44px] ${
            isNavActive('/dashboard') ? 'text-brand-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/recovery"
          className={`flex flex-col items-center justify-center w-16 h-full text-[11px] font-medium min-h-[44px] min-w-[44px] relative ${
            isNavActive('/recovery') ? 'text-brand-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <RefreshCw className="w-5 h-5 mb-0.5" />
          <span>Queue</span>
          {kpis.activeCasesCount > 0 && (
            <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-brand-500" />
          )}
        </Link>
        <Link
          href="/agent/activity"
          className={`flex flex-col items-center justify-center w-16 h-full text-[11px] font-medium min-h-[44px] min-w-[44px] ${
            isNavActive('/agent') ? 'text-brand-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span>Agent</span>
        </Link>
        <Link
          href="/insights"
          className={`flex flex-col items-center justify-center w-16 h-full text-[11px] font-medium min-h-[44px] min-w-[44px] ${
            isNavActive('/insights') ? 'text-brand-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Insights</span>
        </Link>
        <button
          onClick={onOpenBatchSim}
          className="flex flex-col items-center justify-center w-16 h-full text-[11px] font-medium text-brand-600 min-h-[44px] min-w-[44px]"
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>Demo</span>
        </button>
      </nav>
    </>
  );
};

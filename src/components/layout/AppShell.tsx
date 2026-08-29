'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { BatchProcessorModal } from '../reclaim/BatchProcessorModal';
import { PaymentSimulatorModal } from '../reclaim/PaymentSimulatorModal';
import { ToastContainer } from '../reclaim/ToastContainer';
import { AskReclaimDrawer } from '../reclaim/AskReclaimDrawer';
import { useReclaim } from '@/context/ReclaimContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAskReclaimOpen, closeAskReclaim, askReclaimCaseId } = useReclaim();
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname.startsWith('/auth');
  const isOnboardingPage = pathname.startsWith('/onboarding');

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isBatchSimOpen, setIsBatchSimOpen] = useState(false);
  const [isPaymentSimOpen, setIsPaymentSimOpen] = useState(false);

  // Auth pages and Onboarding wizard render without dashboard shell chrome
  if (isAuthPage || isOnboardingPage) {
    return <>{children}</>;
  }

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-white flex flex-col antialiased text-neutral-900 selection:bg-brand-500 selection:text-white">
        <main className="flex-1 w-full">
          {children}
        </main>

        <BatchProcessorModal
          isOpen={isBatchSimOpen}
          onClose={() => setIsBatchSimOpen(false)}
        />

        <PaymentSimulatorModal
          isOpen={isPaymentSimOpen}
          onClose={() => setIsPaymentSimOpen(false)}
        />

        <AskReclaimDrawer
          isOpen={isAskReclaimOpen}
          onClose={closeAskReclaim}
          initialCaseId={askReclaimCaseId}
        />

        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar
          onOpenBatchSim={() => setIsBatchSimOpen(true)}
          onOpenPaymentSim={() => setIsPaymentSimOpen(true)}
        />
      </div>

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenBatchSim={() => setIsBatchSimOpen(true)}
        onOpenPaymentSim={() => setIsPaymentSimOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-60 flex flex-col min-h-screen pb-16 md:pb-0">
        <TopBar
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
          onOpenBatchSim={() => setIsBatchSimOpen(true)}
          onOpenPaymentSim={() => setIsPaymentSimOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modals and Overlays */}
      <BatchProcessorModal
        isOpen={isBatchSimOpen}
        onClose={() => setIsBatchSimOpen(false)}
      />

      <PaymentSimulatorModal
        isOpen={isPaymentSimOpen}
        onClose={() => setIsPaymentSimOpen(false)}
      />

      <AskReclaimDrawer
        isOpen={isAskReclaimOpen}
        onClose={closeAskReclaim}
        initialCaseId={askReclaimCaseId}
      />

      <ToastContainer />
    </div>
  );
};

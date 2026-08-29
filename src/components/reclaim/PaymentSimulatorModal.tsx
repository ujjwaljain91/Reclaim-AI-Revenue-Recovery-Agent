'use client';

import React, { useState } from 'react';
import { X, CreditCard, AlertTriangle, Zap, Check } from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';
import { DEMO_CUSTOMERS } from '@/lib/demo-data';
import { FailureReason } from '@/lib/types';

interface PaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentSimulatorModal: React.FC<PaymentSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { injectSimulatedPayment } = useReclaim();
  const [selectedCustomerId, setSelectedCustomerId] = useState(DEMO_CUSTOMERS[0].id);
  const [amount, setAmount] = useState<number>(24999);
  const [failureReason, setFailureReason] = useState<FailureReason>('Insufficient funds');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const failureReasons: FailureReason[] = [
    'Insufficient funds',
    'Card expired',
    'Bank decline',
    'Authentication failure',
    'Network failure',
    'Mandate failure',
    'Payment timeout',
    'Invoice overdue',
  ];

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    injectSimulatedPayment(selectedCustomerId, Number(amount), failureReason);
    setIsSubmitting(false);
    onClose();
  };

  const selectedCustomer = DEMO_CUSTOMERS.find((c) => c.id === selectedCustomerId) || DEMO_CUSTOMERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-modal border border-neutral-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-700 border border-warning-200 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                Simulate Payment Failure
              </h2>
              <p className="text-xs text-neutral-500">
                Inject a failed gateway event to test Reclaim's autonomous response.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSimulate} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
            >
              {DEMO_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.name} · {c.customerType}) — LTV ₹{(c.lifetimeValue / 100000).toFixed(1)}L
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Transaction Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-medium">₹</span>
              <input
                type="number"
                min="500"
                step="500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono"
                required
              />
            </div>
            <div className="flex gap-2 mt-1.5">
              {[12999, 24999, 48999, 124000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    amount === preset
                      ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Failure Reason */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Gateway Failure Reason
            </label>
            <div className="grid grid-cols-2 gap-2">
              {failureReasons.map((reason) => {
                const isSelected = failureReason === reason;
                return (
                  <button
                    type="button"
                    key={reason}
                    onClick={() => setFailureReason(reason)}
                    className={`text-left p-2 rounded-md border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 border-brand-300 text-brand-900 font-semibold'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{reason}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guardrail Context Note */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <span className="font-semibold text-neutral-800 block">Agent Execution Preview:</span>
            <p>
              Reclaim will analyze <strong>{selectedCustomer.company}</strong>'s payment history, calculate recovery probability, check configured guardrails, and recommend a bounded action.
            </p>
            {amount >= 50000 && (
              <p className="text-warning-700 font-medium pt-1">
                ⚠️ High-value rule active: Amount &gt; ₹50,000 will pause for human approval.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              {isSubmitting ? 'Injecting Event...' : 'Simulate Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

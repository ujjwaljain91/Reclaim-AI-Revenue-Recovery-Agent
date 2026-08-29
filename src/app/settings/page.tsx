'use client';

import React, { useState } from 'react';
import { Settings, Building, DollarSign, Shield, Bell, CheckCircle2, User } from 'lucide-react';
import { useReclaim } from '@/context/ReclaimContext';

export default function SettingsPage() {
  const { addToast } = useReclaim();
  const [orgName, setOrgName] = useState('Acme Corp');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Workspace configurations updated successfully.',
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          Workspace Configuration
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">
          Organization Settings
        </h2>
        <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
          Manage currency standards, billing environments, team access, and audit policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Workspace Info */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Building className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-neutral-900">General Workspace</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Business Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Environment
              </label>
              <input
                type="text"
                disabled
                value="Buildathon Sandbox (Razorpay Sandbox Active)"
                className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-md text-xs font-medium text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Audit & Compliance */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 md:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Shield className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-neutral-900">Audit & Governance</h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-700">
            <div className="flex items-center justify-between p-3 rounded bg-neutral-50 border border-neutral-100">
              <div>
                <span className="font-semibold text-neutral-900 block">Immutable Agent Audit Trail</span>
                <span className="text-neutral-500 text-[11px]">All tool decisions and outcomes stored indefinitely</span>
              </div>
              <span className="font-bold text-success-700">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-neutral-50 border border-neutral-100">
              <div>
                <span className="font-semibold text-neutral-900 block">Webhook Signature Verification</span>
                <span className="text-neutral-500 text-[11px]">HMAC SHA-256 verification for Razorpay webhooks</span>
              </div>
              <span className="font-bold text-success-700">Active</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            {isSaved ? 'Saved Successfully' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

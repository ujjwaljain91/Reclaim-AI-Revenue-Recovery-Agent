'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, ArrowRight, RotateCcw, CheckCircle2, Smartphone } from 'lucide-react';
import { ReclaimLogo } from '@/components/layout/ReclaimLogo';

const DUMMY_OTP = '482916';
const OTP_LENGTH = 6;

export default function VerifyOTPPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(DUMMY_OTP.split(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-start resend cooldown on mount
  useEffect(() => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      // Small delay to allow hydration
      const t = setTimeout(() => {
        router.push('/auth/signin');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Simulate verification delay
    await new Promise((res) => setTimeout(res, 1200));

    // Accept any 6-digit OTP (dummy auth)
    if (enteredOtp.length === OTP_LENGTH) {
      setIsVerified(true);
      setIsVerifying(false);

      // Check if user has already completed onboarding
      const isCompleted = user?.onboardingCompleted === true;

      // Redirect after success animation
      setTimeout(() => {
        if (isCompleted) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }, 1200);
    } else {
      setError('Invalid OTP. Please try again.');
      setIsVerifying(false);
    }
  }, [otp, router, user]);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    // Re-fill with dummy OTP
    setOtp(DUMMY_OTP.split(''));
    setError('');
    setResendCooldown(30);

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
    : 'de**@reclaim.ai';

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-gradient-to-br from-emerald-600 via-brand-500 to-indigo-500 text-white p-10 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-24 -left-12 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/3 w-36 h-36 rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          <ReclaimLogo variant="full" className="text-white" />
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Securing your account
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Security illustration */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Two-Factor Verification</p>
                <p className="text-xs text-white/60">Extra layer of security</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-white/80">Identity verified via credentials</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isVerified ? 'border-emerald-300 bg-emerald-400/20' : 'border-white/40 animate-pulse'
                }`}>
                  {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                </div>
                <span className={`${isVerified ? 'text-emerald-300' : 'text-white/80'}`}>
                  {isVerified ? 'OTP verified successfully' : 'OTP verification pending…'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 flex-shrink-0" />
                <span className="text-white/40">Session established</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Smartphone className="w-4.5 h-4.5 text-white/90" />
            </div>
            <div>
              <p className="text-sm font-semibold">Demo Mode</p>
              <p className="text-xs text-white/60 mt-0.5">OTP is pre-filled for demo. Just click verify!</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">
          © {new Date().getFullYear()} Reclaim AI. All rights reserved.
        </p>
      </div>

      {/* Right Panel — OTP Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <ReclaimLogo variant="full" size="md" />
          </div>

          {isVerified ? (
            /* Success State */
            <div className="text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-20 h-20 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-success-500" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Verified Successfully!
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Redirecting you to the dashboard…
              </p>
              <div className="mt-6 flex justify-center">
                <span className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            /* OTP Entry State */
            <>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-7 h-7 text-brand-500" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Verify your identity
                </h1>
                <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
                  We&apos;ve sent a 6-digit verification code to{' '}
                  <span className="font-semibold text-neutral-700">{maskedEmail}</span>
                </p>
              </div>


              {/* OTP Input Grid */}
              <div className="mt-7 flex items-center justify-center gap-2.5 sm:gap-3">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-150 outline-none
                      ${otp[i]
                        ? 'border-brand-400 bg-brand-50/50 text-brand-700 shadow-sm'
                        : 'border-neutral-300 bg-white text-neutral-900'
                      }
                      focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                      ${error ? 'border-danger-400 ring-2 ring-danger-500/10' : ''}
                    `}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <p className="mt-3 text-center text-xs font-medium text-danger-600 animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.join('').length < OTP_LENGTH}
                className="w-full mt-6 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend */}
              <div className="mt-5 text-center">
                <p className="text-xs text-neutral-500">
                  Didn&apos;t receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-neutral-400">
                      Resend in <span className="font-mono font-semibold text-neutral-600">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleResend}
                      className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resend Code
                    </button>
                  )}
                </p>
              </div>

              {/* Helper text */}
              <div className="mt-8 pt-5 border-t border-neutral-200">
                <div className="flex items-start gap-2.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" />
                  <p>
                    This is a <span className="font-semibold text-neutral-500">demo verification</span>. 
                    In production, a real OTP would be sent via SMS or authenticator app. 
                    Any 6-digit code will be accepted.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

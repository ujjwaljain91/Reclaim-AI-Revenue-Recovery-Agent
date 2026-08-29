'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, ArrowRight, UserPlus, Shield, Zap, TrendingUp } from 'lucide-react';
import { ReclaimLogo } from '@/components/layout/ReclaimLogo';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@reclaim.ai');
  const [password, setPassword] = useState('Reclaim@2026');
  const [confirmPassword, setConfirmPassword] = useState('Reclaim@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/auth/verify-otp');
    } else {
      setError(result.error || 'Sign-up failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 text-white p-10 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          <ReclaimLogo variant="full" className="text-white" />
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Start recovering lost revenue in minutes
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white/90" />
            </div>
            <div>
              <p className="text-sm font-semibold">Enterprise-Grade Security</p>
              <p className="text-xs text-white/60 mt-0.5">SOC2-ready design with complete audit trails.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white/90" />
            </div>
            <div>
              <p className="text-sm font-semibold">5-Minute Setup</p>
              <p className="text-xs text-white/60 mt-0.5">Connect your payment gateway and start recovering.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-white/90" />
            </div>
            <div>
              <p className="text-sm font-semibold">Free 14-Day Trial</p>
              <p className="text-xs text-white/60 mt-0.5">No credit card required. Full feature access from day one.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">
          © {new Date().getFullYear()} Reclaim AI. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <ReclaimLogo variant="full" size="md" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Create your account
              <UserPlus className="w-5 h-5 text-brand-500" />
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Get started with AI-powered revenue recovery
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="px-3.5 py-2.5 rounded-lg bg-danger-50 border border-danger-200/50 text-danger-700 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Work email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= level * 3
                          ? password.length >= 12
                            ? 'bg-success-500'
                            : password.length >= 8
                            ? 'bg-brand-500'
                            : 'bg-warning-500'
                          : 'bg-neutral-200'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-neutral-500 ml-1">
                    {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : password.length >= 6 ? 'Fair' : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-shadow"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="mt-1 text-[11px] text-danger-600">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-[11px] text-neutral-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Social sign-up */}
          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>

            <button
              type="button"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 transition-colors flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Sign up with GitHub
            </button>
          </div>

          {/* Sign in link */}
          <p className="mt-8 text-center text-xs text-neutral-500">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-brand-600 hover:text-brand-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

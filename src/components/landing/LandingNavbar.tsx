'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { ReclaimLogo } from '@/components/layout/ReclaimLogo';

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Interactive Demo', href: '#simulator' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About Reclaim', href: '#about' },
    { label: 'ROI & Impact', href: '#roi' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs py-3'
          : 'bg-transparent py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Mode Badge */}
        <div className="flex items-center gap-3">
          <ReclaimLogo size="md" linkHref="/" />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            <span>AI Agent v2.4 Live</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-neutral-600">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link
            href="/auth/signin"
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-5 py-4 space-y-2 shadow-card animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-xs font-semibold text-neutral-700 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-3 mt-2 border-t border-neutral-200 flex items-center gap-2">
            <Link
              href="/auth/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

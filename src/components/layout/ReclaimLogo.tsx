'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ReclaimLogoProps {
  variant?: 'full' | 'icon' | 'responsive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkHref?: string;
}

export const ReclaimLogo: React.FC<ReclaimLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  linkHref = '/',
}) => {
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const pixelHeights = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {variant === 'icon' ? (
        // Icon-only compact mark
        <div className="relative w-8 h-8 rounded-md bg-white border border-neutral-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm" style={{ width: 32, height: 32 }}>
          <img
            src="/reclaim-logo.png"
            alt="Reclaim Mark"
            className="w-full h-full object-cover object-left scale-125"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : variant === 'responsive' ? (
        // Responsive: icon on mobile, full lockup on desktop
        <>
          <div className="md:hidden relative w-8 h-8 rounded-md bg-white border border-neutral-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm" style={{ width: 32, height: 32 }}>
            <img
              src="/reclaim-logo.png"
              alt="Reclaim Mark"
              className="w-full h-full object-cover object-left scale-125"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="hidden md:flex items-center">
            <img
              src="/reclaim-logo.png"
              alt="Reclaim - AI Revenue Recovery"
              className={`${heights[size]} w-auto object-contain`}
              style={{ height: pixelHeights[size], width: 'auto', maxHeight: pixelHeights[size] }}
            />
          </div>
        </>
      ) : (
        // Full lockup
        <div className="flex items-center">
          <img
            src="/reclaim-logo.png"
            alt="Reclaim - AI Revenue Recovery"
            className={`${heights[size]} w-auto object-contain`}
            style={{ height: pixelHeights[size], width: 'auto', maxHeight: pixelHeights[size] }}
          />
        </div>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
};

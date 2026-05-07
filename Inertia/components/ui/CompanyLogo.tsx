"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  src?: string;
  name?: string;
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CompanyLogo = ({ src, name, symbol, className, size = 'md' }: CompanyLogoProps) => {
  const [error, setError] = useState(false);

  // Fallback Clearbit URL if Finnhub logo is missing
  const clearbitFallback = name 
    ? `https://logo.clearbit.com/${name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : null;

  // Final fallback is the first letter of the symbol
  const initial = symbol ? symbol[0].toUpperCase() : '?';

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const currentSrc = !error ? (src || clearbitFallback) : null;

  if (currentSrc && !error) {
    return (
      <div className={cn(
        "rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700/50 flex-shrink-0",
        sizeClasses[size],
        className
      )}>
        <img 
          src={currentSrc} 
          alt={name || symbol} 
          className="w-full h-full object-contain p-1"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700/50 flex-shrink-0",
      sizeClasses[size],
      className
    )}>
      {initial}
    </div>
  );
};

export default CompanyLogo;

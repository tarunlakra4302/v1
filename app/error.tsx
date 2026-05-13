'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-negative/10 rounded-[32px] flex items-center justify-center border border-negative/20">
            <AlertTriangle className="w-10 h-10 text-negative" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Signal Interrupted</h1>
          <p className="text-zinc-500 font-medium leading-relaxed">
            We encountered a turbulence in the market data stream. Our engineering team has been alerted.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl font-bold transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4 text-positive" />
            Retry Signal
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Base
          </Link>
        </div>

        <div className="pt-8 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          Error Hash: {error.digest || 'UNKNOWN_FRAGMENT'}
        </div>
      </motion.div>
    </div>
  );
}

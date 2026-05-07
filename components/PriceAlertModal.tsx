"use client";

import React, { useState } from 'react';
import { X, ChevronDown, Bell, Loader2 } from 'lucide-react';
import { createAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockName?: string;
  stockSymbol?: string;
  userEmail?: string;
}

const PriceAlertModal = ({ 
  isOpen, 
  onClose, 
  stockName = "Apple Inc", 
  stockSymbol = "AAPL",
  userEmail 
}: PriceAlertModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alertName: `${stockSymbol} Price Alert`,
    alertType: 'upper' as 'upper' | 'lower',
    threshold: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!userEmail) {
      toast.error("You must be signed in to create alerts");
      return;
    }

    if (!formData.threshold || isNaN(parseFloat(formData.threshold))) {
      toast.error("Please enter a valid threshold price");
      return;
    }

    try {
      setIsSubmitting(true);
      await createAlert({
        email: userEmail,
        symbol: stockSymbol,
        company: stockName,
        alertName: formData.alertName,
        alertType: formData.alertType,
        threshold: parseFloat(formData.threshold)
      });
      
      toast.success(`Alert created for ${stockSymbol}`);
      onClose();
    } catch (err) {
      toast.error("Failed to create alert. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0D0D0E] rounded-[32px] shadow-[0_0_80px_-12px_rgba(0,0,0,0.5)] border border-[#1A1A1B] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fcd34d]/10 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#fcd34d]" />
              </div>
              <h2 className="text-white text-xl font-bold tracking-tight">Price Alert</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Alert Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Alert Reference</label>
              <input 
                type="text" 
                value={formData.alertName}
                onChange={(e) => setFormData(prev => ({ ...prev, alertName: e.target.value }))}
                className="w-full h-14 bg-[#141415] border border-[#1A1A1B] focus:border-[#fcd34d]/50 rounded-2xl px-4 text-white focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Stock Identifier (Read-only) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Asset</label>
              <div className="w-full h-14 bg-[#141415]/50 border border-[#1A1A1B] rounded-2xl px-4 flex items-center text-zinc-400 font-bold">
                {stockName} <span className="ml-2 text-[10px] text-zinc-600 font-mono tracking-tighter">{stockSymbol}</span>
              </div>
            </div>

            {/* Row: Alert Type & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Trigger</label>
                <div className="relative group">
                  <select 
                    value={formData.alertType}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertType: e.target.value as 'upper' | 'lower' }))}
                    className="w-full h-14 bg-[#141415] border border-[#1A1A1B] group-hover:border-[#2A2A2B] rounded-2xl px-4 text-white appearance-none focus:outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="upper">Price Above</option>
                    <option value="lower">Price Below</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Threshold</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#fcd34d] font-bold">$</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    value={formData.threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                    className="w-full h-14 bg-[#141415] border border-[#1A1A1B] focus:border-[#fcd34d]/50 rounded-2xl pl-8 pr-4 text-white focus:outline-none transition-all font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-[64px] bg-[#fcd34d] hover:bg-[#fbbf24] text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] shadow-2xl shadow-[#fcd34d]/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Syncing Alert...
              </>
            ) : (
              'Deploy Alert'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;

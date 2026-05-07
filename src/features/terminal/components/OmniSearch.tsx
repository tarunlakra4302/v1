'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search, Zap, ShieldAlert, BarChart3, Command as CommandIcon } from 'lucide-react';
import { useTerminalStore } from '../terminal.store';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const OmniSearch = () => {
  const { isOmniSearchOpen, toggleOmniSearch, setActiveTicker } = useTerminalStore();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOmniSearch();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleOmniSearch]);

  const handleSelectTicker = (ticker: string) => {
    setActiveTicker(ticker);
    toggleOmniSearch();
    router.push(`/stocks/${ticker.toLowerCase()}`);
  };

  return (
    <AnimatePresence>
      {isOmniSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/80 backdrop-blur-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0A0A0B] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
          >
            <Command className="flex flex-col">
              <div className="flex items-center border-b border-zinc-800 px-4">
                <Search className="mr-3 h-5 w-5 text-zinc-500" />
                <Command.Input
                  placeholder="Execute command or search ticker... (e.g. /risk check)"
                  className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600 text-white"
                />
                <div className="flex items-center gap-1.5 ml-2">
                   <kbd className="hidden sm:flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    <CommandIcon className="h-2.5 w-2.5" /> K
                  </kbd>
                  <button 
                    onClick={toggleOmniSearch}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 font-mono"
                  >
                    ESC
                  </button>
                </div>
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="px-4 py-12 text-center text-sm text-zinc-500">
                  No matching alpha signals found.
                </Command.Empty>

                <Command.Group heading="Engineering Workflows" className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  <Item 
                    icon={<Zap className="h-4 w-4 text-positive" />} 
                    label="Generate Alpha Signal" 
                    value="/analyze" 
                    onSelect={() => { console.log('Analyze'); toggleOmniSearch(); }} 
                  />
                  <Item 
                    icon={<ShieldAlert className="h-4 w-4 text-negative" />} 
                    label="Run Risk Simulation" 
                    value="/risk" 
                    onSelect={() => { console.log('Risk'); toggleOmniSearch(); }} 
                  />
                  <Item 
                    icon={<BarChart3 className="h-4 w-4 text-blue-500" />} 
                    label="Optimize Portfolio" 
                    value="/optimize" 
                    onSelect={() => { console.log('Optimize'); toggleOmniSearch(); }} 
                  />
                </Command.Group>

                <Command.Group heading="Active Tickers" className="px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-t border-zinc-900 mt-2">
                  <Item label="AAPL" sublabel="Apple Inc." onSelect={() => handleSelectTicker('AAPL')} />
                  <Item label="NVDA" sublabel="NVIDIA Corp." onSelect={() => handleSelectTicker('NVDA')} />
                  <Item label="TSLA" sublabel="Tesla, Inc." onSelect={() => handleSelectTicker('TSLA')} />
                  <Item label="BTC" sublabel="Bitcoin" onSelect={() => handleSelectTicker('BTC')} />
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-950/50 px-4 py-2 text-[10px] text-zinc-500">
                <div className="flex gap-4">
                  <span><kbd className="bg-zinc-900 px-1 rounded border border-zinc-800 text-zinc-400">↑↓</kbd> Navigate</span>
                  <span><kbd className="bg-zinc-900 px-1 rounded border border-zinc-800 text-zinc-400">Enter</kbd> Select</span>
                </div>
                <span className="font-mono text-zinc-700">QuantFlow Engine v2.0</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ItemProps {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  value?: string;
  onSelect: () => void;
}

const Item = ({ icon, label, sublabel, value, onSelect }: ItemProps) => (
  <Command.Item
    value={value || label}
    onSelect={onSelect}
    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 aria-selected:bg-zinc-900 aria-selected:text-white transition-all"
  >
    {icon && <div className="flex-shrink-0">{icon}</div>}
    <div className="flex flex-1 items-center justify-between">
      <span className="font-medium">{label}</span>
      {sublabel && <span className="text-[10px] font-mono text-zinc-600">{sublabel}</span>}
    </div>
  </Command.Item>
);

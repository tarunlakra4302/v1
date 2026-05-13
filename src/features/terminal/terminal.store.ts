import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TerminalState {
  activeTicker: string | null;
  isOmniSearchOpen: boolean;
  viewMode: 'COMPACT' | 'EXPANDED' | 'QUANT';
  notifications: Array<{ id: string; type: 'SIGNAL' | 'RISK' | 'SYSTEM'; message: string }>;
  
  setActiveTicker: (ticker: string | null) => void;
  toggleOmniSearch: () => void;
  setViewMode: (mode: 'COMPACT' | 'EXPANDED' | 'QUANT') => void;
  addNotification: (notification: Omit<TerminalState['notifications'][0], 'id'>) => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      activeTicker: null,
      isOmniSearchOpen: false,
      viewMode: 'QUANT',
      notifications: [],

      setActiveTicker: (ticker) => set({ activeTicker: ticker }),
      toggleOmniSearch: () => set((state) => ({ isOmniSearchOpen: !state.isOmniSearchOpen })),
      setViewMode: (mode) => set({ viewMode: mode }),
      addNotification: (n) => set((state) => ({ 
        notifications: [{ ...n, id: crypto.randomUUID() }, ...state.notifications].slice(0, 50) 
      })),
    }),
    {
      name: 'quantflow-terminal-settings',
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);

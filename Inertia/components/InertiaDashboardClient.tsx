'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  BarChart2,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';
import { cn, formatTimeAgo } from '@/lib/utils';

interface InertiaDashboardClientProps {
  initialWatchlist: any[];
  initialNews: any[];
  initialAlerts: any[];
}

export default function InertiaDashboardClient({ 
  initialWatchlist, 
  initialNews, 
  initialAlerts
}: InertiaDashboardClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteAlert = async (alertId: string) => {
    try {
      setIsDeleting(alertId);
      const result = await deleteAlert(alertId);
      if (result.success) {
        toast.success('Alert deleted successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to delete alert');
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Watchlist
            </h1>
            <p className="text-zinc-500 mt-2 font-medium">Monitoring {initialWatchlist.length} active positions</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => router.push('/search')}
              className="bg-white text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-zinc-500" />
                Active Monitors
              </h2>
            </div>

            <div className="grid gap-4">
              {initialWatchlist.length === 0 ? (
                <div className="bg-[#0A0A0A] border border-dashed border-zinc-800 rounded-[32px] p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-400 font-medium">Your watchlist is empty</p>
                    <p className="text-zinc-600 text-sm">Add your first stock to start tracking</p>
                  </div>
                </div>
              ) : (
                initialWatchlist.map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => router.push(`/stocks/${stock.symbol.toLowerCase()}`)}
                    className="group bg-[#0A0A0A] hover:bg-[#0F0F0F] border border-zinc-900 hover:border-zinc-800 rounded-[32px] p-6 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-xl font-bold border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                        {stock.image ? (
                          <img src={stock.image} alt={stock.symbol} className="w-8 h-8 object-contain" />
                        ) : (
                          stock.symbol[0]
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{stock.symbol}</h3>
                          <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-500 rounded-full border border-zinc-800 uppercase tracking-widest font-bold">Equity</span>
                        </div>
                        <p className="text-sm text-zinc-500 font-medium">{stock.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Price</div>
                        <div className="text-lg font-mono font-bold">{stock.price}</div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Change</div>
                        <div className={cn(
                          "text-lg font-mono font-bold flex items-center justify-end gap-1.5",
                          stock.isPositive ? "text-positive" : "text-negative"
                        )}>
                          {stock.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {stock.change}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:bg-white group-hover:text-black transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Price Alerts */}
            <section className="bg-[#0A0A0A] border border-zinc-900 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-zinc-500" />
                  Active Alerts
                </h2>
                <span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-800 font-bold">
                  {initialAlerts.length}
                </span>
              </div>
              
              <div className="space-y-4">
                {initialAlerts.length === 0 ? (
                  <p className="text-sm text-zinc-600 italic">No alerts configured yet.</p>
                ) : (
                  initialAlerts.map((alert) => (
                    <div key={alert._id} className="group bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{alert.symbol}</div>
                        <div className="text-sm font-medium">Price {alert.alertType === 'upper' ? '>' : '<'} ${alert.threshold}</div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAlert(alert._id);
                        }}
                        disabled={isDeleting === alert._id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-negative/10 hover:text-negative transition-all disabled:opacity-50"
                      >
                        <Trash2 className={cn("w-4 h-4", isDeleting === alert._id && "animate-pulse")} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* News */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Market Pulse
                </h2>
                <button 
                  onClick={() => router.push('/')}
                  className="text-[10px] text-zinc-500 font-bold hover:text-white uppercase tracking-widest transition-colors"
                >
                  Dashboard
                </button>
              </div>

              <div className="space-y-6">
                {initialNews.slice(0, 4).map((item, i) => (
                  <div key={i} className="group cursor-pointer flex gap-4" onClick={() => window.open(item.url, '_blank')}>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                        <span>{item.source}</span>
                        <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                        <span suppressHydrationWarning>{formatTimeAgo(item.datetime)}</span>
                      </div>
                      <h3 className="text-sm font-bold leading-tight group-hover:text-positive transition-colors line-clamp-2 tracking-tight">
                        {item.headline}
                      </h3>
                    </div>
                    {item.image && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-900 group-hover:border-zinc-700 transition-all">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

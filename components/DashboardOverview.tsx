"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, 
  ChevronRight,
  Search,
  Plus,
  ShieldAlert,
  Activity,
  Zap,
  BarChart3,
  Clock
} from 'lucide-react';
import CompanyLogo from './ui/CompanyLogo';
import TradingViewWidget from './TradingViewWidget';
import { cn, formatTimeAgo } from "@/lib/utils";
import { useTerminalStore } from "@/src/features/terminal/terminal.store";
import { addToWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';

interface DashboardOverviewProps {
  initialWatchlist: any[];
  initialNews: any[];
  initialIndices: any[];
  initialTopStocks: any[];
  user: any;
  portfolioRisk: {
    var: number;
    sharpeRatio: number;
  };
}

const DashboardOverview = ({
  initialWatchlist,
  initialNews,
  initialIndices,
  initialTopStocks,
  user,
  portfolioRisk
}: DashboardOverviewProps) => {
  const router = useRouter();
  const [activeMarketTab, setActiveMarketTab] = useState('Indices');
  const [activeNewsTab, setActiveNewsTab] = useState('Active Feed');
  const [watchlistSymbols, setWatchlistSymbols] = useState(
    () => new Set(initialWatchlist.map((stock) => String(stock.symbol).toUpperCase()))
  );
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
  const { toggleOmniSearch } = useTerminalStore();

  // Polling for real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [router]);
  
  const marketTabs = ['Indices', 'Stocks', 'Crypto', 'Forex', 'Bonds', 'ETFs'];
  const marketTabSymbols: Record<string, string> = {
    Indices: 'OANDA:SPX500USD',
    Stocks: 'NASDAQ:AAPL',
    Crypto: 'BINANCE:BTCUSDT',
    Forex: 'FX:EURUSD',
    Bonds: 'TVC:US10Y',
    ETFs: 'AMEX:SPY',
  };
  const newsTabs = ['Active Feed', 'Sector News', 'Global Macro'];
  const newsByTab: Record<string, any[]> = {
    'Active Feed': initialNews,
    'Sector News': initialNews.filter((article) => Boolean(article.related)),
    'Global Macro': initialNews.filter((article) => {
      const related = String(article.related || '').trim();
      return !related;
    }),
  };
  const visibleNews = (newsByTab[activeNewsTab] || initialNews).slice(0, 4);

  const handleAddToWatchlist = async (stock: any) => {
    if (!user?.email) {
      toast.error('You must be signed in to update your watchlist');
      return;
    }

    const symbol = String(stock.symbol).toUpperCase();
    if (watchlistSymbols.has(symbol)) {
      toast.message(`${symbol} is already in your watchlist`);
      return;
    }

    try {
      setPendingSymbol(symbol);
      await addToWatchlist({
        email: user.email,
        symbol,
        company: stock.company || stock.name || symbol,
      });

      setWatchlistSymbols((prev) => new Set(prev).add(symbol));
      toast.success(`${symbol} added to your watchlist`);
      router.refresh();
    } catch (error) {
      toast.error('Failed to add stock to watchlist');
      console.error(error);
    } finally {
      setPendingSymbol(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Executive Dashboard
            </h1>
            <p className="text-zinc-500 mt-1 font-medium italic">Terminal initialized. Welcome back, {user?.name?.split(' ')[0]}.</p>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={toggleOmniSearch}
              className="group relative cursor-pointer"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              <div className="bg-[#111111] border border-zinc-800 rounded-2xl py-3 pl-12 pr-16 text-sm text-zinc-500 font-medium group-hover:border-zinc-700 transition-all w-72 flex items-center">
                Execute command...
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-[10px] text-zinc-500">
                <span className="text-[8px]">⌘</span>K
              </div>
            </div>
            <button 
              onClick={() => router.push('/search')}
              className="bg-white text-black px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>
        </header>

        {/* QuantFlow Risk Assessment Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-[24px] p-6 flex flex-col gap-2 group hover:border-negative/30 transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Portfolio VaR (95%)</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-negative">${portfolioRisk.var.toLocaleString()}</span>
              <ShieldAlert className="w-5 h-5 text-negative animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-600 italic">Projected 24h potential drawdown</p>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-[24px] p-6 flex flex-col gap-2 group hover:border-positive/30 transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Sharpe Ratio</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-positive">{portfolioRisk.sharpeRatio.toFixed(2)}</span>
              <Activity className="w-5 h-5 text-positive" />
            </div>
            <p className="text-[10px] text-zinc-600 italic">Risk-adjusted return efficiency</p>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-[24px] p-6 flex flex-col gap-2 group hover:border-blue-500/30 transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Signal Velocity</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-blue-500">High</span>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[10px] text-zinc-600 italic">Market volatility signal detection</p>
          </div>
          <div className="bg-[#111111] border border-zinc-800 rounded-[24px] p-6 flex flex-col gap-2 group hover:border-white/30 transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Alpha Coverage</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-black text-white">84%</span>
              <BarChart3 className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-[10px] text-zinc-600 italic">Watchlist multi-factor saturation</p>
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* A. Market Summary (Top Left) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-800 p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight">Market Pulse</h2>
              <div className="flex bg-[#0A0A0B] border border-zinc-900 rounded-2xl p-1 shadow-inner">
                {marketTabs.slice(0, 6).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMarketTab(tab)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      activeMarketTab === tab ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[400px] w-full rounded-[24px] overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-950/50">
              <TradingViewWidget 
                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                height={400}
                config={{
                  "symbol": marketTabSymbols[activeMarketTab] || marketTabSymbols.Indices,
                  "interval": "D",
                  "timezone": "Etc/UTC",
                  "theme": "dark",
                  "style": "3",
                  "locale": "en",
                  "enable_publishing": false,
                  "hide_top_toolbar": true,
                  "hide_legend": true,
                  "save_image": false,
                  "container_id": "tradingview_chart",
                  "backgroundColor": "#111111",
                  "gridColor": "rgba(255, 255, 255, 0.05)",
                  "hide_side_toolbar": true,
                  "details": false,
                  "hotlist": false,
                  "calendar": false,
                  "show_popup_button": false,
                  "width": "100%",
                  "height": 400
                }}
              />
            </div>

            {/* Index Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {initialIndices.map((idx) => (
                <div key={idx.symbol} className="bg-[#0A0A0B] rounded-2xl p-5 border border-zinc-900 hover:border-zinc-800 transition-all group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">{idx.name}</span>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full",
                      idx.isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    )}>
                      {idx.isPositive ? '+' : ''}{idx.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xl font-bold font-mono tracking-tighter group-hover:scale-105 transition-transform origin-left">{idx.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>

          {/* B. Your Watchlist (Top Right) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-800 p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Watchlist Monitor</h2>
              <button 
                onClick={() => router.push('/watchlist')}
                className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-all flex items-center gap-2 group"
              >
                Launch Center <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {initialWatchlist.slice(0, 4).map((stock) => (
                <div 
                  key={stock.symbol} 
                  onClick={() => router.push(`/stocks/${stock.symbol.toLowerCase()}`)}
                  className="bg-[#0A0A0B] hover:bg-[#0F0F0F] transition-all rounded-[24px] p-6 border border-zinc-900 hover:border-zinc-800 group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-xl group-hover:scale-110 transition-transform">
                      <CompanyLogo 
                        src={stock.image} 
                        name={stock.company} 
                        symbol={stock.symbol} 
                      />
                    </div>
                    <div>
                      <div className="font-black tracking-tight text-white">{stock.symbol}</div>
                      <div className="text-[10px] text-zinc-600 font-bold uppercase truncate w-24 tracking-widest">{stock.company}</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-black font-mono tracking-tighter">{stock.price}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-positive shadow-[0_0_8px_rgba(15,237,190,0.6)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Score: {stock.alphaScore}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-black font-mono px-3 py-1 rounded-xl",
                      stock.isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                    )}>
                      {stock.change}
                    </div>
                  </div>
                </div>
              ))}
              {initialWatchlist.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-[24px]">
                  <p className="text-zinc-600 italic">No assets detected in monitor pool.</p>
                  <button 
                    onClick={() => router.push('/search')}
                    className="mt-4 text-[10px] font-black text-white bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-all"
                  >
                    DEPLOY MONITOR
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* C. Today's Top Stocks (Bottom Left) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-800 p-8 flex flex-col gap-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Sector Leaders</h2>
              <button 
                onClick={() => router.push('/search')}
                className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-all"
              >
                Market Map
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
                    <th className="pb-6">Asset</th>
                    <th className="pb-6 text-right">Price</th>
                    <th className="pb-6 text-right">Delta</th>
                    <th className="pb-6 text-right">Cap</th>
                    <th className="pb-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {initialTopStocks.map((stock) => (
                    <tr key={stock.symbol} className="group hover:bg-[#0A0A0B] transition-all cursor-pointer" onClick={() => router.push(`/stocks/${stock.symbol.toLowerCase()}`)}>
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <CompanyLogo 
                            src={stock.image} 
                            name={stock.company} 
                            symbol={stock.symbol} 
                            size="sm"
                          />
                          <div className="flex flex-col">
                            <span className="font-black text-sm tracking-tight">{stock.symbol}</span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter truncate w-24">{stock.company}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-right font-black font-mono">${stock.price.toFixed(2)}</td>
                      <td className="py-5 text-right">
                        <span className={cn(
                          "font-black font-mono text-xs px-2 py-0.5 rounded-lg",
                          stock.isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                        )}>
                          {stock.isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-5 text-right text-zinc-600 text-[10px] font-black font-mono">
                        {stock.marketCap > 1000 ? (stock.marketCap / 1000).toFixed(1) + 'T' : stock.marketCap.toFixed(1) + 'B'}
                      </td>
                      <td className="py-5 text-center">
                        <div className="flex justify-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWatchlist(stock);
                            }}
                            disabled={pendingSymbol === stock.symbol || watchlistSymbols.has(String(stock.symbol).toUpperCase())}
                            className="w-8 h-8 rounded-full border border-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* D. Today's Financial News (Bottom Right) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-800 p-8 flex flex-col gap-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Intelligence Stream</h2>
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-600" />
              </div>
            </div>

            <div className="flex gap-2">
              {newsTabs.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveNewsTab(tab)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    tab === activeNewsTab ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-8 mt-2 overflow-y-auto max-h-[450px] pr-2 scrollbar-hide">
              {visibleNews.map((article, i) => (
                <div key={i} className="flex gap-6 group cursor-pointer" onClick={() => window.open(article.url, '_blank')}>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                      <span className="text-zinc-400">{article.source}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span>{formatTimeAgo(article.datetime)}</span>
                    </div>
                    <h3 className="font-black leading-relaxed group-hover:text-positive transition-all line-clamp-2 text-sm tracking-tight">
                      {article.headline}
                    </h3>
                    {article.related && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800 group-hover:border-positive/50 transition-colors">
                          {article.related}
                        </span>
                      </div>
                    )}
                  </div>
                  {article.image && (
                    <div className="w-24 h-24 rounded-[20px] overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-900 group-hover:border-zinc-700 transition-all">
                      <img 
                        src={article.image} 
                        alt="" 
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100" 
                      />
                    </div>
                  )}
                </div>
              ))}
              {visibleNews.length === 0 && (
                <div className="py-12 text-center text-sm text-zinc-600 italic">
                  No stories available for this feed.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

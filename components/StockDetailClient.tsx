"use client";

import React, { useState } from 'react';
import { 
  Star, 
  Clock,
  ExternalLink,
  ChevronRight,
  Bell,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { cn, formatTimeAgo, formatMarketCapValue } from "@/lib/utils";
import CompanyLogo from './ui/CompanyLogo';
import Link from 'next/link';
import PriceAlertModal from './PriceAlertModal';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import Image from 'next/image';

interface StockDetailClientProps {
  symbol: string;
  quote: QuoteData;
  profile: ProfileData;
  financials: FinancialsData;
  news: MarketNewsArticle[];
  peers: PeerStockData[];
  recommendation: RecommendationData[];
  user: User;
  isInWatchlist: boolean;
}

const StockDetailClient = ({
  symbol,
  quote,
  profile,
  financials,
  news,
  peers,
  recommendation,
  user,
  isInWatchlist
}: StockDetailClientProps) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [watchlistState, setWatchlistState] = useState(isInWatchlist);
  const [isWatchlistPending, setIsWatchlistPending] = useState(false);
  const timeframes = ['1D', '5D', '1M', '1Y', '5Y', 'All'];

  // Calculate recommendation label
  const latestRec = (recommendation?.[0] || {}) as RecommendationData;
  const getRecommendationLabel = () => {
    const { strongBuy, buy, hold, sell, strongSell } = latestRec;
    if (!strongBuy && !buy && !hold && !sell && !strongSell) return "Neutral";
    const values = { strongBuy, buy, hold, sell, strongSell };
    const maxKey = Object.keys(values).reduce((a, b) => values[a as keyof typeof values] > values[b as keyof typeof values] ? a : b);
    
    const labels: Record<string, string> = {
      strongBuy: "Strong Buy",
      buy: "Buy",
      hold: "Hold",
      sell: "Sell",
      strongSell: "Strong Sell"
    };
    
    return labels[maxKey] || "Neutral";
  };

  const recLabel = getRecommendationLabel();

  const handleWatchlistToggle = async () => {
    if (!user?.email || isWatchlistPending) {
      return;
    }

    try {
      setIsWatchlistPending(true);

      if (watchlistState) {
        await removeFromWatchlist({ email: user.email, symbol });
        setWatchlistState(false);
        toast.success(`${symbol} removed from your watchlist`);
      } else {
        await addToWatchlist({
          email: user.email,
          symbol,
          company: profile.name || symbol,
        });
        setWatchlistState(true);
        toast.success(`${symbol} added to your watchlist`);
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
      console.error(error);
    } finally {
      setIsWatchlistPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Top Row: Chart & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* A. Main Chart Section (Top Left - Spans 3 columns) */}
          <section className="lg:col-span-3 bg-[#111111] rounded-[32px] border border-zinc-900 p-8 flex flex-col gap-6 relative overflow-hidden">
            {/* Header Top */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-zinc-900 rounded-[20px] flex items-center justify-center border border-zinc-800 shadow-xl">
                  <CompanyLogo 
                    src={profile.logo} 
                    name={profile.name} 
                    symbol={symbol} 
                    size="md"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name || symbol}</h1>
                    <div className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                      {symbol}
                    </div>
                    <button
                      type="button"
                      onClick={handleWatchlistToggle}
                      disabled={isWatchlistPending}
                      className="rounded-full p-1 text-zinc-700 transition-all hover:text-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={watchlistState ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                    >
                      <Star className={cn("w-4 h-4", watchlistState && "fill-yellow-400 text-yellow-400")} />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-4 mt-2">
                    <span className="text-4xl font-black tracking-tighter text-white">${quote.c?.toFixed(2)}</span>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-bold",
                      (quote.dp ?? 0) >= 0 ? "text-positive" : "text-negative"
                    )}>
                      {(quote.dp ?? 0) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {quote.d?.toFixed(2)} ({quote.dp?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeframe toggle */}
              <div className="flex bg-[#0A0A0A] border border-zinc-900 rounded-2xl p-1.5 self-start shadow-inner">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      timeframe === tf ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Actual Chart Area */}
            <div className="flex-1 rounded-[24px] overflow-hidden border border-zinc-900 shadow-2xl bg-zinc-950/50 mt-4 min-h-[500px]">
              <TradingViewWidget 
                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                height={500}
                config={{
                  "symbol": symbol,
                  "interval": timeframe === '1D' ? "5" : timeframe === '5D' ? "30" : "D",
                  "timezone": "Etc/UTC",
                  "theme": "dark",
                  "style": "1",
                  "locale": "en",
                  "enable_publishing": false,
                  "hide_top_toolbar": false,
                  "hide_legend": false,
                  "save_image": false,
                  "container_id": "tradingview_detail_chart",
                  "backgroundColor": "#111111",
                  "gridColor": "rgba(255, 255, 255, 0.05)",
                  "hide_side_toolbar": false,
                  "details": false,
                  "hotlist": false,
                  "calendar": false,
                  "show_popup_button": false,
                  "width": "100%",
                  "height": 500
                }}
              />
            </div>
          </section>

          {/* B. Overview Card (Top Right) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-900 p-8 space-y-8 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Market Intel</h2>
              <button 
                onClick={() => setIsAlertModalOpen(true)}
                className="bg-[#fcd34d] hover:bg-[#fbbf24] text-black w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-[#fcd34d]/10"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0B] border border-zinc-900 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Day Open</span>
                  <div className="text-lg font-bold font-mono">${(quote.o ?? 0).toFixed(2)}</div>
                </div>
                <div className="bg-[#0A0A0B] border border-zinc-900 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Prev Close</span>
                  <div className="text-lg font-bold font-mono">${(quote.pc ?? 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Day High</span>
                  <span className="text-sm font-bold text-positive font-mono">${(quote.h ?? 0).toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                   <div 
                    className="absolute h-full bg-gradient-to-r from-negative via-yellow-500 to-positive transition-all duration-1000"
                    style={{ 
                      left: 0, 
                      width: `${(((quote.c ?? 0) - (quote.l ?? 0)) / (Math.max(1, (quote.h ?? 0) - (quote.l ?? 0)))) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Day Low</span>
                  <span className="text-sm font-bold text-negative font-mono">${(quote.l ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-zinc-900 mx-[-32px]" />

              <div className="space-y-4">
                {[
                  { label: 'Market Cap', value: formatMarketCapValue(profile.marketCapitalization || 0), color: 'bg-blue-500' },
                  { label: 'P/E Ratio', value: financials.metric?.peExclExtraTTM?.toFixed(2) || 'N/A', color: 'bg-orange-500' },
                  { label: 'EPS (TTM)', value: financials.metric?.epsExclExtraItemsTTM?.toFixed(2) || 'N/A', color: 'bg-yellow-400' },
                  { label: 'Dividend', value: financials.metric?.dividendYieldIndicatedAnnual ? (financials.metric?.dividendYieldIndicatedAnnual as number).toFixed(2) + '%' : '0.00%', color: 'bg-cyan-500' }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-default">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-150", stat.color)} />
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold font-mono">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Analyst Consensus</span>
                  <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{recLabel}</span>
                  <span className="text-xs font-bold text-zinc-600">Based on 40+ targets</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Company Profile */}
          <div className="space-y-6">
            <div className="bg-[#111111] rounded-[32px] border border-zinc-900 p-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight">Corporate DNA</h2>
              <div className="space-y-4">
                {[
                  { label: 'IPO Date', value: profile.ipo },
                  { label: 'Headquarters', value: profile.country },
                  { label: 'Float', value: profile.shareOutstanding ? profile.shareOutstanding.toFixed(2) + 'M' : 'N/A' },
                  { label: 'Workforce', value: financials.metric?.['totalEmployees'] ? Number(financials.metric?.['totalEmployees']).toLocaleString() : 'N/A' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-900 last:border-0">
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold">{item.value || 'N/A'}</span>
                  </div>
                ))}
                <div className="pt-2">
                   <a 
                    href={profile.weburl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between group p-4 bg-[#0A0A0A] border border-zinc-900 rounded-2xl hover:border-[#fcd34d]/50 transition-all"
                  >
                    <span className="text-xs font-bold text-zinc-500">Official Portal</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#fcd34d] group-hover:underline">Visit Site</span>
                      <ExternalLink className="w-3 h-3 text-[#fcd34d]" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Intelligence Stream (News) */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-900 p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Intelligence Stream</h2>
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
            
            <div className="space-y-8 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
              {news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                   <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-zinc-700" />
                   </div>
                   <p className="text-zinc-600 text-sm italic font-medium">No active intelligence streams detected.</p>
                </div>
              ) : (
                news.map((article, i) => (
                  <div key={i} className="group cursor-pointer flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.15em]">
                        <span className="text-zinc-400">{article.source}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{formatTimeAgo(article.datetime)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-relaxed group-hover:text-positive transition-colors line-clamp-2">
                        {article.headline}
                      </h3>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black text-zinc-500 hover:text-white transition-colors"
                      >
                        DECRYPT FULL BRIEF <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>
                    {article.image && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800 relative">
                        <Image 
                          src={article.image} 
                          alt="" 
                          fill
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100" 
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Column 3: Peer Network */}
          <section className="bg-[#111111] rounded-[32px] border border-zinc-900 p-8 flex flex-col gap-8">
             <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Peer Network</h2>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">Cluster Analysis</span>
            </div>

            <div className="space-y-6">
              {peers.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">No correlated peers identified in this sector.</p>
              ) : (
                peers.map((peer, i) => (
                  <Link href={`/stocks/${peer.symbol}`} key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-zinc-900/50 transition-all border border-transparent hover:border-zinc-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
                        <CompanyLogo 
                          src={peer.profile?.logo} 
                          name={peer.profile?.name} 
                          symbol={peer.symbol} 
                          size="sm"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter mb-0.5">{peer.symbol}</div>
                        <div className="text-sm font-bold text-white group-hover:text-positive transition-colors truncate w-32">
                          {peer.profile?.name || peer.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">${peer.quote?.c?.toFixed(2) || '0.00'}</div>
                      <div className={cn(
                        "text-[10px] font-black font-mono",
                        (peer.quote?.dp ?? 0) >= 0 ? "text-positive" : "text-negative"
                      )}>
                        {(peer.quote?.dp ?? 0) >= 0 ? '+' : ''}{(peer.quote?.dp ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>
      </div>

      <PriceAlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        stockName={profile.name}
        stockSymbol={symbol}
        userEmail={user.email}
      />
    </div>
  );
};

export default StockDetailClient;

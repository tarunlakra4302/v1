"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import CompanyLogo from "./ui/CompanyLogo";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { addToWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SearchPageClientProps {
  initialStocks: StockWithWatchlistStatus[];
  user: any;
  initialWatchlistSymbols: string[];
}

export default function SearchPageClient({ initialStocks, user, initialWatchlistSymbols }: SearchPageClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const [watchlistSymbols, setWatchlistSymbols] = useState(new Set(initialWatchlistSymbols.map(s => s.toUpperCase())));
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);

  const isSearchMode = query.trim().length > 0;
  const visibleStocks = isSearchMode ? stocks : initialStocks;

  const runSearch = async () => {
    if (!isSearchMode) {
      setStocks(initialStocks);
      return;
    }

    setLoading(true);
    try {
      const results = await searchStocks(query.trim());
      setStocks(results);
    } catch (error) {
      console.error("searchStocks error:", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(runSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch, query]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Search Markets</h1>
          <p className="text-sm text-zinc-500">
            Find equities and open the detailed terminal view for each symbol.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by symbol or company"
            className="h-16 w-full rounded-[24px] border border-zinc-800 bg-[#111111] pl-14 pr-14 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-600"
          />
          {loading && <Loader2 className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-zinc-500" />}
        </div>

        <div className="grid gap-4">
          {visibleStocks.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-zinc-800 bg-[#0A0A0A] p-12 text-center text-zinc-500">
              No matching symbols found.
            </div>
          ) : (
            visibleStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-[28px] border border-zinc-900 bg-[#0A0A0A] p-5 transition-all hover:border-zinc-700 hover:bg-[#0F0F0F] group"
              >
                <Link
                  href={`/stocks/${stock.symbol.toLowerCase()}`}
                  className="flex items-center gap-4 flex-1"
                >
                  <CompanyLogo symbol={stock.symbol} name={stock.name} size="sm" />
                  <div>
                    <div className="font-bold tracking-tight text-white">{stock.symbol}</div>
                    <div className="text-sm text-zinc-500">{stock.name}</div>
                  </div>
                </Link>

                <div className="flex items-center gap-6">
                  <div className="text-right text-xs uppercase tracking-widest text-zinc-500 hidden sm:block">
                    <div>{stock.exchange}</div>
                    <div className="mt-1">{stock.type}</div>
                  </div>
                  
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const symbol = stock.symbol.toUpperCase();
                      if (watchlistSymbols.has(symbol)) {
                        toast.message(`${symbol} is already in your watchlist`);
                        return;
                      }

                      try {
                        setPendingSymbol(symbol);
                        await addToWatchlist({
                          email: user.email,
                          symbol: symbol,
                          company: stock.name || symbol
                        });
                        setWatchlistSymbols(prev => new Set(prev).add(symbol));
                        toast.success(`${symbol} added to watchlist`);
                        router.refresh();
                      } catch (err) {
                        toast.error("Failed to add to watchlist");
                      } finally {
                        setPendingSymbol(null);
                      }
                    }}
                    disabled={pendingSymbol === stock.symbol.toUpperCase() || watchlistSymbols.has(stock.symbol.toUpperCase())}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
                      watchlistSymbols.has(stock.symbol.toUpperCase())
                        ? "bg-positive/10 border-positive/20 text-positive cursor-default"
                        : "border-zinc-800 text-zinc-500 hover:bg-white hover:text-black hover:border-white active:scale-90"
                    )}
                  >
                    {pendingSymbol === stock.symbol.toUpperCase() ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : watchlistSymbols.has(stock.symbol.toUpperCase()) ? (
                      <Plus className="w-4 h-4 rotate-45" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

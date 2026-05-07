"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";
import CompanyLogo from "./ui/CompanyLogo";
import { addToWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus as PlusIcon } from "lucide-react";

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks, user, initialWatchlistSymbols }: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const [watchlistSymbols, setWatchlistSymbols] = useState(new Set(initialWatchlistSymbols?.map(s => s.toUpperCase()) || []));
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleSearch = async () => {
    if(!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try {
        const results = await searchStocks(searchTerm.trim());
        setStocks(results);
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  }

  return (
    <>
      {renderAs === 'text' ? (
          <span onClick={() => setOpen(true)} className="search-text">
            {label}
          </span>
      ): (
          <Button onClick={() => setOpen(true)} className="search-btn">
            {label}
          </Button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
        <div className="search-field">
          <CommandInput value={searchTerm} onValueChange={setSearchTerm} placeholder="Search stocks..." className="search-input" />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
              <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
              <div className="search-list-indicator">
                {isSearchMode ? 'No results found' : 'No stocks available'}
              </div>
            ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? 'Search results' : 'Popular stocks'}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock) => (
                  <li key={stock.symbol} className="search-item group">
                    <div className="flex items-center justify-between w-full p-2 hover:bg-zinc-900 rounded-xl transition-all">
                      <Link
                          href={`/stocks/${stock.symbol}`}
                          onClick={handleSelectStock}
                          className="flex items-center gap-3 flex-1"
                      >
                        <CompanyLogo 
                          symbol={stock.symbol} 
                          name={stock.name} 
                          size="sm" 
                          className="rounded-full"
                        />
                        <div  className="flex-1">
                          <div className="search-item-name">
                            {stock.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {stock.symbol} | {stock.exchange }
                          </div>
                        </div>
                      </Link>
                      
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!user?.email) {
                            toast.error("Sign in to update watchlist");
                            return;
                          }

                          const symbol = stock.symbol.toUpperCase();
                          if (watchlistSymbols.has(symbol)) return;

                          try {
                            setPendingSymbol(symbol);
                            await addToWatchlist({
                              email: user.email,
                              symbol: symbol,
                              company: stock.name || symbol
                            });
                            setWatchlistSymbols(prev => new Set(prev).add(symbol));
                            toast.success(`${symbol} added`);
                            router.refresh();
                          } catch {
                            toast.error("Error adding stock");
                          } finally {
                            setPendingSymbol(null);
                          }
                        }}
                        disabled={pendingSymbol === stock.symbol.toUpperCase() || watchlistSymbols.has(stock.symbol.toUpperCase())}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                          watchlistSymbols.has(stock.symbol.toUpperCase())
                            ? "bg-positive/10 border-positive/20 text-positive"
                            : "border-zinc-800 text-zinc-500 hover:bg-white hover:text-black hover:border-white"
                        )}
                      >
                        {pendingSymbol === stock.symbol.toUpperCase() ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : watchlistSymbols.has(stock.symbol.toUpperCase()) ? (
                          <PlusIcon className="w-3 h-3 rotate-45" />
                        ) : (
                          <PlusIcon className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </li>
              ))}
            </ul>
          )
          }
        </CommandList>
      </CommandDialog>
    </>
  )
}

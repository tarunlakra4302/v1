'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';
import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  
  if (res.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error('FINNHUB API key is not configured');
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error('Error fetching company news for', sym, e);
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to 6 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break; // cap early before final slicing
    }

    const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
  } catch (err) {
    console.error('getNews error:', err);
    throw new Error('Failed to fetch news');
  }
}

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      // If no token, log and return empty to avoid throwing per requirements
      console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim() : '';

    let results: FinnhubSearchResult[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
            // Revalidate every hour
            const profile = await fetchJSON<ProfileData>(url, 3600);
            return { sym, profile };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name: string | undefined = profile?.name || profile?.ticker || undefined;
          const exchange: string | undefined = profile?.exchange || undefined;
          if (!name) return undefined;
          const r: FinnhubSearchResult = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
          };
          // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
          // To keep pipeline simple, attach exchange via closure map stage
          // We'll reconstruct exchange when mapping to final type
          (r as unknown as { __exchange?: string }).__exchange = exchange; // internal only
          return r;
        })
        .filter((x): x is FinnhubSearchResult => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = (r as unknown as { __exchange?: string }).__exchange;
        const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
        const type = r.type || 'Stock';
        const item: StockWithWatchlistStatus = {
          symbol: upper,
          name,
          exchange,
          type,
          isInWatchlist: false,
        };
        return item;
      })
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
});

export async function getQuote(symbol: string): Promise<QuoteData> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${token}`;
    return await fetchJSON<QuoteData>(url, 15); // Cache for 15 seconds to stay within free tier limits while feeling real-time
  } catch (e) {
    console.error('getQuote error:', e);
    return {};
  }
}

export async function getStockProfile(symbol: string): Promise<ProfileData> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol.toUpperCase()}&token=${token}`;
    return await fetchJSON<ProfileData>(url, 3600); // Cache for 1 hour
  } catch (e) {
    console.error('getStockProfile error:', e);
    return {};
  }
}

export async function getBasicFinancials(symbol: string): Promise<FinancialsData> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol.toUpperCase()}&metric=all&token=${token}`;
    return await fetchJSON<FinancialsData>(url, 3600);
  } catch (e) {
    console.error('getBasicFinancials error:', e);
    return {};
  }
}

export async function getPeers(symbol: string): Promise<string[]> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/stock/peers?symbol=${symbol.toUpperCase()}&token=${token}`;
    return await fetchJSON<string[]>(url, 86400); // Peers don't change often
  } catch (e) {
    console.error('getPeers error:', e);
    return [];
  }
}

export async function getRecommendation(symbol: string): Promise<RecommendationData[]> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/stock/recommendation?symbol=${symbol.toUpperCase()}&token=${token}`;
    return await fetchJSON<RecommendationData[]>(url, 3600);
  } catch (e) {
    console.error('getRecommendation error:', e);
    return [];
  }
}

export type SentimentData = {
  buzz?: {
    articlesInLastWeek?: number;
    buzz?: number;
    weeklyAverage?: number;
  };
  sentiment?: {
    bullishPercent?: number;
    bearishPercent?: number;
  };
};

export async function getSentiment(symbol: string): Promise<SentimentData> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/news-sentiment?symbol=${symbol.toUpperCase()}&token=${token}`;
    return await fetchJSON<SentimentData>(url, 3600);
  } catch (e: unknown) {
    const err = e as Error;
    // news-sentiment is a premium endpoint. Gracefully handle 403 for free tier users.
    if (err.message?.includes('403')) {
      return { buzz: { buzz: 0.5 }, sentiment: { bullishPercent: 0.5 } };
    }
    console.error('getSentiment error:', err);
    return {};
  }
}

export async function getStockCandles(symbol: string, resolution: string = 'D', days: number = 30): Promise<ChartPoint[]> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol.toUpperCase()}&resolution=${resolution}&from=${from}&to=${to}&token=${token}`;
    const data = await fetchJSON<{ s: string; c: number[]; t: number[]; o: number[]; h: number[]; l: number[] }>(url, 60); // Cache for 1 minute for better real-time charts
    
    if (data.s !== 'ok') return [];
    
    // Transform to Recharts format with OHLC data
    return data.c.map((price: number, idx: number) => ({
      time: new Date(data.t[idx] * 1000).toLocaleDateString(),
      timestamp: data.t[idx],
      open: data.o[idx],
      high: data.h[idx],
      low: data.l[idx],
      close: data.c[idx],
      price: price // Still keep price for simple line charts
    }));
  } catch (e: unknown) {
    const err = e as Error;
    // Gracefully handle 403 Forbidden (common for free tier keys on certain symbols or resolutions)
    if (err.message?.includes('403')) {
      return [];
    }
    console.error('getStockCandles error:', err);
    return [];
  }
}

export async function getMarketIndices(): Promise<IndexData[]> {
  const indices = [
    { symbol: 'SPY', name: 'S&P 500' },
    { symbol: 'QQQ', name: 'Nasdaq 100' },
    { symbol: 'DIA', name: 'Dow 30' }
  ];

  try {
    const results = await Promise.all(
      indices.map(async (idx) => {
        const quote = await getQuote(idx.symbol);
        return {
          name: idx.name,
          symbol: idx.symbol,
          price: quote.c || 0,
          change: quote.dp || 0,
          isPositive: (quote.dp || 0) >= 0
        };
      })
    );
    return results;
  } catch (e) {
    console.error('getMarketIndices error:', e);
    return [];
  }
}

export async function getTopStocks(): Promise<TopStockData[]> {
  // Use a subset of popular symbols to find top gainers
  const pool = POPULAR_STOCK_SYMBOLS.slice(0, 15);
  
  try {
    const stocks = await Promise.all(
      pool.map(async (symbol) => {
        const [quote, profile, financials] = await Promise.all([
          getQuote(symbol),
          getStockProfile(symbol),
          getBasicFinancials(symbol)
        ]);

        return {
          company: profile.name || symbol,
          symbol: symbol.toUpperCase(),
          price: quote.c || 0,
          change: quote.dp || 0,
          isPositive: (quote.dp || 0) >= 0,
          marketCap: profile.marketCapitalization || 0,
          peRatio: financials.metric?.peExclExtraTTM || 0,
          image: profile.logo
        };
      })
    );

    // Sort by change percentage desc and take top 5
    return stocks.sort((a, b) => b.change - a.change).slice(0, 5);
  } catch (e) {
    console.error('getTopStocks error:', e);
    return [];
  }
}


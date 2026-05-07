import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price?: number) => {
  if (price === undefined) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatMarketCapValue = (value?: number) => {
  if (!value) return "N/A";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}T`;
  }
  return `${value.toFixed(1)}B`;
};

export const getFormattedTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatTimeAgo = (timestamp?: number) => {
  if (!timestamp) return "";
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};



export const getDateRange = (days: number) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
};

export const validateArticle = (art: RawNewsArticle) => {
  return art.headline && art.url && art.datetime;
};

export const formatArticle = (art: RawNewsArticle, hasTicker: boolean, ticker: string | undefined, idx: number): MarketNewsArticle => {
  return {
    id: art.id || idx,
    headline: art.headline || "",
    summary: art.summary || "",
    source: art.source || "",
    url: art.url || "",
    datetime: art.datetime || 0,
    category: art.category || "",
    related: art.related || "",
    image: art.image,
  };
};

export const formatChangePercent = (changePercent?: number) => {
  if (changePercent === undefined) return "0.00%";
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
};

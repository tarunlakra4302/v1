import StockDetailClient from "@/components/StockDetailClient";
import { 
  getQuote, 
  getStockProfile, 
  getBasicFinancials, 
  getNews, 
  getPeers,
  getRecommendation
} from "@/lib/actions/finnhub.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

interface StockDetailsPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: StockDetailsPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  return {
    title: `${upperSymbol} Stock Detail | Inertia`,
    description: `Real-time stock data, charts, and news for ${upperSymbol}.`,
  };
}

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  const watchlistSymbols = await getWatchlistSymbolsByEmail(session.user.email);

  // Parallel data fetching
  const [
    quote,
    profile,
    financials,
    news,
    peerSymbols,
    recommendation
  ] = await Promise.all([
    getQuote(upperSymbol),
    getStockProfile(upperSymbol),
    getBasicFinancials(upperSymbol),
    getNews([upperSymbol]),
    getPeers(upperSymbol),
    getRecommendation(upperSymbol)
  ]);

  // Fetch details for peers (limited to top 6)
  const peers = await Promise.all(
    (peerSymbols || []).slice(0, 6).map(async (p) => {
      try {
        const [pQuote, pProfile] = await Promise.all([
          getQuote(p),
          getStockProfile(p)
        ]);
        return {
          symbol: p,
          quote: pQuote,
          profile: pProfile
        };
      } catch (e) {
        console.error(`Error fetching peer ${p}:`, e);
        return null;
      }
    })
  ).then(results => results.filter(r => r !== null));

  return (
    <StockDetailClient 
      symbol={upperSymbol}
      quote={quote}
      profile={profile}
      financials={financials}
      news={news}
      peers={peers}
      recommendation={recommendation}
      user={session.user}
      isInWatchlist={watchlistSymbols.includes(upperSymbol)}
    />
  );
}

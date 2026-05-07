export const dynamic = "force-dynamic"; // Trigger HMR

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { 
  getQuote, 
  getStockProfile, 
  getBasicFinancials, 
  getNews, 
  getTopStocks,
  getMarketIndices,
  getSentiment
} from "@/lib/actions/finnhub.actions";
import { formatPrice, formatChangePercent, formatMarketCapValue } from "@/lib/utils";
import DashboardOverview from "@/components/DashboardOverview";

// Inertia Core Imports
import { GenerateAlphaSignal } from "@/src/core/use-cases/GenerateAlphaSignal";
import { RiskEngine } from "@/src/core/services/RiskEngine";

export default async function Home() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const symbols = await getWatchlistSymbolsByEmail(session.user.email);
  
  const alphaOrchestrator = new GenerateAlphaSignal();

  // Fetch data for each symbol in the watchlist
  const watchlistData = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [quote, profile, financials] = await Promise.all([
          getQuote(symbol),
          getStockProfile(symbol),
          getBasicFinancials(symbol)
        ]);

        const sentimentData = await getSentiment(symbol);
        const sentimentScore = sentimentData?.sentiment?.bullishPercent !== undefined 
          ? sentimentData.sentiment.bullishPercent * 100 
          : 50;

        // Inertia: Calculate Alpha Score
        const alphaReport = await alphaOrchestrator.execute(symbol, {
          sentiment: sentimentScore, 
          technical: (quote.dp || 0) + 50, // Relative strength proxy
          macro: 75 // Market trend proxy
        });

        return {
          company: profile.name || symbol,
          symbol: symbol.toUpperCase(),
          price: formatPrice(quote.c || 0),
          change: formatChangePercent(quote.dp || 0),
          isPositive: (quote.dp || 0) >= 0,
          marketCap: formatMarketCapValue(profile.marketCapitalization || 0),
          peRatio: financials.metric?.peExclExtraTTM?.toFixed(1) || "N/A",
          image: profile.logo,
          // Inertia Additions
          alphaScore: alphaReport.aggregateScore,
          volatility: (financials.metric?.['3MonthPriceReturnDaily'] as number) || 0.02 // Proxy for volatility
        };
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
        return {
          company: symbol,
          symbol: symbol.toUpperCase(),
          price: "N/A",
          change: "N/A",
          isPositive: true,
          marketCap: "N/A",
          peRatio: "N/A",
          image: "",
          alphaScore: 0,
          volatility: 0
        };
      }
    })
  );

  // Inertia: Calculate Portfolio Risk (VaR)
  const portfolioPositions = watchlistData
    .filter(s => s.price !== "N/A")
    .map(s => ({
      value: parseFloat(s.price.replace(/[^0-9.-]+/g, "")),
      volatility: s.volatility
    }));

  const portfolioRisk = {
    var: portfolioPositions.length > 0 ? RiskEngine.calculateVaR(portfolioPositions) : 0,
    sharpeRatio: RiskEngine.calculateSharpeRatio(0.12, 0.04, 0.15), // Example market-wide sharpe
    alphaCoverage: watchlistData.length > 0 
      ? Math.round((watchlistData.filter(s => s.alphaScore > 50).length / watchlistData.length) * 100) 
      : 0,
    signalVelocity: portfolioPositions.length > 0 
      ? (portfolioPositions.reduce((sum, p) => sum + p.volatility, 0) / portfolioPositions.length > 0.03 ? "High" : "Medium")
      : "Low"
  };

  // Fetch real news based on watchlist symbols or general market news
  const news = await getNews(symbols.length > 0 ? symbols : undefined);

  // Fetch new dashboard data in parallel
  const [indices, topStocks] = await Promise.all([
    getMarketIndices(),
    getTopStocks()
  ]);

  return (
    <DashboardOverview 
      initialWatchlist={watchlistData} 
      initialNews={news}
      initialIndices={indices}
      initialTopStocks={topStocks}
      user={session.user}
      // Inertia Additions
      portfolioRisk={portfolioRisk}
    />
  );
}

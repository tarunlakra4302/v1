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

  // Fetch market indices and top stocks in parallel
  const [indices, topStocks] = await Promise.all([
    getMarketIndices(),
    getTopStocks()
  ]);

  // Calculate real-world macro score based on index performance
  // Average of SPY, QQQ, DIA daily change, mapped to 0-100 scale (0% change = 50 score)
  const avgIndexChange = indices.length > 0 
    ? indices.reduce((sum, idx) => sum + idx.change, 0) / indices.length 
    : 0;
  const macroScore = Math.min(100, Math.max(0, 50 + (avgIndexChange * 10)));

  // Fetch real news based on watchlist symbols or general market news
  const news = await getNews(symbols.length > 0 ? symbols : undefined);

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

        // Use real volatility from beta if available, fallback to 3-month return
        const beta = (financials.metric?.beta as number) || 1.0;
        const volatility = Math.abs((financials.metric?.['3MonthPriceReturnDaily'] as number) || 0.02);

        // Inertia: Calculate Alpha Score with real-world inputs
        const alphaReport = await alphaOrchestrator.execute(symbol, {
          sentiment: sentimentScore, 
          technical: 50 + ((quote.dp || 0) * 5), // Scaled daily momentum
          macro: macroScore
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
          alphaScore: alphaReport.aggregateScore,
          volatility: volatility || (beta * 0.02)
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
          volatility: 0.02
        };
      }
    })
  );

  // Inertia: Calculate Portfolio Risk (VaR)
  const portfolioPositions = watchlistData
    .filter(s => s.price !== "N/A")
    .map(s => ({
      value: parseFloat(s.price.replace(/[^0-9.-]+/g, "")),
      volatility: s.volatility || 0.02
    }));

  const avgWatchlistReturn = watchlistData.length > 0
    ? watchlistData.reduce((sum, s) => sum + (parseFloat(s.change) || 0), 0) / watchlistData.length
    : 0.10; // Fallback to 10% expected return if empty

  const portfolioRisk = {
    var: portfolioPositions.length > 0 ? RiskEngine.calculateVaR(portfolioPositions) : 0,
    // Calculate real Sharpe Ratio: (Expected Return - Risk Free Rate) / Volatility
    sharpeRatio: RiskEngine.calculateSharpeRatio(
      avgWatchlistReturn / 100, 
      0.04, 
      portfolioPositions.length > 0 ? portfolioPositions.reduce((sum, p) => sum + p.volatility, 0) / portfolioPositions.length : 0.15
    ),
    alphaCoverage: watchlistData.length > 0 
      ? Math.round((watchlistData.filter(s => s.alphaScore > 50).length / watchlistData.length) * 100) 
      : 0,
    signalVelocity: portfolioPositions.length > 0 
      ? (portfolioPositions.reduce((sum, p) => sum + p.volatility, 0) / portfolioPositions.length > 0.03 ? "High" : "Medium")
      : "Low"
  };

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

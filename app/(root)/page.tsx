import { auth } from "@/lib/better-auth/auth";
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

// QuantFlow Core Imports
import { GenerateAlphaSignal } from "@/src/core/use-cases/GenerateAlphaSignal";
import { RiskEngine } from "@/src/core/services/RiskEngine";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const symbols = await getWatchlistSymbolsByEmail(session.user.email);
  
  const alphaOrchestrator = new GenerateAlphaSignal();

  // Fetch indices for macro context
  const indices = await getMarketIndices();
  const spyIndex = indices.find(i => i.symbol === 'SPY');
  const macroScore = spyIndex ? (spyIndex.change + 1) * 50 : 75; // Map -1% to 1% to 0-100

  // Fetch data for each symbol in the watchlist
  const watchlistData = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [quote, profile, financials, sentimentData] = await Promise.all([
          getQuote(symbol),
          getStockProfile(symbol),
          getBasicFinancials(symbol),
          getSentiment(symbol)
        ]);

        // Map sentiment to 0-100
        const sentimentScore = (sentimentData?.sentiment?.bullishPercent || 0.5) * 100;

        // QuantFlow: Calculate Alpha Score
        const alphaReport = await alphaOrchestrator.execute(symbol, {
          sentiment: sentimentScore,
          technical: (quote.dp || 0) + 50, // Relative strength proxy
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
          // QuantFlow Additions
          alphaScore: alphaReport.aggregateScore,
          volatility: typeof financials.metric?.['3MonthPriceReturnDaily'] === 'number' ? financials.metric['3MonthPriceReturnDaily'] : 0.02
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

  // QuantFlow: Calculate Portfolio Risk (VaR)
  const portfolioPositions = watchlistData
    .filter(s => s.price !== "N/A")
    .map(s => ({
      value: parseFloat(s.price.replace(/[^0-9.-]+/g, "")),
      volatility: s.volatility
    }));

  const portfolioRisk = {
    var: portfolioPositions.length > 0 ? RiskEngine.calculateVaR(portfolioPositions) : 0,
    sharpeRatio: RiskEngine.calculateSharpeRatio(0.12, 0.04, 0.15) // Example market-wide sharpe
  };

  // Fetch real news based on watchlist symbols or general market news
  const news = await getNews(symbols.length > 0 ? symbols : undefined);

  // Fetch top stocks (indices already fetched above)
  const topStocks = await getTopStocks();

  return (
    <DashboardOverview 
      initialWatchlist={watchlistData} 
      initialNews={news}
      initialIndices={indices}
      initialTopStocks={topStocks}
      user={session.user}
      // QuantFlow Additions
      portfolioRisk={portfolioRisk}
    />
  );
}

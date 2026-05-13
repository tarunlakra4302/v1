import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getQuote, getStockProfile, getBasicFinancials, getNews } from "@/lib/actions/finnhub.actions";
import { formatPrice, formatChangePercent, formatMarketCapValue } from "@/lib/utils";
import { getAlertsByEmail } from "@/lib/actions/alert.actions";
import InertiaDashboardClient from "@/components/InertiaDashboardClient";

export default async function WatchlistPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if(!session?.user) redirect('/sign-in');

    const symbols = await getWatchlistSymbolsByEmail(session.user.email);

    const watchlistData = await Promise.all(
        symbols.map(async (symbol) => {
            try {
                const [quote, profile, financials] = await Promise.all([
                    getQuote(symbol),
                    getStockProfile(symbol),
                    getBasicFinancials(symbol)
                ]);

                return {
                    company: profile.name || symbol,
                    symbol: symbol.toUpperCase(),
                    price: formatPrice(quote.c || 0),
                    change: formatChangePercent(quote.dp || 0),
                    isPositive: (quote.dp || 0) >= 0,
                    marketCap: formatMarketCapValue(profile.marketCapitalization || 0),
                    peRatio: financials.metric?.peExclExtraTTM?.toFixed(1) || "N/A",
                    image: profile.logo
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
                    image: ""
                };
            }
        })
    );

    const news = await getNews(symbols);
    const alerts = await getAlertsByEmail(session.user.email);

    return (
        <InertiaDashboardClient 
            initialWatchlist={watchlistData} 
            initialNews={news} 
            initialAlerts={alerts}
        />
    )
}

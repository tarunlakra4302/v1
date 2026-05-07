import { auth } from "@/lib/better-auth/auth";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SearchPageClient from "@/components/SearchPageClient";

export default async function SearchPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const initialStocks = await searchStocks();
  const watchlistSymbols = await getWatchlistSymbolsByEmail(session.user.email);

  return <SearchPageClient 
    initialStocks={initialStocks} 
    user={session.user} 
    initialWatchlistSymbols={watchlistSymbols}
  />;
}

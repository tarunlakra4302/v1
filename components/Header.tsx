import React from 'react';
import Link from 'next/link';
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import HeaderClient from "@/components/HeaderClient";

interface User {
  id: string;
  name: string;
  email: string;
}

const Header = async ({ user }: { user: User }) => {
  const initialStocks = await searchStocks();
  const watchlistSymbols = await getWatchlistSymbolsByEmail(user.email);

  return (
    <header className="sticky top-0 z-50 bg-[#050505] border-b border-zinc-800">
      <HeaderClient 
        user={user} 
        initialStocks={initialStocks} 
        initialWatchlistSymbols={watchlistSymbols}
      />
    </header>
  );
};

export default Header;

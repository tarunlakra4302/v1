"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchCommand from './SearchCommand';
import UserDropdown from './UserDropdown';

interface HeaderClientProps {
  user: User;
  initialStocks: StockWithWatchlistStatus[];
  initialWatchlistSymbols: string[];
}

const HeaderClient = ({ user, initialStocks, initialWatchlistSymbols }: HeaderClientProps) => {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Search', href: '/search' },
    { label: 'Watchlist', href: '/watchlist' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-end gap-[2px] h-6">
            <div className="w-1.5 h-3 bg-positive rounded-t-sm group-hover:h-4 transition-all"></div>
            <div className="w-1.5 h-5 bg-yellow-500 rounded-t-sm group-hover:h-3 transition-all"></div>
            <div className="w-1.5 h-4 bg-negative rounded-t-sm group-hover:h-5 transition-all"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Inertia</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.href === '/search' ? (
                <div className={`${pathname === link.href ? 'text-white' : 'text-zinc-500'} hover:text-white transition-colors text-sm font-medium cursor-pointer`}>
                  <SearchCommand 
                    renderAs="text" 
                    label="Search" 
                    initialStocks={initialStocks} 
                    user={user}
                    initialWatchlistSymbols={initialWatchlistSymbols}
                  />
                </div>
              ) : (
                <Link 
                  href={link.href} 
                  className={`${pathname === link.href ? 'text-white' : 'text-zinc-500'} hover:text-white transition-colors text-sm font-medium`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <UserDropdown 
          user={user} 
          initialStocks={initialStocks} 
          initialWatchlistSymbols={initialWatchlistSymbols}
        />
      </div>
    </div>
  );
};

export default HeaderClient;

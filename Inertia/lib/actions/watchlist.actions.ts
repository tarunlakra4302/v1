'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { revalidatePath } from 'next/cache';

async function getUserIdByEmail(email: string): Promise<string | null> {
  if (!email) return null;

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not found');

  const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
  if (!user) return null;

  return (user.id as string) || String(user._id || '') || null;
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(data: { email: string; symbol: string; company: string }) {
  try {
    const symbol = data.symbol.toUpperCase();
    console.log(`Adding ${symbol} to watchlist for user ${data.email}`);
    const userId = await getUserIdByEmail(data.email);
    console.log(`Found userId: ${userId}`);
    if (!userId) throw new Error('User not found');

    const result = await Watchlist.updateOne(
      { userId, symbol },
      {
        $setOnInsert: {
          userId,
          symbol,
          company: data.company,
          addedAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log('Update result:', result);

    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${symbol.toLowerCase()}`);

    return { success: true, isInWatchlist: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    throw new Error('Failed to add stock to watchlist');
  }
}

export async function removeFromWatchlist(data: { email: string; symbol: string }) {
  try {
    const userId = await getUserIdByEmail(data.email);
    if (!userId) throw new Error('User not found');

    const symbol = data.symbol.toUpperCase();

    await Watchlist.deleteOne({ userId, symbol });

    revalidatePath('/');
    revalidatePath('/watchlist');
    revalidatePath(`/stocks/${symbol.toLowerCase()}`);

    return { success: true, isInWatchlist: false };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    throw new Error('Failed to remove stock from watchlist');
  }
}

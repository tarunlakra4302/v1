'use server';

import { connectToDatabase } from '@/database/mongoose';
import Alert from '@/database/models/alert.model';

export async function getAlertsByEmail(email: string) {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ id?: string; _id?: any }>({ email });
    if (!user) return [];

    const userId = user.id || String(user._id);
    const alerts = await Alert.find({ userId }).lean();
    
    return JSON.parse(JSON.stringify(alerts));
  } catch (err) {
    console.error('getAlertsByEmail error:', err);
    return [];
  }
}

export async function createAlert(data: {
  email: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
}) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ id?: string; _id?: any }>({ email: data.email });
    if (!user) throw new Error('User not found');

    const userId = user.id || String(user._id);

    const newAlert = await Alert.create({
      userId,
      symbol: data.symbol,
      company: data.company,
      alertName: data.alertName,
      alertType: data.alertType,
      threshold: data.threshold
    });

    return JSON.parse(JSON.stringify(newAlert));
  } catch (err) {
    console.error('createAlert error:', err);
    throw new Error('Failed to create alert');
  }
}

export async function deleteAlert(alertId: string) {
  try {
    await connectToDatabase();
    await Alert.findByIdAndDelete(alertId);
    return { success: true };
  } catch (err) {
    console.error('deleteAlert error:', err);
    throw new Error('Failed to delete alert');
  }
}

'use server';

import {connectToDatabase} from "@/database/mongoose";

export const getAllUsersForNewsEmail = async () => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if(!db) throw new Error('Mongoose connection not connected');

        const users = await db.collection('user').find(
            { email: { $exists: true, $ne: null }},
            { projection: { _id: 1, id: 1, email: 1, name: 1, country:1 }}
        ).toArray();

        return users.filter((user) => user.email && user.name).map((user) => ({
            id: user.id || user._id?.toString() || '',
            email: user.email,
            name: user.name
        }))
    } catch (e) {
        console.error('Error fetching users for news email:', e)
        return []
    }
}

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if(!db) throw new Error('Mongoose connection not connected');

        const updateData = { ...data };
        delete (updateData as Record<string, unknown>).id;
        delete (updateData as Record<string, unknown>).email;

        // Check if we need to use ObjectId
        const query = { id: userId };
        
        // better-auth sometimes uses _id as the primary identifier
        const result = await db.collection('user').updateOne(
            query,
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            // Try updating by _id
            await db.collection('user').updateOne(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { _id: userId as any },
                { $set: updateData }
            );
        }

        return { success: true };
    } catch (e) {
        console.error('Error updating user profile:', e);
        return { success: false, error: 'Failed to update profile' };
    }
}

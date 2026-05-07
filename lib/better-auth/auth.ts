import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

/**
 * Singleton pattern using global for HMR persistence in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var betterAuthInstance: ReturnType<typeof betterAuth> | undefined;
}

/**
 * Lazily initializes and returns the better-auth instance.
 * DB connection only happens on first call — never at import/build time.
 */
export async function getAuth() {
    if (global.betterAuthInstance) return global.betterAuthInstance;

    try {
        const mongoose = await connectToDatabase();
        
        // Use getClient().db() for a more stable DB reference
        const db = mongoose.connection.getClient().db();

        if (!db) throw new Error("MongoDB connection not found");

        console.log("Initializing Better Auth instance...");
        
        global.betterAuthInstance = betterAuth({
            database: mongodbAdapter(db as any),
            secret: process.env.BETTER_AUTH_SECRET,
            baseURL: process.env.BETTER_AUTH_URL,
            emailAndPassword: {
                enabled: true,
                disableSignUp: false,
                requireEmailVerification: false,
                minPasswordLength: 8,
                maxPasswordLength: 128,
                autoSignIn: true,
            },
            plugins: [nextCookies()],
        });

        return global.betterAuthInstance;
    } catch (err) {
        console.error("Failed to initialize Better Auth:", err);
        throw err;
    }
}

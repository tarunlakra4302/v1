import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;
type AuthInstance = Awaited<ReturnType<typeof getAuth>>;
type AuthApi = AuthInstance["api"];

/**
 * Lazily initializes and returns the better-auth instance.
 * DB connection only happens on first call — never at import/build time.
 */
export async function getAuth() {
    if (authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("MongoDB connection not found");

    authInstance = betterAuth({
        database: mongodbAdapter(db as unknown as Parameters<typeof mongodbAdapter>[0]),
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

    return authInstance;
}

const apiProxy = new Proxy({} as AuthApi, {
    get(_target, prop) {
        return async (...args: unknown[]) => {
            const auth = await getAuth();
            const apiMethod = (auth.api as Record<PropertyKey, unknown>)[prop];

            if (typeof apiMethod !== "function") {
                return apiMethod;
            }

            return (apiMethod as (...methodArgs: unknown[]) => unknown).apply(auth.api, args);
        };
    },
});

// Backward-compatible export for existing call sites that still import `auth`.
export const auth = new Proxy({} as AuthInstance, {
    get(_target, prop) {
        if (prop === "api") return apiProxy;

        return async (...args: unknown[]) => {
            const instance = await getAuth();
            const method = (instance as Record<PropertyKey, unknown>)[prop];

            if (typeof method !== "function") {
                return method;
            }

            return (method as (...methodArgs: unknown[]) => unknown).apply(instance, args);
        };
    },
});

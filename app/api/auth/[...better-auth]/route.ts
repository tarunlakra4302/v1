import { toNextJsHandler } from "better-auth/next-js";
import { connectToDatabase } from "@/database/mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

let authInstance: ReturnType<typeof betterAuth> | null = null;

async function getAuthInstance() {
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

export async function GET(req: Request) {
    const auth = await getAuthInstance();
    const handler = toNextJsHandler(auth);
    return handler.GET!(req);
}

export async function POST(req: Request) {
    const auth = await getAuthInstance();
    const handler = toNextJsHandler(auth);
    return handler.POST!(req);
}

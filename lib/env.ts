import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url().min(1, "MONGODB_URI is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url().min(1, "BETTER_AUTH_URL is required"),
  FINNHUB_API_KEY: z.string().min(1, "FINNHUB_API_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  NODEMAILER_EMAIL: z.string().email().min(1, "NODEMAILER_EMAIL is required"),
  NODEMAILER_PASSWORD: z.string().min(1, "NODEMAILER_PASSWORD is required"),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

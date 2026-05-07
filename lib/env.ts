import { z } from 'zod';

const envSchema = z.object({
  // Infrastructure
  MONGODB_URI: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url(),

  // Third-party APIs
  GEMINI_API_KEY: z.string().min(1),
  FINNHUB_API_KEY: z.string().min(1),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

/**
 * Validates and exports all environment variables.
 * Call this at the very beginning of the app lifecycle.
 */
export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    
    // In production, we want to fail fast to avoid cryptic runtime errors
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables. Deployment halted.');
    }
    
    return null;
  }

  return result.data;
};

export const env = envSchema.parse(process.env);

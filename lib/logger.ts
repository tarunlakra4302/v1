/**
 * Production-grade logging utility.
 * Features:
 * 1. Masking sensitive data (keys like 'email', 'secret', 'password', 'uri')
 * 2. Structured output for better observability (Axiom, BetterStack, Vercel Logs)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = ['email', 'password', 'secret', 'token', 'uri', 'key', 'auth', 'cookie'];

/**
 * Recursively masks sensitive keys in an object or string.
 */
function maskData(data: unknown): unknown {
  if (typeof data === 'string') {
    // Mask typical URI patterns or secrets
    if (data.includes('mongodb+srv://') || data.length > 50) {
      return '***MASKED***';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskData);
  }

  if (data !== null && typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    const obj = data as Record<string, unknown>;
    for (const key in obj) {
      if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskData(obj[key]);
      }
    }
    return masked;
  }

  return data;
}

export const logger: Record<LogLevel, (message: string, context?: unknown) => void> = {
  info: (message: string, context?: unknown) => {
    console.log(`[INFO] ${message}`, context ? maskData(context) : '');
  },
  warn: (message: string, context?: unknown) => {
    console.warn(`[WARN] ${message}`, context ? maskData(context) : '');
  },
  error: (message: string, context?: unknown) => {
    console.error(`[ERROR] ${message}`, context ? maskData(context) : '');
  },
  debug: (message: string, context?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context ? maskData(context) : '');
    }
  },
};

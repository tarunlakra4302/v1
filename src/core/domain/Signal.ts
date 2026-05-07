import { z } from 'zod';

export const SignalTypeSchema = z.enum(['TECHNICAL', 'SENTIMENT', 'MACRO', 'HYBRID']);

export const SignalStrengthSchema = z.number().min(0).max(100);

/**
 * Signal represents a calculated trading indicator derived from multi-factor analysis.
 */
export const SignalSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string().min(1).max(10),
  type: SignalTypeSchema,
  strength: SignalStrengthSchema,
  factors: z.array(z.object({
    name: z.string(),
    weight: z.number(),
    value: z.any()
  })),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
});

export type Signal = z.infer<typeof SignalSchema>;

export interface SignalReport {
  ticker: string;
  aggregateScore: number;
  confidenceInterval: [number, number];
  primaryDriver: string;
}

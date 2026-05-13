import { SignalReport } from '../domain/Signal';

/**
 * GenerateAlphaSignal orchestrates the multi-factor scoring logic.
 * It combines raw data points into a high-fidelity institutional signal.
 */
export class GenerateAlphaSignal {
  async execute(ticker: string, data: { sentiment: number; technical: number; macro: number }): Promise<SignalReport> {
    // Weighted logic representing "proprietary" engineering thinking
    const weights = {
      sentiment: 0.3,
      technical: 0.5,
      macro: 0.2
    };

    const aggregateScore = (
      data.sentiment * weights.sentiment +
      data.technical * weights.technical +
      data.macro * weights.macro
    );

    // Simulated confidence calculation based on factor variance
    const confidenceInterval: [number, number] = [
      Math.max(0, aggregateScore - 5),
      Math.min(100, aggregateScore + 5)
    ];

    const primaryDriver = this.determinePrimaryDriver(data, weights);

    return {
      ticker,
      aggregateScore: Math.round(aggregateScore * 100) / 100,
      confidenceInterval,
      primaryDriver
    };
  }

  private determinePrimaryDriver(
    data: { sentiment: number; technical: number; macro: number },
    weights: Record<"sentiment" | "technical" | "macro", number>
  ): string {
    const contributions = Object.keys(weights).map((key) => ({
      key,
      impact: data[key as keyof typeof data] * weights[key as keyof typeof weights]
    }));

    return contributions.reduce((prev, current) =>
      (prev.impact > current.impact) ? prev : current
    ).key;
  }
}

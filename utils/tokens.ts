/**
 * Token counting and management utilities
 */

/**
 * Approximate token count for text (rough estimate: ~4 chars per token)
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Average token is ~4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  if (!text) return '';
  
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Calculate approximate character limit
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + '...';
}

/**
 * Calculate cost estimate based on token count
 * Prices are approximate and should be updated based on actual pricing
 */
export function estimateCost(inputTokens: number, outputTokens: number, modelType: string = 'default'): number {
  // Approximate costs per 1M tokens (adjust based on actual pricing)
  const pricing: Record<string, { input: number; output: number }> = {
    'gemini-pro': { input: 0.5, output: 1.5 },
    'gemini-flash': { input: 0.15, output: 0.6 },
    'default': { input: 0.5, output: 1.5 }
  };
  
  const model = pricing[modelType] || pricing.default;
  
  const inputCost = (inputTokens / 1_000_000) * model.input;
  const outputCost = (outputTokens / 1_000_000) * model.output;
  
  return inputCost + outputCost;
}

/**
 * Usage tracking for metering
 */
export interface UsageMetrics {
  requestCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  lastReset: number;
}

class UsageTracker {
  private metrics: UsageMetrics = {
    requestCount: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCost: 0,
    lastReset: Date.now()
  };

  track(inputTokens: number, outputTokens: number, modelType: string = 'default'): void {
    this.metrics.requestCount++;
    this.metrics.totalInputTokens += inputTokens;
    this.metrics.totalOutputTokens += outputTokens;
    this.metrics.totalCost += estimateCost(inputTokens, outputTokens, modelType);
  }

  getMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      lastReset: Date.now()
    };
  }
}

export const usageTracker = new UsageTracker();

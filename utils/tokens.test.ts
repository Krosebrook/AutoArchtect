import { describe, it, expect } from 'vitest';
import { estimateTokenCount, truncateToTokenLimit, estimateCost } from './tokens';

describe('estimateTokenCount', () => {
  it('should estimate tokens for text', () => {
    const text = 'Hello world'; // ~11 chars = ~3 tokens
    const tokens = estimateTokenCount(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThanOrEqual(5);
  });

  it('should return 0 for empty text', () => {
    expect(estimateTokenCount('')).toBe(0);
  });

  it('should handle long text', () => {
    const text = 'a'.repeat(1000); // 1000 chars = ~250 tokens
    const tokens = estimateTokenCount(text);
    expect(tokens).toBeGreaterThan(200);
    expect(tokens).toBeLessThanOrEqual(300);
  });
});

describe('truncateToTokenLimit', () => {
  it('should not truncate if within limit', () => {
    const text = 'Short text';
    const result = truncateToTokenLimit(text, 100);
    expect(result).toBe(text);
  });

  it('should truncate if exceeds limit', () => {
    const text = 'a'.repeat(1000); // ~250 tokens
    const result = truncateToTokenLimit(text, 50); // limit to 50 tokens
    expect(result.length).toBeLessThan(text.length);
    expect(result).toContain('...');
  });

  it('should handle empty text', () => {
    expect(truncateToTokenLimit('', 100)).toBe('');
  });
});

describe('estimateCost', () => {
  it('should calculate cost for input and output tokens', () => {
    const cost = estimateCost(1000, 500, 'gemini-pro');
    expect(cost).toBeGreaterThan(0);
  });

  it('should use default pricing for unknown models', () => {
    const cost1 = estimateCost(1000, 500, 'unknown-model');
    const cost2 = estimateCost(1000, 500, 'default');
    expect(cost1).toBe(cost2);
  });

  it('should calculate different costs for different models', () => {
    const proCost = estimateCost(1000, 500, 'gemini-pro');
    const flashCost = estimateCost(1000, 500, 'gemini-flash');
    expect(proCost).not.toBe(flashCost);
  });

  it('should return 0 for zero tokens', () => {
    const cost = estimateCost(0, 0, 'gemini-pro');
    expect(cost).toBe(0);
  });
});

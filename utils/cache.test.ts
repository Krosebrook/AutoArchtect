import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from './cache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 1000); // max 3 items, 1 second TTL
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should respect max size', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); // Should evict key1

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should track cache statistics', () => {
    cache.set('key1', 'value1');
    cache.get('key1'); // hit
    cache.get('key2'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.5);
  });

  it('should expire items after TTL', async () => {
    const shortCache = new LRUCache<string>(10, 100); // 100ms TTL
    shortCache.set('key1', 'value1');
    
    expect(shortCache.get('key1')).toBe('value1');
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(shortCache.get('key1')).toBeNull();
  });

  it('should generate consistent fingerprints', () => {
    const fp1 = LRUCache.generateFingerprint('test prompt', { model: 'gpt-4' });
    const fp2 = LRUCache.generateFingerprint('test prompt', { model: 'gpt-4' });
    const fp3 = LRUCache.generateFingerprint('different prompt', { model: 'gpt-4' });

    expect(fp1).toBe(fp2);
    expect(fp1).not.toBe(fp3);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
    expect(cache.getStats().size).toBe(0);
  });
});

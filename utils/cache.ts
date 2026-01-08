/**
 * LRU Cache implementation for AI request caching
 * Provides intelligent caching with TTL-based invalidation
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds
  private stats: { hits: number; misses: number };

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Generate a fingerprint for cache key from prompt and parameters
   */
  static generateFingerprint(prompt: string, params?: Record<string, any>): string {
    const normalized = prompt.toLowerCase().trim();
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${normalized}:${paramsStr}`;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update hit count and move to end (most recently used)
    entry.hits++;
    this.stats.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key: string, value: T): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    });
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  has(key: string): boolean {
    return this.cache.has(key) && (Date.now() - this.cache.get(key)!.timestamp <= this.ttl);
  }
}

// Singleton instance for AI responses
export const aiCache = new LRUCache<any>(100, 5 * 60 * 1000);

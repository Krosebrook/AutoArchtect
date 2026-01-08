/**
 * Performance monitoring utilities
 * Tracks Web Vitals and custom performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;

  /**
   * Record a custom performance metric
   */
  record(name: string, value: number, unit: string = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now()
    };

    this.metrics.push(metric);

    // Trim old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}${unit}`);
    }
  }

  /**
   * Measure execution time of a function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(name, duration, 'ms');
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name} (failed)`, duration, 'ms');
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (!name) return [...this.metrics];
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average value for a metric
   */
  getAverage(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get percentile for a metric
   */
  getPercentile(name: string, percentile: number): number | null {
    const metrics = this.getMetrics(name).sort((a, b) => a.value - b.value);
    if (metrics.length === 0) return null;

    const index = Math.ceil((percentile / 100) * metrics.length) - 1;
    return metrics[index].value;
  }

  /**
   * Observe Web Vitals
   */
  observeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Observe FCP (First Contentful Paint)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.record('FCP', entry.startTime, 'ms');
        }
      }
    });

    try {
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // Not supported
    }

    // Observe LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.record('LCP', lastEntry.startTime, 'ms');
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Not supported
    }

    // Observe FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        this.record('FID', fid, 'ms');
      }
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Not supported
    }

    // Observe CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.record('CLS', clsValue, 'score');
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Not supported
    }

    // TTFB (Time to First Byte)
    if (window.performance && window.performance.timing) {
      const navTiming = window.performance.timing;
      const ttfb = navTiming.responseStart - navTiming.requestStart;
      if (ttfb > 0) {
        this.record('TTFB', ttfb, 'ms');
      }
    }
  }

  /**
   * Get Web Vitals summary
   */
  getWebVitals(): WebVitals {
    return {
      FCP: this.getMetrics('FCP')[0]?.value,
      LCP: this.getMetrics('LCP')[0]?.value,
      FID: this.getMetrics('FID')[0]?.value,
      CLS: this.getMetrics('CLS')[0]?.value,
      TTFB: this.getMetrics('TTFB')[0]?.value
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-observe Web Vitals on initialization
if (typeof window !== 'undefined') {
  performanceMonitor.observeWebVitals();
}

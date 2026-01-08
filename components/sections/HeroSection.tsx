import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sparkles, Zap, Shield } from 'lucide-react';

/**
 * HeroSection Component
 * Production-grade hero with:
 * - Smooth parallax animation using requestAnimationFrame
 * - Responsive text scaling
 * - Throttled scroll listeners
 * - ARIA accessibility
 * - Optimized re-renders with useMemo/useCallback
 */

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  onCTAClick?: () => void;
}

// Throttle utility for scroll events
const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'AutoArchitect',
  subtitle = 'AI-Powered Automation Architecture',
  onCTAClick
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number>();
  const sectionRef = useRef<HTMLElement>(null);

  // Smooth scroll tracking with requestAnimationFrame
  const updateScrollPosition = useCallback(() => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
      setScrollY(scrollProgress);
    }
  }, []);

  // Throttled scroll handler (60fps = ~16ms)
  const handleScroll = useThrottle(() => {
    rafRef.current = requestAnimationFrame(updateScrollPosition);
  }, 16);

  useEffect(() => {
    setIsVisible(true);
    handleScroll(); // Initial position
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Parallax transforms - memoized for performance
  const parallaxStyles = useMemo(() => {
    const offset = scrollY * 100;
    return {
      background: {
        transform: `translateY(${offset * 0.5}px)`,
        opacity: 1 - scrollY * 0.5
      },
      content: {
        transform: `translateY(${offset * 0.3}px) scale(${1 - scrollY * 0.1})`,
        opacity: 1 - scrollY * 0.7
      },
      features: {
        transform: `translateY(${offset * 0.2}px)`,
        opacity: 1 - scrollY * 0.4
      }
    };
  }, [scrollY]);

  const handleCTAClick = useCallback(() => {
    onCTAClick?.();
  }, [onCTAClick]);

  const features = useMemo(() => [
    { icon: Sparkles, label: 'AI-Powered', color: 'text-indigo-400' },
    { icon: Zap, label: 'Lightning Fast', color: 'text-yellow-400' },
    { icon: Shield, label: 'Secure', color: 'text-green-400' }
  ], []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"
      role="banner"
      aria-label="Hero section"
    >
      {/* Animated background */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"
        style={parallaxStyles.background}
        aria-hidden="true"
      />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Main content */}
      <div
        className={`relative z-10 max-w-5xl mx-auto px-6 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={parallaxStyles.content}
      >
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight"
          style={{
            textShadow: '0 0 40px rgba(99, 102, 241, 0.5)',
            fontSize: 'clamp(2.5rem, 8vw, 6rem)' // Responsive scaling
          }}
        >
          {title}
        </h1>

        <p 
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-indigo-200 mb-12 max-w-3xl mx-auto"
          style={{
            fontSize: 'clamp(1.125rem, 3vw, 1.875rem)' // Responsive scaling
          }}
        >
          {subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleCTAClick}
          className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          aria-label="Get started with AutoArchitect"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Features */}
        <div 
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
          style={parallaxStyles.features}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              style={{
                transitionDelay: `${idx * 100}ms`
              }}
            >
              <feature.icon 
                className={`w-10 h-10 ${feature.color}`}
                aria-hidden="true"
              />
              <span className="text-white font-medium text-lg">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        style={{ opacity: 1 - scrollY * 2 }}
        aria-hidden="true"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

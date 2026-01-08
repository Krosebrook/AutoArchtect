import React, { lazy, Suspense, useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Diagrams Component
 * Production-grade diagram rendering with:
 * - Lazy loading with React.lazy() and Suspense
 * - IntersectionObserver for deferred off-screen loading
 * - SSR-compatible fallbacks
 * - Modular per-diagram code-splitting
 */

// Lazy-loaded diagram components (code-split for performance)
const FlowDiagram = lazy(() => import('./diagrams/FlowDiagram'));
const ArchitectureDiagram = lazy(() => import('./diagrams/ArchitectureDiagram'));
const SequenceDiagram = lazy(() => import('./diagrams/SequenceDiagram'));

export interface DiagramProps {
  data?: any;
  className?: string;
}

interface DiagramConfig {
  id: string;
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType<DiagramProps>>;
}

const DIAGRAMS: DiagramConfig[] = [
  {
    id: 'flow',
    title: 'Workflow Flow Diagram',
    description: 'Visual representation of automation workflow steps',
    component: FlowDiagram
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    description: 'High-level system architecture overview',
    component: ArchitectureDiagram
  },
  {
    id: 'sequence',
    title: 'Sequence Diagram',
    description: 'Interaction sequence between components',
    component: SequenceDiagram
  }
];

// Loading fallback component
const DiagramLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
      <p className="text-sm text-slate-600 dark:text-slate-400">Loading diagram...</p>
    </div>
  </div>
);

// Error boundary fallback
const DiagramError: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="flex items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-300 dark:border-red-700">
    <div className="text-center px-4">
      <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load diagram</p>
      {error && (
        <p className="text-xs text-red-500 dark:text-red-500">{error.message}</p>
      )}
    </div>
  </div>
);

// Individual diagram wrapper with IntersectionObserver
interface LazyDiagramProps {
  config: DiagramConfig;
  data?: any;
}

const LazyDiagram: React.FC<LazyDiagramProps> = ({ config, data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleError = (error: Error) => {
    setHasError(error);
    console.error(`Error loading diagram ${config.id}:`, error);
  };

  const DiagramComponent = config.component;

  return (
    <div
      ref={containerRef}
      className="mb-8 last:mb-0"
      data-diagram-id={config.id}
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {config.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {config.description}
        </p>
      </div>

      {hasError ? (
        <DiagramError error={hasError} />
      ) : isVisible ? (
        <Suspense fallback={<DiagramLoader />}>
          <ErrorBoundary onError={handleError}>
            <DiagramComponent data={data} className="w-full" />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <DiagramLoader />
      )}
    </div>
  );
};

// Simple error boundary for diagrams
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Diagram error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <DiagramError error={this.state.error || undefined} />;
    }

    return this.props.children;
  }
}

// Main Diagrams component
export interface DiagramsProps {
  selectedDiagram?: string;
  data?: Record<string, any>;
}

export const Diagrams: React.FC<DiagramsProps> = ({ selectedDiagram, data }) => {
  const diagramsToRender = selectedDiagram
    ? DIAGRAMS.filter((d) => d.id === selectedDiagram)
    : DIAGRAMS;

  return (
    <div 
      className="w-full"
      role="region"
      aria-label="Diagrams section"
    >
      {diagramsToRender.map((config) => (
        <LazyDiagram
          key={config.id}
          config={config}
          data={data?.[config.id]}
        />
      ))}

      {diagramsToRender.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No diagrams available
        </div>
      )}
    </div>
  );
};

export default Diagrams;

import React from 'react';
import { DiagramProps } from '../Diagrams';

/**
 * ArchitectureDiagram Component
 * Renders system architecture diagrams
 */

const ArchitectureDiagram: React.FC<DiagramProps> = ({ data, className = '' }) => {
  const layers = data?.layers || [
    { name: 'Frontend', color: '#3b82f6' },
    { name: 'API Layer', color: '#8b5cf6' },
    { name: 'AI Models', color: '#ec4899' },
    { name: 'Database', color: '#10b981' }
  ];

  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm ${className}`}>
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto"
        role="img"
        aria-label="System architecture diagram"
      >
        {layers.map((layer: any, idx: number) => {
          const y = 50 + idx * 100;
          const height = 80;

          return (
            <g key={idx}>
              {/* Layer box */}
              <rect
                x="50"
                y={y}
                width="700"
                height={height}
                rx="8"
                fill={layer.color}
                fillOpacity="0.1"
                stroke={layer.color}
                strokeWidth="2"
              />
              
              {/* Layer label */}
              <text
                x="400"
                y={y + height / 2 + 5}
                textAnchor="middle"
                className="text-lg font-semibold fill-slate-700 dark:fill-slate-200"
              >
                {layer.name}
              </text>

              {/* Connection to next layer */}
              {idx < layers.length - 1 && (
                <line
                  x1="400"
                  y1={y + height}
                  x2="400"
                  y2={y + height + 20}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ArchitectureDiagram;

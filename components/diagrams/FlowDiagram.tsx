import React from 'react';
import { DiagramProps } from '../Diagrams';

/**
 * FlowDiagram Component
 * Renders workflow flow diagrams
 * This is a placeholder - can be extended with actual diagram library (mermaid, d3, etc.)
 */

const FlowDiagram: React.FC<DiagramProps> = ({ data, className = '' }) => {
  const steps = data?.steps || [
    { id: 1, label: 'Start', type: 'trigger' },
    { id: 2, label: 'Process', type: 'action' },
    { id: 3, label: 'Decision', type: 'logic' },
    { id: 4, label: 'End', type: 'action' }
  ];

  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm ${className}`}>
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto"
        role="img"
        aria-label="Workflow flow diagram"
      >
        {/* Simple flow diagram visualization */}
        {steps.map((step: any, idx: number) => {
          const x = 100 + idx * 180;
          const y = 200;
          const color = step.type === 'trigger' ? '#10b981' : step.type === 'logic' ? '#f59e0b' : '#6366f1';

          return (
            <g key={step.id}>
              {/* Node */}
              <rect
                x={x - 60}
                y={y - 30}
                width="120"
                height="60"
                rx="8"
                fill={color}
                fillOpacity="0.1"
                stroke={color}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="text-sm font-medium fill-slate-700 dark:fill-slate-200"
              >
                {step.label}
              </text>

              {/* Arrow to next node */}
              {idx < steps.length - 1 && (
                <>
                  <line
                    x1={x + 60}
                    y1={y}
                    x2={x + 120}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default FlowDiagram;

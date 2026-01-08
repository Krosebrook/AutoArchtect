import React from 'react';
import { DiagramProps } from '../Diagrams';

/**
 * SequenceDiagram Component
 * Renders sequence diagrams for component interactions
 */

const SequenceDiagram: React.FC<DiagramProps> = ({ data, className = '' }) => {
  const actors = data?.actors || ['User', 'Frontend', 'API', 'AI Model'];
  const messages = data?.messages || [
    { from: 0, to: 1, label: 'Request' },
    { from: 1, to: 2, label: 'API Call' },
    { from: 2, to: 3, label: 'Generate' },
    { from: 3, to: 2, label: 'Response' },
    { from: 2, to: 1, label: 'Data' },
    { from: 1, to: 0, label: 'Display' }
  ];

  const actorSpacing = 180;
  const messageSpacing = 60;

  return (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm ${className}`}>
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto"
        role="img"
        aria-label="Sequence diagram"
      >
        {/* Actors */}
        {actors.map((actor: string, idx: number) => {
          const x = 100 + idx * actorSpacing;

          return (
            <g key={idx}>
              {/* Actor box */}
              <rect
                x={x - 50}
                y="20"
                width="100"
                height="40"
                rx="4"
                fill="#6366f1"
                fillOpacity="0.1"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <text
                x={x}
                y="45"
                textAnchor="middle"
                className="text-sm font-medium fill-slate-700 dark:fill-slate-200"
              >
                {actor}
              </text>

              {/* Lifeline */}
              <line
                x1={x}
                y1="60"
                x2={x}
                y2="450"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </g>
          );
        })}

        {/* Messages */}
        {messages.map((msg: any, idx: number) => {
          const fromX = 100 + msg.from * actorSpacing;
          const toX = 100 + msg.to * actorSpacing;
          const y = 100 + idx * messageSpacing;

          return (
            <g key={idx}>
              <line
                x1={fromX}
                y1={y}
                x2={toX}
                y2={y}
                stroke="#6366f1"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
              <text
                x={(fromX + toX) / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-slate-600 dark:fill-slate-400"
              >
                {msg.label}
              </text>
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default SequenceDiagram;

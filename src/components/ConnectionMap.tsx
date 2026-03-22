'use client';

import { useEffect, useRef, useState } from 'react';
import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#4ade80',
  idle: '#555',
  error: '#ef4444',
};

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConnectionMap({ agents, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { width, height } = dimensions;

  // Position agents in a meaningful layout based on their role in the pipeline
  // Entry points on left, processors in middle, outputs on right
  const getPositions = (): NodePosition[] => {
    if (width === 0) return [];

    const padX = 80;
    const padY = 40;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    // Group by pipeline stage
    const entryAgents = agents.filter(a =>
      ['lead-scraper', 'brand-scout', 'content-repurposer'].includes(a.id)
    );
    const midAgents = agents.filter(a =>
      ['cold-emailer', 'deal-pitcher', 'content-scheduler', 'ad-builder'].includes(a.id)
    );
    const endAgents = agents.filter(a =>
      ['lead-scorer', 'ad-auditor'].includes(a.id)
    );

    const columns = [entryAgents, midAgents, endAgents];
    const positions: NodePosition[] = [];

    columns.forEach((col, colIdx) => {
      const x = padX + (usableW / (columns.length - 1)) * colIdx;
      col.forEach((agent, rowIdx) => {
        const spacing = usableH / (col.length + 1);
        const y = padY + spacing * (rowIdx + 1);
        positions.push({ id: agent.id, x, y });
      });
    });

    return positions;
  };

  const positions = getPositions();

  // Build edges from agent.connectedTo
  const edges: { from: NodePosition; to: NodePosition }[] = [];
  agents.forEach((agent) => {
    const fromPos = positions.find((p) => p.id === agent.id);
    if (!fromPos) return;
    agent.connectedTo.forEach((targetId) => {
      const toPos = positions.find((p) => p.id === targetId);
      if (toPos) {
        edges.push({ from: fromPos, to: toPos });
      }
    });
  });

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          className="absolute inset-0"
        >
          {/* Grid dots */}
          <defs>
            <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="0.5" fill="#1e1e1e" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#map-grid)" />

          {/* Edges */}
          {edges.map((edge, i) => {
            const midX = (edge.from.x + edge.to.x) / 2;
            return (
              <path
                key={i}
                d={`M ${edge.from.x} ${edge.from.y} C ${midX} ${edge.from.y}, ${midX} ${edge.to.y}, ${edge.to.x} ${edge.to.y}`}
                stroke="#2a2a2a"
                strokeWidth="1"
                fill="none"
              />
            );
          })}

          {/* Nodes */}
          {positions.map((pos) => {
            const agent = agents.find((a) => a.id === pos.id);
            if (!agent) return null;
            const isSelected = selectedId === pos.id;
            const isActive = agent.status === 'active';

            return (
              <g
                key={pos.id}
                onClick={() => onSelect(pos.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection highlight */}
                {isSelected && (
                  <rect
                    x={pos.x - 42}
                    y={pos.y - 14}
                    width={84}
                    height={28}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1"
                  />
                )}

                {/* Node box */}
                <rect
                  x={pos.x - 40}
                  y={pos.y - 12}
                  width={80}
                  height={24}
                  fill={isSelected ? '#1a1a1a' : '#141414'}
                  stroke={isSelected ? '#4ade80' : '#2a2a2a'}
                  strokeWidth="1"
                />

                {/* Status dot */}
                <circle
                  cx={pos.x - 30}
                  cy={pos.y}
                  r="2.5"
                  fill={statusColor[agent.status]}
                >
                  {isActive && (
                    <animate
                      attributeName="opacity"
                      values="1;0.4;1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>

                {/* Label */}
                <text
                  x={pos.x + 4}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? '#c8c8c8' : '#666'}
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="0.04em"
                >
                  {agent.name.length > 12 ? agent.name.slice(0, 11) + '..' : agent.name}
                </text>

                {/* Brand tag */}
                {agent.brand && (
                  <text
                    x={pos.x + 4}
                    y={pos.y + 22}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#444"
                    fontSize="7"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {agent.brand}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

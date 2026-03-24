'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#4a4a5e',
  error: '#ff4466',
};

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Simple force-directed layout computed once
function computeWebLayout(
  agents: Agent[],
  width: number,
  height: number,
): { id: string; x: number; y: number }[] {
  if (width === 0 || agents.length === 0) return [];

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  // Seed nodes in a circle with slight randomness
  const nodes: SimNode[] = agents.map((a, i) => {
    const angle = (i / agents.length) * Math.PI * 2 - Math.PI / 2;
    const jitter = 0.15;
    const r = radius * (0.7 + ((i * 7 + 3) % 10) / 10 * 0.6);
    return {
      id: a.id,
      x: cx + Math.cos(angle + jitter * Math.sin(i * 2.7)) * r,
      y: cy + Math.sin(angle + jitter * Math.cos(i * 1.3)) * r,
      vx: 0,
      vy: 0,
    };
  });

  // Build edge set for attraction
  const edgeSet = new Set<string>();
  agents.forEach((a) => {
    a.connectedTo.forEach((t) => {
      edgeSet.add(`${a.id}:${t}`);
      edgeSet.add(`${t}:${a.id}`);
    });
  });

  const isConnected = (a: string, b: string) => edgeSet.has(`${a}:${b}`);

  // Run simulation
  const iterations = 120;
  const repulsion = 8000;
  const attraction = 0.008;
  const centerPull = 0.002;
  const damping = 0.85;
  const pad = 80;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations; // cooling

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (repulsion * temp) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx += fx;
        nodes[i].vy += fy;
        nodes[j].vx -= fx;
        nodes[j].vy -= fy;
      }
    }

    // Attraction along edges
    agents.forEach((agent) => {
      const n1 = nodes.find((n) => n.id === agent.id);
      if (!n1) return;
      agent.connectedTo.forEach((targetId) => {
        const n2 = nodes.find((n) => n.id === targetId);
        if (!n2) return;
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = 160;
        const force = (dist - idealDist) * attraction * temp;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        n1.vx += fx;
        n1.vy += fy;
        n2.vx -= fx;
        n2.vy -= fy;
      });
    });

    // Center gravity
    nodes.forEach((n) => {
      n.vx += (cx - n.x) * centerPull;
      n.vy += (cy - n.y) * centerPull;
    });

    // Apply velocity
    nodes.forEach((n) => {
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      // Keep within bounds
      n.x = Math.max(pad, Math.min(width - pad, n.x));
      n.y = Math.max(pad, Math.min(height - pad, n.y));
    });
  }

  return nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
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

  const positions = useMemo(
    () => computeWebLayout(agents, width, height),
    [agents, width, height],
  );

  // Build all edges (including bidirectional for visual)
  const edges: { from: typeof positions[0]; to: typeof positions[0]; fromAgent: Agent }[] = [];
  agents.forEach((agent) => {
    const fromPos = positions.find((p) => p.id === agent.id);
    if (!fromPos) return;
    agent.connectedTo.forEach((targetId) => {
      const toPos = positions.find((p) => p.id === targetId);
      if (toPos) {
        edges.push({ from: fromPos, to: toPos, fromAgent: agent });
      }
    });
  });

  // Find all nodes connected to selected
  const selectedConnections = new Set<string>();
  if (selectedId) {
    const selAgent = agents.find((a) => a.id === selectedId);
    if (selAgent) {
      selAgent.connectedTo.forEach((id) => selectedConnections.add(id));
    }
    agents.forEach((a) => {
      if (a.connectedTo.includes(selectedId)) selectedConnections.add(a.id);
    });
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {width > 0 && (
        <svg width={width} height={height} className="absolute inset-0">
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.5" fill="rgba(255,255,255,0.025)" />
            </pattern>

            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="node-glow-active" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="node-glow-selected" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={width} height={height} fill="url(#map-grid)" />

          {/* Ambient rings for selected node */}
          {selectedId && (() => {
            const pos = positions.find((p) => p.id === selectedId);
            if (!pos) return null;
            return (
              <>
                <circle cx={pos.x} cy={pos.y} r="60" fill="url(#node-glow-selected)" />
                <circle cx={pos.x} cy={pos.y} r="40" fill="none" stroke="rgba(0,255,136,0.06)" strokeWidth="1" strokeDasharray="4 4" />
              </>
            );
          })()}

          {/* Edges — organic curves */}
          {edges.map((edge, i) => {
            const dx = edge.to.x - edge.from.x;
            const dy = edge.to.y - edge.from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Curved path — offset control points perpendicular to the line
            const mx = (edge.from.x + edge.to.x) / 2;
            const my = (edge.from.y + edge.to.y) / 2;
            const nx = -dy / dist;
            const ny = dx / dist;
            const curvature = dist * 0.15 * (i % 2 === 0 ? 1 : -1);
            const cpx = mx + nx * curvature;
            const cpy = my + ny * curvature;

            const isActive = edge.fromAgent.status === 'active';
            const isHighlighted =
              selectedId === edge.from.id || selectedId === edge.to.id;

            return (
              <g key={i}>
                {/* Glow layer */}
                {isHighlighted && (
                  <path
                    d={`M ${edge.from.x} ${edge.from.y} Q ${cpx} ${cpy} ${edge.to.x} ${edge.to.y}`}
                    stroke={isActive ? '#00ff88' : '#6a6a7e'}
                    strokeWidth="5"
                    fill="none"
                    opacity="0.1"
                  />
                )}
                <path
                  d={`M ${edge.from.x} ${edge.from.y} Q ${cpx} ${cpy} ${edge.to.x} ${edge.to.y}`}
                  stroke={
                    isHighlighted
                      ? isActive
                        ? '#00ff88'
                        : '#6a6a7e'
                      : 'rgba(255,255,255,0.06)'
                  }
                  strokeWidth={isHighlighted ? 1.5 : 0.8}
                  fill="none"
                  opacity={isHighlighted ? 0.5 : 1}
                />
                {/* Flow dot on active highlighted edges */}
                {isHighlighted && isActive && (
                  <circle r="2" fill="#00ff88" opacity="0.6">
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={`M ${edge.from.x} ${edge.from.y} Q ${cpx} ${cpy} ${edge.to.x} ${edge.to.y}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {positions.map((pos) => {
            const agent = agents.find((a) => a.id === pos.id);
            if (!agent) return null;
            const isSelected = selectedId === pos.id;
            const isConnected = selectedConnections.has(pos.id);
            const isActive = agent.status === 'active';
            const color = statusColor[agent.status];
            const dimmed = selectedId !== null && !isSelected && !isConnected;

            const nodeR = 28;

            return (
              <g
                key={pos.id}
                onClick={() => onSelect(pos.id)}
                style={{ cursor: 'pointer' }}
                opacity={dimmed ? 0.35 : 1}
              >
                {/* Active ambient glow */}
                {isActive && !dimmed && (
                  <circle cx={pos.x} cy={pos.y} r={nodeR + 12} fill="url(#node-glow-active)" />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeR + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.35"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeR}
                  fill={isSelected ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}
                  stroke={isSelected ? color : isConnected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}
                  strokeWidth={isSelected ? 1.5 : 1}
                />

                {/* Status dot at top-right */}
                <circle
                  cx={pos.x + nodeR * 0.6}
                  cy={pos.y - nodeR * 0.6}
                  r="3.5"
                  fill={color}
                  stroke="var(--bg-secondary)"
                  strokeWidth="2"
                  filter={isActive ? 'url(#glow-green)' : undefined}
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

                {/* Label — two lines: name + brand */}
                <text
                  x={pos.x}
                  y={agent.brand ? pos.y - 2 : pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isSelected ? '#e8e8ed' : isConnected ? '#a0a0b4' : '#6b6b80'}
                  fontSize="8.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                  letterSpacing="0.03em"
                >
                  {agent.name.length > 12 ? agent.name.slice(0, 11) + '..' : agent.name}
                </text>

                {agent.brand && (
                  <text
                    x={pos.x}
                    y={pos.y + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.2)"
                    fontSize="7"
                    fontFamily="'Inter', sans-serif"
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

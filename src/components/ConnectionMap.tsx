'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Agent } from '@/lib/types';

interface PhysicsNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  spawnTime: number;
  alive: boolean;
  scale: number; // 0→1 pop-in
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

// Burst particles when a node spawns
interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// One-word tag per agent ID, fallback to category
const AGENT_TAGS: Record<string, string> = {
  iris: 'Leads',
  nova: 'Brand',
  scout: 'Research',
  forge: 'Pages',
  echo: 'Content',
  vault: 'Finance',
  atlas: 'Operations',
  architect: 'Strategy',
  chicken: 'Alerts',
};

const CATEGORY_TAGS: Record<string, string> = {
  sales: 'Sales',
  marketing: 'Marketing',
  ads: 'Ads',
  content: 'Content',
  ops: 'Ops',
  research: 'Research',
  finance: 'Finance',
  product: 'Product',
  strategy: 'Strategy',
  custom: 'Custom',
};

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  runningAgents?: Record<string, string>;
}

export default function ConnectionMap({ agents, selectedId, onSelect, runningAgents = {} }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<PhysicsNode[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<BurstParticle[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const spawnIndexRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedIdRef = useRef(selectedId);
  const hoveredIdRef = useRef(hoveredId);
  selectedIdRef.current = selectedId;
  const runningRef = useRef(runningAgents);
  runningRef.current = runningAgents;
  hoveredIdRef.current = hoveredId;

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        setDimensions({ width: w, height: h });

        // Reset on mount/resize — seed ambient particles
        const particles: Particle[] = [];
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            life: Math.random() * 200,
            maxLife: 150 + Math.random() * 250,
            size: 0.4 + Math.random() * 1,
          });
        }
        particlesRef.current = particles;

        // Reset spawn state
        nodesRef.current = [];
        burstsRef.current = [];
        spawnIndexRef.current = 0;
        lastSpawnRef.current = 0;
        timeRef.current = 0;
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Animation loop with live physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animating = true;
    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;
    const cx = w * 0.6; // right side — Chad floats on the left
    const cy = h * 0.5; // vertically centered

    const draw = () => {
      if (!animating) return;
      const t = timeRef.current;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w * dpr, h * dpr);

      const nodes = nodesRef.current;
      const particles = particlesRef.current;
      const bursts = burstsRef.current;
      const selId = selectedIdRef.current;
      const hovId = hoveredIdRef.current;

      // === SPAWN LOGIC ===
      const totalToSpawn = agentsRef.current.length;
      const spawnInterval = 0.08; // fast spawn cadence

      if (spawnIndexRef.current < totalToSpawn && t - lastSpawnRef.current > spawnInterval) {
        const idx = spawnIndexRef.current;
        const agent = agentsRef.current[idx];
        const name = agent.name;
        const id = agent.id;

        // Compute target position — spiral outward from center
        const goldenAngle = 2.399963; // radians
        const angle = idx * goldenAngle;
        const radius = Math.min(w, h) * 0.09 * Math.sqrt(idx + 1);
        const targetX = cx + Math.cos(angle) * radius;
        const targetY = cy + Math.sin(angle) * radius;

        nodes.push({
          id,
          name,
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          targetX,
          targetY,
          spawnTime: t,
          alive: true,
          scale: 0,
          phase: Math.random() * Math.PI * 2,
        });

        // Spawn burst particles
        for (let b = 0; b < 8; b++) {
          const bAngle = (b / 8) * Math.PI * 2 + Math.random() * 0.5;
          bursts.push({
            x: cx,
            y: cy,
            vx: Math.cos(bAngle) * (2 + Math.random() * 3),
            vy: Math.sin(bAngle) * (2 + Math.random() * 3),
            life: 0,
            maxLife: 30 + Math.random() * 20,
          });
        }

        spawnIndexRef.current++;
        lastSpawnRef.current = t;
      }

      // === PHYSICS UPDATE — snappy, near-instant ===
      const lerp = 0.25; // fast interpolation toward target
      const repulsion = 800;

      nodes.forEach(n => {
        if (!n.alive) return;

        // Pop-in scale — instant
        const age = t - n.spawnTime;
        n.scale = Math.min(1, age * 12);

        // Snap toward target (lerp, no spring oscillation)
        n.x += (n.targetX - n.x) * lerp;
        n.y += (n.targetY - n.y) * lerp;

        // Repel from other nodes — keeps them separated
        nodes.forEach(other => {
          if (other.id === n.id || !other.alive) return;
          const rdx = n.x - other.x;
          const rdy = n.y - other.y;
          const dist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
          if (dist < 160) {
            const force = repulsion / (dist * dist);
            n.x += (rdx / dist) * force * 0.3;
            n.y += (rdy / dist) * force * 0.3;
          }
        });

        // Clamp to bounds (no bounce)
        const pad = 60;
        n.x = Math.max(pad, Math.min(w - pad, n.x));
        n.y = Math.max(pad, Math.min(h - pad, n.y));

        // Gentle drift once settled
        if (age > 0.5) {
          n.x += Math.sin(t * 0.3 + n.phase) * 0.15;
          n.y += Math.cos(t * 0.25 + n.phase + 1) * 0.12;
        }
      });

      // === DRAW AMBIENT PARTICLES ===
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        if (p.life > p.maxLife) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = 0;
        }
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.2 ? lifeRatio / 0.2 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.05})`;
        ctx.fill();
      });

      // === DRAW BURST PARTICLES ===
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.94;
        b.vy *= 0.94;
        b.life++;
        if (b.life > b.maxLife) {
          bursts.splice(i, 1);
          continue;
        }
        const alpha = 1 - b.life / b.maxLife;
        ctx.beginPath();
        ctx.arc(b.x * dpr, b.y * dpr, 1.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.6})`;
        ctx.fill();
      }

      // === DRAW EDGES — full mesh between alive nodes ===
      const aliveNodes = nodes.filter(n => n.alive && n.scale > 0.1);
      for (let i = 0; i < aliveNodes.length; i++) {
        for (let j = i + 1; j < aliveNodes.length; j++) {
          const n1 = aliveNodes[i];
          const n2 = aliveNodes[j];

          const edx = n2.x - n1.x;
          const edy = n2.y - n1.y;
          const dist = Math.sqrt(edx * edx + edy * edy);

          // Only draw lines within a distance threshold for readability
          if (dist > 250) continue;

          const isSelected = selId && (selId === n1.id || selId === n2.id);

          // Slight curve
          const enx = -edy / (dist || 1);
          const eny = edx / (dist || 1);
          const wobble = Math.sin(t * 0.4 + n1.phase + n2.phase) * 4;
          const cpx = (n1.x + n2.x) / 2 + enx * wobble;
          const cpy = (n1.y + n2.y) / 2 + eny * wobble;

          // Edge alpha fades with distance and scale
          const edgeAlpha = Math.min(n1.scale, n2.scale) * Math.max(0.02, 0.15 - dist * 0.0005);

          if (isSelected) {
            // Red glow
            ctx.beginPath();
            ctx.moveTo(n1.x * dpr, n1.y * dpr);
            ctx.quadraticCurveTo(cpx * dpr, cpy * dpr, n2.x * dpr, n2.y * dpr);
            ctx.strokeStyle = `rgba(255, 50, 50, ${edgeAlpha * 0.5})`;
            ctx.lineWidth = 4 * dpr;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(n1.x * dpr, n1.y * dpr);
            ctx.quadraticCurveTo(cpx * dpr, cpy * dpr, n2.x * dpr, n2.y * dpr);
            ctx.strokeStyle = `rgba(255, 50, 50, ${edgeAlpha * 2.5})`;
            ctx.lineWidth = 1.2 * dpr;
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(n1.x * dpr, n1.y * dpr);
            ctx.quadraticCurveTo(cpx * dpr, cpy * dpr, n2.x * dpr, n2.y * dpr);
            ctx.strokeStyle = `rgba(255, 255, 255, ${edgeAlpha})`;
            ctx.lineWidth = 0.6 * dpr;
            ctx.stroke();
          }
        }
      }

      // === DRAW NODES ===
      const running = runningRef.current;

      aliveNodes.forEach(node => {
        const isSelected = selId === node.id;
        const isHovered = hovId === node.id;
        const isRunning = running[node.id] === 'running';

        const x = node.x * dpr;
        const y = node.y * dpr;
        const s = node.scale;

        // Blue when running, red when selected, green default
        const cr = isRunning ? 60 : isSelected ? 255 : 0;
        const cg = isRunning ? 140 : isSelected ? 50 : 255;
        const cb = isRunning ? 255 : isSelected ? 50 : 136;

        // Outer glow haze — pulses when running
        const runPulse = isRunning ? 0.5 + Math.sin(t * 4) * 0.5 : 1; // fast pulse
        const hazeR = (isRunning ? 55 : isSelected ? 60 : isHovered ? 48 : 40) * s * dpr * (isRunning ? (0.85 + runPulse * 0.3) : 1);
        if (hazeR > 0) {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, hazeR);
          const hazeAlpha = (isRunning ? 0.2 * runPulse : isSelected ? 0.18 : 0.1) * s;
          grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${hazeAlpha})`);
          grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${hazeAlpha * 0.3})`);
          grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
          ctx.beginPath();
          ctx.arc(x, y, hazeR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Breathing ring for selected
        if (isSelected) {
          const ringR = (30 + Math.sin(t * 1.5) * 3) * s * dpr;
          ctx.beginPath();
          ctx.arc(x, y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.15 + Math.sin(t * 1.5) * 0.06) * s})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.stroke();
        }

        // Core dot
        const coreR = (isSelected ? 8 : isHovered ? 7 : 6) * s * dpr;
        ctx.beginPath();
        ctx.arc(x, y, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.85 * s})`;
        ctx.fill();

        // Inner bright point
        ctx.beginPath();
        ctx.arc(x, y, 2 * s * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(isSelected ? 0.8 : 0.5) * s})`;
        ctx.fill();

        // Label — name
        if (s > 0.5) {
          const labelAlpha = (isSelected ? 0.9 : isHovered ? 0.7 : 0.35) * s;
          ctx.font = `500 ${(isSelected ? 11.5 : 10) * dpr}px Brockmann, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(232, 232, 237, ${labelAlpha})`;
          ctx.fillText(node.name, x, y + 18 * s * dpr);

          // Tag — one word below name
          const agentData = agentsRef.current.find(a => a.id === node.id);
          const tag = AGENT_TAGS[node.id] || (agentData ? CATEGORY_TAGS[agentData.category] : '') || '';
          if (tag) {
            ctx.font = `500 ${7.5 * dpr}px Brockmann, sans-serif`;
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${labelAlpha * 0.6})`;
            ctx.fillText(tag, x, y + 28 * s * dpr);
          }
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      animating = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [dimensions]);

  // Hit detection
  const getNodeAt = useCallback((clientX: number, clientY: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    for (const node of nodesRef.current) {
      if (!node.alive || node.scale < 0.3) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy < 25 * 25) return node.id;
    }
    return null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const id = getNodeAt(e.clientX, e.clientY);
    onSelect(id);
  }, [getNodeAt, onSelect]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const id = getNodeAt(e.clientX, e.clientY);
    setHoveredId(id);
    if (containerRef.current) {
      containerRef.current.style.cursor = id ? 'pointer' : 'default';
    }
  }, [getNodeAt]);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="absolute inset-0"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoveredId(null)}
      />
    </div>
  );
}

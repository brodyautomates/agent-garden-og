'use client';

import { Agent } from '@/lib/types';

interface Props {
  agent: Agent;
  agents: Agent[];
  isSelected: boolean;
  onOpenChat: () => void;
  onRunAll: () => void;
  isRunningAll: boolean;
}

// Pixel grid face — 13x15 grid, each cell is a tiny square
// 0=empty, 1=skin, 2=eye, 3=monocle, 4=moustache, 5=mouth, 6=monocle chain, 7=eyebrow
const CHAD_GRID = [
  //0 1 2 3 4 5 6 7 8 9 0 1 2
  [0,0,0,1,1,1,1,1,1,1,0,0,0], // 0  forehead top
  [0,0,1,1,1,1,1,1,1,1,1,0,0], // 1
  [0,1,1,1,1,1,1,1,1,1,1,1,0], // 2
  [0,1,1,7,7,1,1,1,7,7,1,1,0], // 3  eyebrows
  [0,1,1,1,1,1,1,1,1,1,1,1,0], // 4
  [0,1,1,2,2,1,1,1,3,3,1,1,0], // 5  eyes (left normal, right monocle)
  [0,1,1,2,2,1,1,1,3,3,6,1,0], // 6  eyes bottom + chain start
  [0,1,1,1,1,1,1,1,1,1,6,1,0], // 7  nose area + chain
  [0,1,1,1,1,1,1,1,1,1,1,1,0], // 8
  [0,1,4,4,1,4,4,4,1,4,4,1,0], // 9  moustache
  [0,1,4,1,1,1,4,1,1,1,4,1,0], // 10 moustache curls
  [0,1,1,1,5,5,5,5,5,1,1,1,0], // 11 mouth
  [0,1,1,1,1,1,1,1,1,1,1,1,0], // 12 chin
  [0,0,1,1,1,1,1,1,1,1,1,0,0], // 13
  [0,0,0,1,1,1,1,1,1,1,0,0,0], // 14 chin bottom
];

const GRID_COLORS: Record<number, string> = {
  0: 'transparent',
  1: 'rgba(255, 51, 51, 0.12)',   // skin — subtle red
  2: 'rgba(255, 51, 51, 0.85)',   // eye — bright red
  3: 'rgba(255, 180, 50, 0.8)',   // monocle — gold
  4: 'rgba(255, 51, 51, 0.55)',   // moustache — medium red
  5: 'rgba(255, 51, 51, 0.35)',   // mouth — dim red
  6: 'rgba(255, 180, 50, 0.35)',  // monocle chain — dim gold
  7: 'rgba(255, 51, 51, 0.45)',   // eyebrow — medium red
};

function ChadFace({ size = 48 }: { size?: number }) {
  const cols = CHAD_GRID[0].length;
  const rows = CHAD_GRID.length;
  const cellSize = size / cols;

  return (
    <div
      className="shrink-0 select-none overflow-hidden"
      style={{
        width: size,
        height: cellSize * rows,
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        border: '1px solid rgba(255, 51, 51, 0.2)',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: 0.5,
        padding: 1,
      }}
    >
      {CHAD_GRID.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              backgroundColor: GRID_COLORS[cell],
              borderRadius: cell === 3 || cell === 6 ? '50%' : 1,
              animation: cell === 2 ? 'chad-blink 4s infinite' : undefined,
            }}
          />
        ))
      )}
    </div>
  );
}

export { ChadFace };

export default function ChadWidget({ agent, agents, isSelected, onOpenChat, onRunAll, isRunningAll }: Props) {
  const m = agent.master!;
  const workerCount = agents.filter((a) => a.role === 'worker').length;
  const activeDepts = m.departments.filter((d) => d.status === 'active').length;

  return (
    <div className="group relative">
      {/* Red orbiting glow — conic gradient rotates behind the card */}
      <div
        className="absolute -inset-[2px] rounded-2xl overflow-hidden"
        style={{ padding: 1 }}
      >
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%]"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, var(--chad-red) 85%, rgba(255,80,80,0.6) 90%, transparent 100%)',
            animation: 'orbit-glow 3s linear infinite',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Soft red ambient glow behind */}
      <div
        className="absolute -inset-4 rounded-3xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,51,51,0.08), transparent 70%)',
          filter: 'blur(12px)',
        }}
      />

      {/* Glass card — sits above the glow */}
      <div
        className="relative rounded-xl px-6 py-4 flex flex-col items-center gap-2.5"
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 51, 51, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Face */}
        <ChadFace size={48} />

        {/* Name + badge */}
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: 'var(--chad-red)',
              animation: 'pulse-dot 2s infinite',
              boxShadow: '0 0 8px rgba(255,51,51,0.5)',
            }}
          />
          <span className="text-[14px] text-[var(--text-primary)] tracking-wide uppercase">CHAD</span>
          <span className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full text-[var(--chad-red)]"
            style={{ background: 'var(--chad-red-dim)' }}>
            Master
          </span>
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-[rgba(255,255,255,0.06)]" />

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Stat label="Rev" value={m.revenue} accent />
          <Stat label="Depts" value={`${activeDepts}/${m.departments.length}`} />
          <Stat label="Agents" value={workerCount.toString()} />
          <Stat label="Queue" value={m.buildQueue.length.toString()} />
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-[rgba(255,255,255,0.06)]" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
            className="px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
            style={{
              background: 'var(--chad-red-dim)',
              color: 'var(--chad-red)',
              border: '1px solid rgba(255, 51, 51, 0.2)',
            }}
          >
            Talk
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRunAll(); }}
            disabled={isRunningAll}
            className="px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
            style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid var(--border-active)',
              animation: isRunningAll ? 'glow-pulse 1s infinite' : undefined,
            }}
          >
            {isRunningAll ? 'Running...' : 'Run All'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-[12px] mono leading-none ${accent ? 'text-[var(--chad-red)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
      <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

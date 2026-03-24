'use client';

import { Agent } from '@/lib/types';

interface Props {
  agent: Agent;
  agents: Agent[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function ChadWidget({ agent, agents, isSelected, onSelect }: Props) {
  const m = agent.master!;
  const workerCount = agents.filter((a) => a.role === 'worker').length;
  const activeDepts = m.departments.filter((d) => d.status === 'active').length;

  return (
    <button onClick={onSelect} className="cursor-pointer group relative">
      {/* Animated green glow behind the widget */}
      <div
        className="absolute -inset-3 rounded-2xl opacity-60"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.12), transparent 70%)',
          filter: 'blur(16px)',
          animation: 'chad-glow 4s ease-in-out infinite',
        }}
      />
      <style jsx>{`
        @keyframes chad-glow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>

      {/* Glass card */}
      <div
        className="relative rounded-xl px-4 py-2.5 flex items-center gap-4"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isSelected
            ? '1px solid rgba(0, 255, 136, 0.35)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isSelected
            ? '0 0 24px rgba(0, 255, 136, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Status dot + Name */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0"
            style={{ animation: 'pulse-dot 2s infinite', boxShadow: '0 0 8px rgba(0,255,136,0.5)' }}
          />
          <span className="text-[13px] text-[var(--text-primary)] tracking-wide uppercase">CHAD</span>
          <span className="text-[8px] uppercase tracking-[0.1em] px-1.5 py-px rounded-full bg-[rgba(0,255,136,0.1)] text-[var(--accent)]">
            Master
          </span>
        </div>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.06)]" />

        {/* Compact stats */}
        <div className="flex items-center gap-3">
          <Stat label="Rev" value={m.revenue} accent />
          <Stat label="Depts" value={`${activeDepts}/${m.departments.length}`} />
          <Stat label="Agents" value={workerCount.toString()} />
          <Stat label="Queue" value={m.buildQueue.length.toString()} />
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-[11px] mono leading-none ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
      <div className="text-[7px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

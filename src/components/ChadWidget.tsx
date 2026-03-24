'use client';

import { Agent } from '@/lib/types';

interface Props {
  agent: Agent;
  agents: Agent[];
  isSelected: boolean;
  onOpenChat: () => void;
}

function ChadFace({ size = 36 }: { size?: number }) {
  return (
    <div
      className="mono flex items-center justify-center shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 6,
        border: '1px solid rgba(255, 51, 51, 0.2)',
      }}
    >
      <div className="flex flex-col items-center leading-none" style={{ fontSize: size * 0.28 }}>
        <span style={{ color: 'var(--chad-red)', animation: 'chad-blink 4s infinite' }}>
          {'> _ <'}
        </span>
        <span style={{ color: 'rgba(255, 51, 51, 0.4)', fontSize: size * 0.2, marginTop: 1 }}>
          {'---'}
        </span>
      </div>
    </div>
  );
}

export { ChadFace };

export default function ChadWidget({ agent, agents, isSelected, onOpenChat }: Props) {
  const m = agent.master!;
  const workerCount = agents.filter((a) => a.role === 'worker').length;
  const activeDepts = m.departments.filter((d) => d.status === 'active').length;

  return (
    <button onClick={onOpenChat} className="cursor-pointer group relative">
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
        className="relative rounded-xl px-5 py-3.5 flex items-center gap-4"
        style={{
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 51, 51, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Terminal face */}
        <ChadFace size={38} />

        {/* Identity */}
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
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

        <div className="w-px h-6 bg-[rgba(255,255,255,0.06)]" />

        {/* Stats */}
        <div className="flex items-center gap-4">
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
      <div className={`text-[12px] mono leading-none ${accent ? 'text-[var(--chad-red)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
      <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

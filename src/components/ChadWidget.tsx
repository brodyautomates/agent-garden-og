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
  const activeWorkers = agents.filter((a) => a.role === 'worker' && a.status === 'active').length;
  const activeDepts = m.departments.filter((d) => d.status === 'active').length;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left cursor-pointer transition-all duration-200 group"
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isSelected ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: isSelected
            ? '0 0 30px rgba(0, 255, 136, 0.08), 0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
            : '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: isSelected
              ? 'linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          }}
        />

        {/* Content */}
        <div className="px-4 py-3 flex items-center gap-4">
          {/* Crown icon with glow */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.03))',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              boxShadow: '0 0 16px rgba(0, 255, 136, 0.1)',
              animation: 'glow-pulse 3s infinite',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M4 20l2-14 4 6 2-8 2 8 4-6 2 14" />
            </svg>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[14px] text-[var(--text-primary)]">CHAD</span>
              <span className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-px rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                Master
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                style={{ animation: 'pulse-dot 2s infinite', boxShadow: '0 0 6px rgba(0,255,136,0.5)' }}
              />
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {m.businessName === 'Pending — Chad will decide' ? 'Awaiting business model selection' : m.businessName}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--border)] shrink-0" />

          {/* Stats row */}
          <div className="flex gap-4 shrink-0">
            <div className="text-center">
              <div className="text-[13px] text-[var(--accent)] mono leading-none">{m.revenue}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[var(--text-primary)] mono leading-none">{activeDepts}/{m.departments.length}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Depts</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[var(--text-primary)] mono leading-none">{activeWorkers}/{workerCount}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Agents</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[var(--text-primary)] mono leading-none">{m.buildQueue.length}</div>
              <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Queue</div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--border)] shrink-0" />

          {/* Objective snippet */}
          <div className="w-48 shrink-0">
            <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Objective</div>
            <div className="text-[10px] text-[var(--text-secondary)] leading-snug truncate">{m.objective}</div>
          </div>

          {/* Expand indicator */}
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={`shrink-0 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`}
          >
            <path d="M5 3l4 4-4 4" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Bottom ambient glow */}
        {isSelected && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)' }}
          />
        )}
      </div>
    </button>
  );
}

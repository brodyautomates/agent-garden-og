'use client';

import { ActivityEntry } from '@/lib/types';

interface Props {
  activity: ActivityEntry[];
  onClickAgent: (agentId: string) => void;
}

export default function ActivityFeed({ activity, onClickAgent }: Props) {
  return (
    <div className="h-full flex flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <div className="text-[12px] text-[var(--text-primary)]">Activity</div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Live event stream</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
            style={{ animation: 'pulse-dot 1.5s infinite' }}
          />
          <span className="text-[9px] text-[var(--text-muted)] mono">LIVE</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {activity.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">No activity yet</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-50">Waiting for agents</p>
          </div>
        )}
        {activity.map((entry, i) => (
          <div
            key={entry.id}
            className="px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all duration-150 group"
            onClick={() => onClickAgent(entry.agentId)}
            style={{ animation: `slide-in 0.3s ease ${i * 0.03}s both` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                {entry.agentName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums mono">{entry.timestamp}</span>
            </div>
            <div className="text-[12px] text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors">
              {entry.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

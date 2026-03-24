'use client';

import { Agent } from '@/lib/types';

const statusColor: Record<string, string> = {
  active: '#00ff88',
  idle: '#4a4a5e',
  error: '#ff4466',
};

// Per-agent SVG icons
function AgentIcon({ agentId, color }: { agentId: string; color: string }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (agentId) {
    // Lead Scraper — crosshair/target
    case 'lead-scraper':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    // Cold Emailer — send/paper plane
    case 'cold-emailer':
      return (
        <svg {...props}>
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      );
    // Lead Scorer — bar chart / ranking
    case 'lead-scorer':
      return (
        <svg {...props}>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      );
    // Ad Builder — brush/wand
    case 'ad-builder':
      return (
        <svg {...props}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
          <path d="M18 18l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" opacity="0.5" />
        </svg>
      );
    // Ad Auditor — shield check
    case 'ad-auditor':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    // Content Repurposer — scissors/split
    case 'content-repurposer':
      return (
        <svg {...props}>
          <path d="M4 20l7-7M14 14l7 7M4 4l16 16" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
        </svg>
      );
    // Content Scheduler — calendar clock
    case 'content-scheduler':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="16" r="2.5" />
          <path d="M12 14.5V16l1 1" />
        </svg>
      );
    // Brand Scout — binoculars/compass
    case 'brand-scout':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v4M12 17v4" />
          <path d="M3 12h4M17 12h4" />
          <path d="M12 12l3-3" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </svg>
      );
    // Deal Pitcher — handshake/megaphone
    case 'deal-pitcher':
      return (
        <svg {...props}>
          <path d="M3 11l6-4v16l-6-4V11Z" />
          <path d="M9 8l9-4v20l-9-4" />
          <path d="M19 10c1.5 1 1.5 3 0 4" />
        </svg>
      );
    // Chad — crown
    case 'chad':
      return (
        <svg {...props}>
          <path d="M2 20h20M4 20l2-14 4 6 2-8 2 8 4-6 2 14" />
        </svg>
      );
    // Iris — eye (lead gen, finding prospects)
    case 'iris':
      return (
        <svg {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
  }
}

interface Props {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AgentRegistry({ agents, selectedId, onSelect }: Props) {
  const categories = [...new Set(agents.map((a) => a.category))];

  return (
    <div className="h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="text-[12px] font-semibold text-[var(--text-primary)]">Agents</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 mono">
          {agents.filter(a => a.status === 'active').length} active / {agents.length} total
        </div>
      </div>

      {/* Agent list grouped by category */}
      <div className="flex-1 overflow-y-auto py-1">
        {agents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">No agents deployed</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-50">The garden is empty</p>
          </div>
        )}
        {categories.map((cat) => (
          <div key={cat}>
            <div className="px-4 pt-3 pb-1.5">
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-[0.1em]">
                {cat}
              </span>
            </div>
            {agents
              .filter((a) => a.category === cat)
              .map((agent) => {
                const isSelected = selectedId === agent.id;
                const iconColor = isSelected ? 'var(--accent)' : 'var(--text-muted)';
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelect(agent.id)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-[var(--accent-glow)]'
                        : 'hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {/* Agent icon */}
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--border-active)' : 'var(--border)'}`,
                      }}
                    >
                      <AgentIcon agentId={agent.id} color={iconColor} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[12px] font-medium truncate ${
                            isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {agent.name}
                        </span>
                      </div>
                      {agent.brand && (
                        <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{agent.brand}</div>
                      )}
                    </div>

                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: statusColor[agent.status],
                        animation: agent.status === 'active' ? 'pulse-dot 2s infinite' : 'none',
                        boxShadow: agent.status === 'active' ? '0 0 6px rgba(0, 255, 136, 0.4)' : 'none',
                      }}
                    />
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

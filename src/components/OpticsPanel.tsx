'use client';

import { Agent, OpticsMission, AgentCommunication, AgentRunReport } from '@/lib/types';

const commTypeColor: Record<string, string> = {
  dispatch: '#00ff88',
  report: '#66aaff',
  'data-transfer': '#e8e8ed',
  error: '#ff4466',
};

const commTypeLabel: Record<string, string> = {
  dispatch: 'DISPATCH',
  report: 'REPORT',
  'data-transfer': 'DATA',
  error: 'ERROR',
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <span className="text-[var(--accent)]">&#10003;</span>;
    case 'error':
      return <span className="text-[var(--error)]">&#10007;</span>;
    case 'running':
      return (
        <span
          className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent', animation: 'spin-slow 1s linear infinite' }}
        />
      );
    default:
      return <span className="text-[var(--text-muted)]">&#8212;</span>;
  }
};

interface Props {
  missions: OpticsMission[];
  agents: Agent[];
  activeTab: 'activity' | 'optics';
  onSwitchTab: (tab: 'activity' | 'optics') => void;
}

export default function OpticsPanel({ missions, agents, activeTab, onSwitchTab }: Props) {
  const latestMission = missions[missions.length - 1] ?? null;

  return (
    <div className="h-full flex flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Tabbed Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => onSwitchTab('activity')}
            className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: activeTab === 'activity' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'activity' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Activity
          </button>
          <button
            onClick={() => onSwitchTab('optics')}
            className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: activeTab === 'optics' ? 'var(--accent-dim)' : 'transparent',
              color: activeTab === 'optics' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Optics
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-[var(--text-primary)]">Optics</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Mission Control</div>
          </div>
          {latestMission && latestMission.status === 'running' && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" style={{ animation: 'pulse-dot 1s infinite' }} />
              <span className="text-[9px] text-[var(--accent)] mono">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l2 2" />
              </svg>
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">No missions yet</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-50">Run an agent to see output here</p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-3">
            {/* Render missions in reverse (latest first) */}
            {[...missions].reverse().map((mission) => (
              <MissionCard key={mission.id} mission={mission} agents={agents} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MissionCard({ mission, agents }: { mission: OpticsMission; agents: Agent[] }) {
  const reportCount = mission.reports.length;
  const successCount = mission.reports.filter(r => r.status === 'success').length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border)',
        boxShadow: mission.status === 'running' ? '0 0 20px rgba(0, 255, 136, 0.05)' : 'none',
      }}
    >
      {/* Mission Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusIcon(mission.status)}
          <span className="text-[11px] text-[var(--text-primary)]">Mission</span>
          <span className="text-[9px] text-[var(--text-muted)] mono">{mission.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[var(--text-muted)] mono">{successCount}/{reportCount} agents</span>
          <span className="text-[9px] text-[var(--text-muted)] mono">{mission.startedAt}</span>
        </div>
      </div>

      {/* Deliverables */}
      {mission.reports.length > 0 && (
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Deliverables</div>
          <div className="space-y-1.5">
            {mission.reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* Communication Timeline */}
      {mission.communications.length > 0 && (
        <div className="px-3 py-2">
          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Comms</div>
          <div className="relative pl-3">
            {/* Timeline line */}
            <div
              className="absolute left-[3px] top-1 bottom-1 w-px"
              style={{ background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
            />
            <div className="space-y-1.5">
              {mission.communications.map((comm, i) => (
                <CommEntry key={comm.id} comm={comm} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: AgentRunReport }) {
  return (
    <div
      className="px-2.5 py-2 rounded-lg flex items-start gap-2"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        animation: report.status === 'running' ? 'glow-pulse 2s infinite' : undefined,
      }}
    >
      <div className="mt-0.5 shrink-0">{statusIcon(report.status)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--accent)]">{report.agentName}</span>
          {report.duration && <span className="text-[9px] text-[var(--text-muted)] mono">{report.duration}</span>}
        </div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{report.outputSummary}</div>
        {report.error && (
          <div className="text-[9px] text-[var(--error)] mt-1 mono">{report.error}</div>
        )}
      </div>
    </div>
  );
}

function CommEntry({ comm, index }: { comm: AgentCommunication; index: number }) {
  const color = commTypeColor[comm.type];

  return (
    <div
      className="flex items-start gap-2"
      style={{ animation: `slide-in 0.3s ease ${index * 0.05}s both` }}
    >
      {/* Timeline dot */}
      <div className="w-[7px] h-[7px] rounded-full shrink-0 mt-1 -ml-[5px]" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-[var(--text-secondary)]">{comm.fromAgentName}</span>
          <span className="text-[8px] text-[var(--text-muted)]">&rarr;</span>
          <span className="text-[9px] text-[var(--text-secondary)]">{comm.toAgentName}</span>
          <span className="text-[7px] uppercase tracking-wider px-1 py-px rounded" style={{ color, background: `${color}15` }}>
            {commTypeLabel[comm.type]}
          </span>
        </div>
        <div className="text-[9px] text-[var(--text-muted)] mt-0.5 leading-snug">{comm.message}</div>
      </div>
      <span className="text-[8px] text-[var(--text-muted)] mono shrink-0 mt-0.5">{comm.timestamp}</span>
    </div>
  );
}

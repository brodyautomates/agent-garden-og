'use client';

import { Agent, ActivityEntry, Department, AgentBlueprint } from '@/lib/types';

const deptStatusColor: Record<string, string> = {
  active: '#00ff88',
  building: '#ffaa00',
  planned: '#4a4a5e',
};

const deptStatusLabel: Record<string, string> = {
  active: 'Active',
  building: 'Building',
  planned: 'Planned',
};

const queueStatusColor: Record<string, string> = {
  queued: '#4a4a5e',
  building: '#ffaa00',
  deployed: '#00ff88',
};

interface Props {
  agent: Agent;
  agents: Agent[];
  activity: ActivityEntry[];
}

export default function MasterWorkspace({ agent, agents, activity }: Props) {
  const m = agent.master!;
  const agentActivity = activity.filter((a) => a.agentId === agent.id).slice(0, 10);
  const workerCount = agents.filter((a) => a.role === 'worker').length;
  const activeWorkers = agents.filter((a) => a.role === 'worker' && a.status === 'active').length;

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] border-x border-[var(--border)]">
      {/* Chad header — distinct from regular agents */}
      <div className="px-5 py-4 border-b border-[var(--border)] bg-gradient-to-r from-[rgba(0,255,136,0.04)] to-transparent">
        <div className="flex items-center gap-3 mb-3">
          {/* Crown icon for master */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.05))',
              border: '1px solid var(--border-active)',
              animation: 'glow-pulse 3s infinite',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M4 20l2-14 4 6 2-8 2 8 4-6 2 14" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[17px] text-[var(--text-primary)]">{agent.name}</h2>
              <span className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                Master
              </span>
              <span className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]" style={{ animation: 'pulse-dot 2s infinite' }}>
                Online
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Objective + Revenue */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex gap-1">
        <div className="flex-1 py-2.5 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.06em] mb-1">Objective</div>
          <div className="text-[12px] text-[var(--text-primary)] leading-snug">{m.objective}</div>
        </div>
        <div className="w-28 shrink-0 py-2.5 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.06em] mb-1">Revenue</div>
          <div className="text-[16px] text-[var(--accent)] mono">{m.revenue}</div>
        </div>
      </div>

      {/* Business Identity */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Business</h3>
        <div className="space-y-2">
          <div className="flex gap-3">
            <span className="text-[11px] text-[var(--text-muted)] w-20 shrink-0">Name</span>
            <span className="text-[12px] text-[var(--text-secondary)]">{m.businessName}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[11px] text-[var(--text-muted)] w-20 shrink-0">Model</span>
            <span className="text-[12px] text-[var(--text-secondary)]">{m.businessModel}</span>
          </div>
        </div>
      </div>

      {/* Workforce stats */}
      <div className="px-5 py-3 border-b border-[var(--border)] flex gap-1">
        {[
          { label: 'Departments', value: m.departments.length.toString() },
          { label: 'Agents built', value: workerCount.toString() },
          { label: 'Active workers', value: activeWorkers.toString() },
          { label: 'Build queue', value: m.buildQueue.length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 py-2 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.06em] mb-0.5">{stat.label}</div>
            <div className="text-[14px] text-[var(--text-primary)] mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Departments */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Departments</h3>
        <div className="space-y-1.5">
          {m.departments.map((dept) => (
            <DepartmentRow key={dept.name} dept={dept} agents={agents} />
          ))}
        </div>
      </div>

      {/* Build Queue */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Agent Build Queue</h3>
        {m.buildQueue.length === 0 ? (
          <div className="text-[12px] text-[var(--text-muted)] py-2 text-center rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
            Queue empty — Chad will populate this after selecting a business model
          </div>
        ) : (
          <div className="space-y-1.5">
            {m.buildQueue.map((bp, i) => (
              <BlueprintRow key={bp.name} blueprint={bp} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Directives */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Directives</h3>
        <div className="space-y-1">
          {m.directives.map((d, i) => (
            <div key={i} className="flex gap-2.5 py-1.5">
              <span className="text-[10px] text-[var(--accent)] mono shrink-0 mt-px">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Constraints</h3>
        <div className="space-y-1">
          {m.constraints.map((c, i) => (
            <div key={i} className="flex gap-2.5 py-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 mt-0.5">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="var(--text-muted)" strokeWidth="1" />
              </svg>
              <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">System Prompt</h3>
        <div className="text-[12px] text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] px-4 py-3 rounded-lg leading-relaxed mono">
          {agent.config.prompt}
        </div>
      </div>

      {/* Activity */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Chad&apos;s Activity</h3>
        {agentActivity.length === 0 ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">No activity yet</div>
        ) : (
          <div className="space-y-0">
            {agentActivity.map((entry, i) => (
              <div
                key={entry.id}
                className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0"
                style={{ animation: `slide-in 0.3s ease ${i * 0.05}s both` }}
              >
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums mono pt-px">{entry.timestamp}</span>
                <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{entry.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DepartmentRow({ dept, agents }: { dept: Department; agents: Agent[] }) {
  const deptAgents = agents.filter((a) => dept.agentIds.includes(a.id));
  const color = deptStatusColor[dept.status];

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--text-primary)]">{dept.name}</span>
          <span className="text-[10px] uppercase tracking-[0.05em]" style={{ color }}>
            {deptStatusLabel[dept.status]}
          </span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{dept.description}</div>
      </div>
      <span className="text-[10px] text-[var(--text-muted)] mono shrink-0">
        {deptAgents.length} agent{deptAgents.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

function BlueprintRow({ blueprint, index }: { blueprint: AgentBlueprint; index: number }) {
  const color = queueStatusColor[blueprint.status];

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      <span className="text-[10px] text-[var(--text-muted)] mono w-5 shrink-0">#{index + 1}</span>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--text-primary)]">{blueprint.name}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{blueprint.department}</span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{blueprint.purpose}</div>
      </div>
    </div>
  );
}

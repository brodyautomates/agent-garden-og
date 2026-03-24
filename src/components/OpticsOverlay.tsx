'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface Lead {
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin?: string;
  industry: string;
  employees: number;
  location: string;
  icpScore: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missions: OpticsMission[];
  agents: Agent[];
}

export default function OpticsOverlay({ isOpen, onClose, missions, agents }: Props) {
  const [selectedMission, setSelectedMission] = useState(0);
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Keep selected mission in bounds
  useEffect(() => {
    if (selectedMission >= missions.length && missions.length > 0) {
      setSelectedMission(missions.length - 1);
    }
  }, [missions.length, selectedMission]);

  // Compute analytics across all missions
  const analytics = useMemo(() => {
    const allReports = missions.flatMap(m => m.reports);
    const allLeads: Lead[] = [];
    let totalLeadsCount = 0;

    allReports.forEach(r => {
      if (r.output) {
        const out = r.output as Record<string, unknown>;
        totalLeadsCount += (out.leadsFound as number) || 0;
        const leads = (out.leads || []) as Lead[];
        allLeads.push(...leads);
      }
    });

    const avgIcp = allLeads.length > 0
      ? Math.round(allLeads.reduce((s, l) => s + l.icpScore, 0) / allLeads.length)
      : 0;

    const successCount = allReports.filter(r => r.status === 'success').length;
    const successRate = allReports.length > 0 ? Math.round((successCount / allReports.length) * 100) : 0;

    const durations = allReports.map(r => r.duration ? parseFloat(r.duration) : 0).filter(d => d > 0);
    const avgDuration = durations.length > 0 ? (durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1) : '—';

    const pipelineValue = totalLeadsCount * 1900;

    const agentBreakdown: Record<string, { runs: number; lastSummary: string }> = {};
    allReports.forEach(r => {
      if (!agentBreakdown[r.agentId]) {
        agentBreakdown[r.agentId] = { runs: 0, lastSummary: '' };
      }
      agentBreakdown[r.agentId].runs++;
      agentBreakdown[r.agentId].lastSummary = r.outputSummary;
    });

    return { totalLeadsCount, avgIcp, pipelineValue, successRate, avgDuration, missions: missions.length, agentBreakdown };
  }, [missions]);

  if (!isOpen) return null;

  const mission = missions[selectedMission] ?? null;

  // Extract leads from selected mission
  const missionLeads: Lead[] = mission
    ? mission.reports.flatMap(r => {
        const out = r.output as Record<string, unknown> | null;
        return ((out?.leads || []) as Lead[]);
      })
    : [];

  return (
    <div className="fixed inset-0 z-50" style={{ animation: 'overlay-in 200ms ease-out' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      />

      {/* Main container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-[1400px] h-[90vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
          style={{
            background: 'rgba(12, 12, 18, 0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            boxShadow: '0 0 80px rgba(0, 255, 136, 0.04), 0 32px 100px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Header */}
          <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ animation: 'pulse-dot 2s infinite', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }} />
                <h2 className="text-[16px] text-[var(--text-primary)] tracking-wide uppercase">Optics</h2>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">Mission Control</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--text-muted)] mono">{missions.length} missions</span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Agent filter + Mission tabs */}
          {missions.length > 0 && (
            <div className="shrink-0 px-6 py-2 border-b border-[var(--border)]">
              {/* Agent filter pills */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mr-1">Filter:</span>
                {[null, ...Array.from(new Set(missions.flatMap(m => m.reports.map(r => r.agentId))))].map((id) => {
                  const label = id === null ? 'ALL' : agents.find(a => a.id === id)?.name || id;
                  const isActive = agentFilter === id;
                  return (
                    <button
                      key={id ?? 'all'}
                      onClick={() => { setAgentFilter(id); setSelectedMission(0); }}
                      className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-all"
                      style={{
                        background: isActive ? 'var(--accent-dim)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {/* Mission tabs (filtered) */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(agentFilter ? missions.filter(m => m.reports.some(r => r.agentId === agentFilter)) : missions).map((m, i) => {
                  const globalIdx = missions.indexOf(m);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMission(globalIdx)}
                      className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all shrink-0"
                      style={{
                        background: selectedMission === globalIdx ? 'var(--accent-dim)' : 'transparent',
                        color: selectedMission === globalIdx ? 'var(--accent)' : 'var(--text-muted)',
                        border: selectedMission === globalIdx ? '1px solid var(--border-active)' : '1px solid transparent',
                      }}
                    >
                      Mission {String(globalIdx + 1).padStart(3, '0')}
                      <span className="ml-1.5 text-[8px] opacity-60">{m.startedAt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Three-column content */}
          <div className="flex-1 flex min-h-0">
            {/* Left — Analytics */}
            <div className="w-56 shrink-0 border-r border-[var(--border)] overflow-y-auto p-4 space-y-3">
              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1">Analytics</div>

              <MetricCard label="Total Leads" value={analytics.totalLeadsCount.toString()} accent />
              <MetricCard label="Avg ICP Score" value={analytics.avgIcp.toString()} />
              <MetricCard label="Pipeline Value" value={`$${analytics.pipelineValue.toLocaleString()}`} accent />
              <MetricCard label="Missions Run" value={analytics.missions.toString()} />
              <MetricCard label="Success Rate" value={`${analytics.successRate}%`} />
              <MetricCard label="Avg Duration" value={`${analytics.avgDuration}s`} />

              {/* Per-agent breakdown */}
              {Object.keys(analytics.agentBreakdown).length > 0 && (
                <>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-4 mb-1">Agents</div>
                  {Object.entries(analytics.agentBreakdown).map(([agentId, data]) => {
                    const agent = agents.find(a => a.id === agentId);
                    return (
                      <div key={agentId} className="px-2.5 py-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--accent)]">{agent?.name || agentId}</span>
                          <span className="text-[9px] text-[var(--text-muted)] mono">{data.runs} runs</span>
                        </div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-1 leading-snug truncate">{data.lastSummary}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Center — Outputs */}
            <div className="flex-1 min-w-0 overflow-y-auto p-4">
              {!mission ? (
                <div className="flex items-center justify-center h-full text-[12px] text-[var(--text-muted)]">No missions to display</div>
              ) : (
                <div>
                  {/* Report summaries */}
                  {mission.reports.map(report => (
                    <div key={report.id} className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <StatusIcon status={report.status} />
                        <span className="text-[12px] text-[var(--accent)]">{report.agentName}</span>
                        <span className="text-[10px] text-[var(--text-muted)] mono">{report.duration}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">&#183;</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{report.outputSummary}</span>
                      </div>
                    </div>
                  ))}

                  {/* Agent-specific output rendering */}
                  {mission.reports.map(report => {
                    const out = report.output as Record<string, unknown> | null;
                    if (!out) return null;

                    // Iris — lead cards
                    if (report.agentId === 'iris' && out.leads) {
                      const leads = (out.leads || []) as Lead[];
                      return (
                        <div key={`out-${report.id}`}>
                          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-3">Leads ({leads.length})</div>
                          <div className="space-y-2">{leads.map((lead, i) => <LeadCard key={i} lead={lead} />)}</div>
                        </div>
                      );
                    }

                    // Architect — package preview
                    if (report.agentId === 'architect' && out.type === 'client-package') {
                      const lpc = out.landingPageCopy as Record<string, unknown> | undefined;
                      const icp = out.icp as Record<string, unknown> | undefined;
                      const emails = (out.emailSequences || []) as { subject: string; sendDay: number }[];
                      return (
                        <div key={`out-${report.id}`} className="space-y-2">
                          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Client Package</div>
                          {icp && (
                            <div className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                              <div className="text-[10px] text-[var(--accent)] mb-1">ICP</div>
                              <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{icp.description as string}</div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {((icp.titles || []) as string[]).map((t, i) => (
                                  <span key={i} className="text-[8px] px-1.5 py-px rounded bg-[var(--accent-dim)] text-[var(--accent)]">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {emails.length > 0 && (
                            <div className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                              <div className="text-[10px] text-[var(--accent)] mb-1">Email Sequence ({emails.length} emails)</div>
                              {emails.map((e, i) => (
                                <div key={i} className="text-[9px] text-[var(--text-muted)] py-0.5">Day {e.sendDay}: {e.subject}</div>
                              ))}
                            </div>
                          )}
                          {lpc && (
                            <div className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                              <div className="text-[10px] text-[var(--accent)] mb-1">Landing Page</div>
                              <div className="text-[13px] text-[var(--text-primary)]">{lpc.headline as string}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{lpc.subheadline as string}</div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Forge — page preview
                    if (report.agentId === 'forge' && out.type === 'landing-page' && out.html) {
                      return (
                        <div key={`out-${report.id}`}>
                          <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Landing Page</div>
                          <div className="rounded-lg overflow-hidden border border-[var(--border)]">
                            <iframe srcDoc={out.html as string} sandbox="allow-scripts" className="w-full h-[250px] border-0" title="Page preview" />
                          </div>
                          {typeof out.deployUrl === 'string' && out.deployUrl && (
                            <a href={out.deployUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--accent)] hover:underline mono mt-2 block">
                              {out.deployUrl}
                            </a>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Right — Communications */}
            <div className="w-72 shrink-0 border-l border-[var(--border)] overflow-y-auto p-4">
              <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-3">Communications</div>
              {mission && mission.communications.length > 0 ? (
                <div className="relative pl-3">
                  <div
                    className="absolute left-[3px] top-1 bottom-1 w-px"
                    style={{ background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
                  />
                  <div className="space-y-2.5">
                    {mission.communications.map((comm, i) => (
                      <CommEntry key={comm.id} comm={comm} index={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[var(--text-muted)] text-center py-8">No communications</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-[16px] mono leading-none ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const icpColor = lead.icpScore >= 90 ? '#00ff88' : lead.icpScore >= 70 ? '#ffaa00' : '#ff4466';

  return (
    <div
      className="px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] text-[var(--text-primary)]">{lead.name}</span>
            {lead.linkedin && (
              <a href={`https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[var(--accent)] hover:underline">
                LinkedIn
              </a>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)]">{lead.title}</div>
          <div className="text-[10px] text-[var(--text-muted)] mt-1">
            {lead.company} &#183; {lead.industry} &#183; {lead.employees} employees &#183; {lead.location}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] mono text-[var(--accent)]">{lead.email}</div>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <span className="text-[9px] text-[var(--text-muted)]">ICP</span>
            <span className="text-[12px] mono" style={{ color: icpColor }}>{lead.icpScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <span className="text-[var(--accent)] text-[12px]">&#10003;</span>;
  if (status === 'error') return <span className="text-[var(--error)] text-[12px]">&#10007;</span>;
  if (status === 'running') return (
    <span className="inline-block w-3 h-3 rounded-full border-2 border-t-transparent"
      style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent', animation: 'spin-slow 1s linear infinite' }} />
  );
  return <span className="text-[var(--text-muted)]">&#8212;</span>;
}

function CommEntry({ comm, index }: { comm: AgentCommunication; index: number }) {
  const color = commTypeColor[comm.type];
  return (
    <div className="flex items-start gap-2" style={{ animation: `slide-in 0.3s ease ${index * 0.05}s both` }}>
      <div className="w-[7px] h-[7px] rounded-full shrink-0 mt-1.5 -ml-[5px]" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap mb-0.5">
          <span className="text-[10px] text-[var(--text-secondary)]">{comm.fromAgentName}</span>
          <span className="text-[8px] text-[var(--text-muted)]">&rarr;</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{comm.toAgentName}</span>
          <span className="text-[7px] uppercase tracking-wider px-1 py-px rounded" style={{ color, background: `${color}15` }}>
            {commTypeLabel[comm.type]}
          </span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] leading-snug">{comm.message}</div>
        <div className="text-[8px] text-[var(--text-muted)] mono mt-1 opacity-60">{comm.timestamp}</div>
      </div>
    </div>
  );
}

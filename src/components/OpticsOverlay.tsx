'use client';

import { useState, useEffect, useMemo } from 'react';
import { Agent, OpticsMission, AgentCommunication, AgentRunReport } from '@/lib/types';

interface Lead {
  name: string; title: string; company: string; email: string;
  linkedin?: string; industry: string; employees: number; location: string; icpScore: number;
}

const glass = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const glassAccent = {
  ...glass,
  border: '1px solid rgba(0, 255, 136, 0.12)',
  boxShadow: '0 0 20px rgba(0, 255, 136, 0.03)',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missions: OpticsMission[];
  agents: Agent[];
}

export default function OpticsOverlay({ isOpen, onClose, missions, agents }: Props) {
  const [selectedMission, setSelectedMission] = useState(0);
  const [view, setView] = useState<'overview' | 'mission'>('overview');

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const stats = useMemo(() => {
    const reports = missions.flatMap(m => m.reports);
    const leads: Lead[] = [];
    let totalLeads = 0;
    reports.forEach(r => {
      const out = r.output as Record<string, unknown> | null;
      if (out) {
        totalLeads += (out.leadsFound as number) || 0;
        leads.push(...((out.leads || []) as Lead[]));
      }
    });
    const avgIcp = leads.length ? Math.round(leads.reduce((s, l) => s + l.icpScore, 0) / leads.length) : 0;
    const successRate = reports.length ? Math.round(reports.filter(r => r.status === 'success').length / reports.length * 100) : 0;
    const durations = reports.map(r => r.duration ? parseFloat(r.duration) : 0).filter(d => d > 0);
    const avgDur = durations.length ? (durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1) : '—';
    return { totalLeads, avgIcp, pipeline: totalLeads * 1900, successRate, avgDur, missionCount: missions.length };
  }, [missions]);

  if (!isOpen) return null;

  const mission = missions[selectedMission] ?? null;

  return (
    <div className="fixed inset-0 z-50" style={{ animation: 'overlay-in 200ms ease-out' }}>
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }} />

      {/* Container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-[1200px] h-[88vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
          style={{ background: 'rgba(10, 10, 15, 0.92)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.06)', boxShadow: '0 40px 120px rgba(0, 0, 0, 0.7)' }}>

          {/* Header */}
          <div className="shrink-0 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" style={{ animation: 'pulse-dot 2s infinite', boxShadow: '0 0 12px rgba(0,255,136,0.4)' }} />
              <h2 className="text-[18px] text-[var(--text-primary)] tracking-wide uppercase">Optics</h2>
              <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
              <div className="flex gap-1">
                <button onClick={() => setView('overview')}
                  className="px-3 py-1 rounded-lg text-[11px] transition-all"
                  style={{ background: view === 'overview' ? 'rgba(0,255,136,0.1)' : 'transparent', color: view === 'overview' ? 'var(--accent)' : 'var(--text-muted)' }}>
                  Overview
                </button>
                <button onClick={() => setView('mission')}
                  className="px-3 py-1 rounded-lg text-[11px] transition-all"
                  style={{ background: view === 'mission' ? 'rgba(0,255,136,0.1)' : 'transparent', color: view === 'mission' ? 'var(--accent)' : 'var(--text-muted)' }}>
                  Missions
                </button>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {view === 'overview' ? (
              <OverviewView stats={stats} missions={missions} agents={agents} onSelectMission={(i) => { setSelectedMission(i); setView('mission'); }} />
            ) : (
              <MissionView missions={missions} agents={agents} selectedMission={selectedMission} onSelectMission={setSelectedMission} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ OVERVIEW VIEW ============ */
function OverviewView({ stats, missions, agents, onSelectMission }: {
  stats: { totalLeads: number; avgIcp: number; pipeline: number; successRate: number; avgDur: string; missionCount: number };
  missions: OpticsMission[]; agents: Agent[]; onSelectMission: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard accent>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Total Leads</div>
          <div className="text-[28px] text-[var(--accent)] mono leading-none">{stats.totalLeads}</div>
        </GlassCard>
        <GlassCard accent>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Pipeline Value</div>
          <div className="text-[28px] text-[var(--accent)] mono leading-none">${stats.pipeline.toLocaleString()}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Success Rate</div>
          <div className="text-[28px] text-[var(--text-primary)] mono leading-none">{stats.successRate}%</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <GlassCard>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Missions</div>
          <div className="text-[22px] text-[var(--text-primary)] mono leading-none">{stats.missionCount}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Avg ICP Score</div>
          <div className="text-[22px] text-[var(--text-primary)] mono leading-none">{stats.avgIcp}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Avg Duration</div>
          <div className="text-[22px] text-[var(--text-primary)] mono leading-none">{stats.avgDur}s</div>
        </GlassCard>
      </div>

      {/* Recent Missions */}
      <div>
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest mb-3">Recent Missions</div>
        <div className="space-y-2">
          {[...missions].reverse().map((m, ri) => {
            const i = missions.length - 1 - ri;
            const agentNames = [...new Set(m.reports.map(r => r.agentName))].join(', ');
            return (
              <button key={m.id} onClick={() => onSelectMission(i)}
                className="w-full text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ ...glass, cursor: 'pointer' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.status === 'success' ? '#00ff88' : m.status === 'error' ? '#ff4466' : '#ffaa00' }} />
                    <span className="text-[12px] text-[var(--text-primary)]">Mission {String(i + 1).padStart(3, '0')}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] mono">{m.startedAt}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                  <span>{m.reports.length} report{m.reports.length !== 1 ? 's' : ''}</span>
                  <span>{m.communications.length} comms</span>
                  <span>{agentNames}</span>
                </div>
                {m.reports[0] && (
                  <div className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed truncate">{m.reports[0].outputSummary}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ MISSION VIEW ============ */
function MissionView({ missions, agents, selectedMission, onSelectMission }: {
  missions: OpticsMission[]; agents: Agent[]; selectedMission: number; onSelectMission: (i: number) => void;
}) {
  const mission = missions[selectedMission] ?? null;

  return (
    <div className="space-y-6">
      {/* Mission Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {missions.map((m, i) => (
          <button key={m.id} onClick={() => onSelectMission(i)}
            className="px-4 py-2 rounded-xl text-[11px] transition-all shrink-0"
            style={selectedMission === i ? glassAccent : glass}>
            <span style={{ color: selectedMission === i ? 'var(--accent)' : 'var(--text-muted)' }}>
              Mission {String(i + 1).padStart(3, '0')}
            </span>
          </button>
        ))}
      </div>

      {!mission ? (
        <div className="text-[12px] text-[var(--text-muted)] text-center py-16">No mission selected</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Reports + Outputs */}
          <div className="space-y-4">
            {mission.reports.map(report => {
              const out = report.output as Record<string, unknown> | null;

              return (
                <div key={report.id} className="rounded-xl p-5" style={glassAccent}>
                  {/* Report Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: report.status === 'success' ? '#00ff88' : '#ff4466' }} />
                      <span className="text-[13px] text-[var(--accent)]">{report.agentName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] mono">{report.duration}</span>
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)] mono">{report.completedAt || '—'}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mb-4 leading-relaxed">{String(report.outputSummary)}</div>
                  <ReportOutput report={report} />
                </div>
              );
            })}
          </div>

          {/* Right: Communications */}
          <div className="rounded-xl p-5" style={glass}>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest mb-4">Communications</div>
            {mission.communications.length === 0 ? (
              <div className="text-[11px] text-[var(--text-muted)] text-center py-8">No comms</div>
            ) : (
              <div className="space-y-3">
                {mission.communications.map((comm, i) => (
                  <CommCard key={comm.id} comm={comm} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ SHARED COMPONENTS ============ */

function GlassCard({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={accent ? glassAccent : glass}>
      {children}
    </div>
  );
}

const commColors: Record<string, string> = { dispatch: '#00ff88', report: '#66aaff', 'data-transfer': '#e8e8ed', error: '#ff4466' };
const commLabels: Record<string, string> = { dispatch: 'DISPATCH', report: 'REPORT', 'data-transfer': 'DATA', error: 'ERROR' };

function CommCard({ comm, index }: { comm: AgentCommunication; index: number }) {
  const color = commColors[comm.type] || '#8b8b9e';
  return (
    <div className="rounded-lg p-3" style={{ ...glass, animation: `slide-in 0.3s ease ${index * 0.05}s both` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] text-[var(--text-secondary)]">{comm.fromAgentName}</span>
        <span className="text-[8px] text-[var(--text-muted)]">&rarr;</span>
        <span className="text-[10px] text-[var(--text-secondary)]">{comm.toAgentName}</span>
        <span className="text-[7px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ color, background: `${color}12` }}>{commLabels[comm.type]}</span>
        <span className="text-[8px] text-[var(--text-muted)] mono ml-auto">{comm.timestamp}</span>
      </div>
      <div className="text-[10px] text-[var(--text-muted)] leading-relaxed">{comm.message}</div>
    </div>
  );
}

function ReportOutput({ report }: { report: AgentRunReport }) {
  const out = report.output as Record<string, unknown> | null;
  if (!out) return null;

  // Iris — leads
  if (report.agentId === 'iris' && Array.isArray(out.leads)) {
    const leads = out.leads as Lead[];
    return (
      <div className="space-y-2">
        <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest">Leads</div>
        {leads.slice(0, 5).map((lead, i) => (
          <div key={i} className="rounded-lg p-3" style={glass}>
            <div className="flex justify-between">
              <div>
                <div className="text-[12px] text-[var(--text-primary)]">{lead.name}</div>
                <div className="text-[10px] text-[var(--text-secondary)]">{lead.title} · {lead.company}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[var(--accent)] mono">{lead.email}</div>
                <div className="text-[10px] mono mt-0.5" style={{ color: lead.icpScore >= 90 ? '#00ff88' : lead.icpScore >= 70 ? '#ffaa00' : '#ff4466' }}>ICP {lead.icpScore}</div>
              </div>
            </div>
          </div>
        ))}
        {leads.length > 5 && <div className="text-[9px] text-[var(--text-muted)] text-center py-1">+{leads.length - 5} more</div>}
      </div>
    );
  }

  // Architect — package
  if (report.agentId === 'architect' && out.type === 'client-package') {
    const icp = out.icp as Record<string, unknown> | undefined;
    const emails = out.emailSequences as { subject: string; sendDay: number }[] | undefined;
    const lpc = out.landingPageCopy as Record<string, string> | undefined;
    return (
      <div className="space-y-2">
        {icp && (
          <div className="rounded-lg p-3" style={glass}>
            <div className="text-[9px] text-[var(--accent)] uppercase tracking-widest mb-1">ICP</div>
            <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{String(icp.description)}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {((icp.titles || []) as string[]).map((t, i) => (
                <span key={i} className="text-[8px] px-2 py-0.5 rounded-full bg-[rgba(0,255,136,0.08)] text-[var(--accent)]">{t}</span>
              ))}
            </div>
          </div>
        )}
        {emails && emails.length > 0 && (
          <div className="rounded-lg p-3" style={glass}>
            <div className="text-[9px] text-[var(--accent)] uppercase tracking-widest mb-1">Emails ({emails.length})</div>
            {emails.map((e, i) => (
              <div key={i} className="text-[10px] text-[var(--text-muted)] py-0.5">Day {e.sendDay} · {e.subject}</div>
            ))}
          </div>
        )}
        {lpc && (
          <div className="rounded-lg p-3" style={glass}>
            <div className="text-[9px] text-[var(--accent)] uppercase tracking-widest mb-1">Landing Page</div>
            <div className="text-[14px] text-[var(--text-primary)]">{lpc.headline}</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{lpc.subheadline}</div>
          </div>
        )}
      </div>
    );
  }

  // Forge — page preview
  if (report.agentId === 'forge' && out.type === 'landing-page' && typeof out.html === 'string') {
    return (
      <div className="space-y-2">
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <iframe srcDoc={out.html} sandbox="allow-scripts" className="w-full h-[200px] border-0" title="Page" />
        </div>
        {typeof out.deployUrl === 'string' && (
          <a href={out.deployUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--accent)] hover:underline mono block">{out.deployUrl}</a>
        )}
      </div>
    );
  }

  return null;
}

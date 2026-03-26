'use client';

import { useState, useEffect, useMemo } from 'react';
import { Agent, OpticsMission, AgentRunReport } from '@/lib/types';

interface Lead {
  name: string; title: string; company: string; email: string;
  linkedin?: string; industry: string; employees: number; location: string; icpScore: number;
}

const glass = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)' as const,
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const glassAccent = {
  ...glass,
  border: '1px solid rgba(0, 255, 136, 0.12)',
  boxShadow: '0 0 20px rgba(0, 255, 136, 0.03)',
};

type Tab = 'overview' | 'iris' | 'architect' | 'forge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missions: OpticsMission[];
  agents: Agent[];
}

export default function OpticsOverlay({ isOpen, onClose, missions }: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Extract all agent data
  const irisData = useMemo(() => {
    const leads: Lead[] = [];
    let total = 0;
    missions.forEach(m => m.reports.filter(r => r.agentId === 'iris').forEach(r => {
      const out = r.output as Record<string, unknown> | null;
      if (out) {
        total += (out.leadsFound as number) || 0;
        if (Array.isArray(out.leads)) leads.push(...(out.leads as Lead[]));
      }
    }));
    const avgIcp = leads.length ? Math.round(leads.reduce((s, l) => s + l.icpScore, 0) / leads.length) : 0;
    return { leads, total, avgIcp, pipeline: total * 1900 };
  }, [missions]);

  const architectData = useMemo(() => {
    for (let i = missions.length - 1; i >= 0; i--) {
      const r = missions[i].reports.find(r => r.agentId === 'architect' && (r.output as Record<string, unknown>)?.type === 'client-package');
      if (r) return { output: r.output as Record<string, unknown>, input: r.input as Record<string, string> };
    }
    return null;
  }, [missions]);

  const forgeData = useMemo(() => {
    for (let i = missions.length - 1; i >= 0; i--) {
      const r = missions[i].reports.find(r => r.agentId === 'forge' && (r.output as Record<string, unknown>)?.type === 'landing-page');
      if (r) return r.output as Record<string, unknown>;
    }
    return null;
  }, [missions]);

  const stats = useMemo(() => {
    const reports = missions.flatMap(m => m.reports);
    const successRate = reports.length ? Math.round(reports.filter(r => r.status === 'success').length / reports.length * 100) : 0;
    const durs = reports.map(r => r.duration ? parseFloat(r.duration) : 0).filter(d => d > 0);
    const avgDur = durs.length ? (durs.reduce((s, d) => s + d, 0) / durs.length).toFixed(1) : '—';
    return { missionCount: missions.length, successRate, avgDur };
  }, [missions]);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; hasData: boolean }[] = [
    { id: 'overview', label: 'Overview', hasData: true },
    { id: 'iris', label: 'Iris', hasData: irisData.leads.length > 0 },
    { id: 'architect', label: 'Architect', hasData: !!architectData },
    { id: 'forge', label: 'Forge', hasData: !!forgeData },
  ];

  return (
    <div className="fixed inset-0 z-50" style={{ animation: 'overlay-in 200ms ease-out' }}>
      <div className="absolute inset-0" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }} />

      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-[1200px] h-[88vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
          style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}>

          {/* Header + Tabs */}
          <div className="shrink-0 px-8 py-5 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" style={{ animation: 'pulse-dot 2s infinite', boxShadow: '0 0 12px rgba(0,255,136,0.4)' }} />
                <span className="text-[18px] text-[var(--text-primary)] tracking-wide uppercase">Optics</span>
              </div>
              <div className="flex gap-1">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="px-4 py-1.5 rounded-lg text-[12px] transition-all flex items-center gap-2"
                    style={{
                      background: tab === t.id ? 'rgba(0,255,136,0.1)' : 'transparent',
                      color: tab === t.id ? 'var(--accent)' : t.hasData ? 'var(--text-secondary)' : 'var(--text-muted)',
                      border: tab === t.id ? '1px solid rgba(0,255,136,0.15)' : '1px solid transparent',
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.hasData ? '#00ff88' : '#4a4a5e' }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12" /></svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" key={tab} style={{ animation: 'fade-in 0.15s ease-out' }}>
            {tab === 'overview' && <OverviewTab stats={stats} irisData={irisData} architectData={architectData} forgeData={forgeData} onTab={setTab} />}
            {tab === 'iris' && <IrisTab data={irisData} />}
            {tab === 'architect' && <ArchitectTab data={architectData} />}
            {tab === 'forge' && <ForgeTab data={forgeData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== OVERVIEW ===== */
function OverviewTab({ stats, irisData, architectData, forgeData, onTab }: {
  stats: { missionCount: number; successRate: number; avgDur: string };
  irisData: { leads: Lead[]; total: number; avgIcp: number; pipeline: number };
  architectData: { output: Record<string, unknown>; input: Record<string, string> } | null;
  forgeData: Record<string, unknown> | null;
  onTab: (t: Tab) => void;
}) {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Leads" value={String(irisData.total)} accent />
        <StatCard label="Pipeline Value" value={`$${irisData.pipeline.toLocaleString()}`} accent />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Missions Run" value={String(stats.missionCount)} />
        <StatCard label="Avg ICP Score" value={String(irisData.avgIcp)} />
        <StatCard label="Avg Duration" value={`${stats.avgDur}s`} />
      </div>

      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest">Agent Outputs</div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onTab('iris')} className="text-left rounded-xl p-5 transition-all hover:scale-[1.01]" style={irisData.leads.length ? glassAccent : glass}>
          <div className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-2">Iris — Leads</div>
          <div className="text-[20px] text-[var(--text-primary)] mono mb-1">{irisData.leads.length} leads</div>
          <div className="text-[10px] text-[var(--text-muted)]">Avg ICP {irisData.avgIcp} · ${irisData.pipeline.toLocaleString()} pipeline</div>
          <div className="text-[10px] text-[var(--accent)] mt-3 opacity-70">View Leads →</div>
        </button>

        <button onClick={() => onTab('architect')} className="text-left rounded-xl p-5 transition-all hover:scale-[1.01]" style={architectData ? glassAccent : glass}>
          <div className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-2">Architect — Package</div>
          {architectData ? (
            <>
              <div className="text-[14px] text-[var(--text-primary)] mb-1">{architectData.input?.businessName || 'Client Package'}</div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {((architectData.output.emailSequences as unknown[]) || []).length} emails · Landing copy · ICP defined
              </div>
              <div className="text-[10px] text-[var(--accent)] mt-3 opacity-70">View Package →</div>
            </>
          ) : (
            <div className="text-[12px] text-[var(--text-muted)]">No package generated yet</div>
          )}
        </button>

        <button onClick={() => onTab('forge')} className="text-left rounded-xl p-5 transition-all hover:scale-[1.01]" style={forgeData ? glassAccent : glass}>
          <div className="text-[10px] text-[var(--accent)] uppercase tracking-widest mb-2">Forge — Landing Page</div>
          {forgeData?.html ? (
            <>
              <div className="rounded-lg overflow-hidden mb-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <iframe srcDoc={forgeData.html as string} sandbox="" className="w-full h-[100px] border-0 pointer-events-none" title="Preview" />
              </div>
              <div className="text-[10px] text-[var(--accent)] opacity-70">View Page →</div>
            </>
          ) : (
            <div className="text-[12px] text-[var(--text-muted)]">No page deployed yet</div>
          )}
        </button>
      </div>
    </div>
  );
}

/* ===== IRIS TAB ===== */
function IrisTab({ data }: { data: { leads: Lead[]; total: number; avgIcp: number; pipeline: number } }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<{ key: keyof Lead; dir: 'asc' | 'desc' }>({ key: 'icpScore', dir: 'desc' });
  const [expanded, setExpanded] = useState<number | null>(null);

  const sorted = useMemo(() => {
    let f = data.leads;
    if (filter) {
      const q = filter.toLowerCase();
      f = f.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q));
    }
    return [...f].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data.leads, filter, sort]);

  const toggleSort = (key: keyof Lead) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  if (data.leads.length === 0) return <Empty agent="Iris" message="Run Iris to generate leads" />;

  return (
    <div className="p-8 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Leads Found" value={String(data.leads.length)} accent />
        <StatCard label="Avg ICP Score" value={String(data.avgIcp)} />
        <StatCard label="Pipeline Value" value={`$${data.pipeline.toLocaleString()}`} accent />
      </div>

      <div className="flex items-center gap-3">
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by name, company, industry..."
          className="flex-1 px-4 py-2.5 rounded-xl text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          style={glass} />
        <div className="flex gap-1">
          {(['icpScore', 'company', 'name'] as (keyof Lead)[]).map(k => (
            <button key={k} onClick={() => toggleSort(k)}
              className="px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
              style={sort.key === k ? glassAccent : glass}>
              <span style={{ color: sort.key === k ? 'var(--accent)' : 'var(--text-muted)' }}>
                {k === 'icpScore' ? 'ICP' : k} {sort.key === k ? (sort.dir === 'desc' ? '↓' : '↑') : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {sorted.map((lead, i) => (
          <button key={i} onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left rounded-xl p-4 transition-all" style={glass}>
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--text-primary)]">{lead.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{lead.title}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{lead.company} · {lead.industry} · {lead.employees} employees · {lead.location}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-[var(--accent)] mono">{lead.email}</div>
                <span className="text-[12px] mono mt-0.5 inline-block" style={{ color: lead.icpScore >= 90 ? '#00ff88' : lead.icpScore >= 70 ? '#ffaa00' : '#ff4466' }}>
                  ICP {lead.icpScore}
                </span>
              </div>
            </div>
            {expanded === i && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex gap-4 text-[10px]">
                {lead.linkedin && <a href={`https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">LinkedIn Profile</a>}
                <span className="text-[var(--text-muted)]">Seniority: {lead.title}</span>
                <span className="text-[var(--text-muted)]">{lead.employees} employees</span>
                <span className="text-[var(--text-muted)]">{lead.location}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== ARCHITECT TAB ===== */
function ArchitectTab({ data }: { data: { output: Record<string, unknown>; input: Record<string, string> } | null }) {
  const [section, setSection] = useState<'icp' | 'emails' | 'copy' | 'scoring'>('icp');
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);

  if (!data) return <Empty agent="Architect" message="Run Architect to generate a client package" />;

  const out = data.output;
  const icp = out.icp as Record<string, unknown> | undefined;
  const emails = (out.emailSequences || []) as { subject: string; body: string; sendDay: number; purpose: string }[];
  const lpc = out.landingPageCopy as Record<string, unknown> | undefined;
  const scoring = out.leadScoring as { weights: { factor: string; weight: number; description: string }[]; qualificationThreshold: number } | undefined;

  const sections = [
    { id: 'icp' as const, label: 'ICP Definition' },
    { id: 'emails' as const, label: `Email Sequence (${emails.length})` },
    { id: 'copy' as const, label: 'Landing Copy' },
    { id: 'scoring' as const, label: 'Lead Scoring' },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[180px] shrink-0 p-4 border-r border-[rgba(255,255,255,0.06)] space-y-1">
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2 px-2">{data.input?.businessName || 'Package'}</div>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-[11px] transition-all"
            style={section === s.id ? glassAccent : { color: 'var(--text-muted)' }}>
            <span style={{ color: section === s.id ? 'var(--accent)' : 'var(--text-secondary)' }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" key={section} style={{ animation: 'fade-in 0.15s ease-out' }}>
        {section === 'icp' && icp && (
          <div className="space-y-5">
            <div className="text-[14px] text-[var(--text-secondary)] leading-relaxed">{String(icp.description)}</div>
            <TagSection label="Target Titles" tags={(icp.titles || []) as string[]} color="var(--accent)" />
            <TagSection label="Industries" tags={(icp.industries || []) as string[]} color="#66aaff" />
            <TagSection label="Keywords" tags={(icp.keywords || []) as string[]} color="var(--text-secondary)" />
            {Array.isArray(icp.painPoints) && icp.painPoints.length > 0 && (
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Pain Points</div>
                {(icp.painPoints as string[]).map((p, i) => <div key={i} className="text-[12px] text-[var(--text-secondary)] py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">• {p}</div>)}
              </div>
            )}
            {Array.isArray(icp.buyingSignals) && icp.buyingSignals.length > 0 && (
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">Buying Signals</div>
                {(icp.buyingSignals as string[]).map((s, i) => <div key={i} className="text-[12px] text-[var(--text-secondary)] py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">→ {s}</div>)}
              </div>
            )}
          </div>
        )}

        {section === 'emails' && (
          <div className="space-y-2">
            {emails.map((email, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={glass}>
                <button onClick={() => setExpandedEmail(expandedEmail === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3">
                  <span className="text-[10px] text-[var(--accent)] mono w-12 shrink-0">Day {email.sendDay}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--text-primary)] truncate">{email.subject}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{email.purpose}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`shrink-0 transition-transform ${expandedEmail === i ? 'rotate-90' : ''}`}>
                    <path d="M4 2l4 4-4 4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {expandedEmail === i && (
                  <div className="px-5 pb-5 pt-0 border-t border-[rgba(255,255,255,0.04)]">
                    <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mt-3 mono">{email.body}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {section === 'copy' && lpc && (
          <div className="space-y-6">
            <div>
              <div className="text-[28px] text-[var(--text-primary)] leading-tight">{String(lpc.headline)}</div>
              <div className="text-[16px] text-[var(--text-secondary)] mt-2">{String(lpc.subheadline)}</div>
            </div>
            {typeof lpc.heroDescription === 'string' && (
              <div className="rounded-xl p-5" style={glassAccent}>
                <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{String(lpc.heroDescription)}</div>
              </div>
            )}
            {Array.isArray(lpc.bullets) && (
              <div className="space-y-2">
                {(lpc.bullets as string[]).map((b, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[var(--accent)] mt-0.5">✓</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">{b}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-xl p-5 text-center" style={glassAccent}>
              <div className="text-[16px] text-[var(--accent)]">{String(lpc.ctaText)}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{String(lpc.ctaSubtext)}</div>
            </div>
            {Array.isArray(lpc.socialProof) && (
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Social Proof</div>
                {(lpc.socialProof as string[]).map((p, i) => (
                  <div key={i} className="rounded-lg p-4 text-[12px] text-[var(--text-secondary)] italic" style={glass}>"{p}"</div>
                ))}
              </div>
            )}
            {Array.isArray(lpc.objectionHandlers) && (
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Objection Handlers</div>
                {(lpc.objectionHandlers as { objection: string; response: string }[]).map((o, i) => (
                  <div key={i} className="rounded-lg p-4 grid grid-cols-2 gap-4" style={glass}>
                    <div><div className="text-[9px] text-[var(--text-muted)] uppercase mb-1">Objection</div><div className="text-[11px] text-[var(--text-secondary)]">{o.objection}</div></div>
                    <div><div className="text-[9px] text-[var(--accent)] uppercase mb-1">Response</div><div className="text-[11px] text-[var(--text-secondary)]">{o.response}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'scoring' && scoring && (
          <div className="space-y-4">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Qualification Threshold: <span className="text-[var(--accent)] mono text-[14px]">{scoring.qualificationThreshold}</span></div>
            <div className="space-y-3">
              {scoring.weights.map((w, i) => (
                <div key={i} className="rounded-xl p-4" style={glass}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[var(--text-primary)]">{w.factor}</span>
                    <span className="text-[14px] text-[var(--accent)] mono">{w.weight}/10</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${w.weight * 10}%`, opacity: 0.6 }} />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-2">{w.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== FORGE TAB ===== */
function ForgeTab({ data }: { data: Record<string, unknown> | null }) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!data || !data.html) return <Empty agent="Forge" message="Run Forge to build a landing page" />;

  const html = data.html as string;
  const url = typeof data.deployUrl === 'string' ? data.deployUrl : null;

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="shrink-0 px-8 py-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--text-muted)]">Preview</span>
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--accent)] hover:underline mono">{url}</a>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg p-0.5" style={glass}>
            <button onClick={() => setMode('desktop')} className="px-2.5 py-1 rounded text-[10px] transition-all"
              style={{ background: mode === 'desktop' ? 'rgba(0,255,136,0.1)' : 'transparent', color: mode === 'desktop' ? 'var(--accent)' : 'var(--text-muted)' }}>Desktop</button>
            <button onClick={() => setMode('mobile')} className="px-2.5 py-1 rounded text-[10px] transition-all"
              style={{ background: mode === 'mobile' ? 'rgba(0,255,136,0.1)' : 'transparent', color: mode === 'mobile' ? 'var(--accent)' : 'var(--text-muted)' }}>Mobile</button>
          </div>
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-[10px] text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)]" style={glass}>Open Tab</a>}
          <button onClick={copyHtml} className="px-3 py-1.5 rounded-lg text-[10px] transition-all" style={glass}>
            <span style={{ color: copied ? 'var(--accent)' : 'var(--text-secondary)' }}>{copied ? 'Copied!' : 'Copy HTML'}</span>
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className={`${mode === 'mobile' ? 'w-[375px]' : 'w-full'} h-full rounded-xl overflow-hidden transition-all duration-300`}
          style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: mode === 'mobile' ? '0 20px 60px rgba(0,0,0,0.4)' : 'none' }}>
          <iframe srcDoc={html} sandbox="allow-scripts" className="w-full h-full border-0" title="Landing page" />
        </div>
      </div>
    </div>
  );
}

/* ===== SHARED ===== */
function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={accent ? glassAccent : glass}>
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-[28px] mono leading-none ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
    </div>
  );
}

function TagSection({ label, tags, color }: { label: string; tags: string[]; color: string }) {
  if (!tags.length) return null;
  return (
    <div>
      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => <span key={i} className="text-[11px] px-3 py-1 rounded-full" style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}>{t}</span>)}
      </div>
    </div>
  );
}

function Empty({ agent, message }: { agent: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="w-14 h-14 rounded-full mb-4 flex items-center justify-center" style={glass}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <div className="text-[14px] text-[var(--text-muted)] mb-1">{agent} has no output yet</div>
      <div className="text-[11px] text-[var(--text-muted)] opacity-50">{message}</div>
    </div>
  );
}

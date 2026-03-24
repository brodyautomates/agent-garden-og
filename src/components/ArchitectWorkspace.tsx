'use client';

import { useState } from 'react';
import { Agent, ActivityEntry, RunStatus, OpticsMission, ClientPackage } from '@/lib/types';

interface Props {
  agent: Agent;
  activity: ActivityEntry[];
  onRunAgent: (agentId: string) => void;
  runStatus: RunStatus;
  missions: OpticsMission[];
}

const TABS = ['ICP', 'Emails', 'Landing Copy', 'Scoring', 'Schedule'] as const;

export default function ArchitectWorkspace({ agent, activity, onRunAgent, runStatus, missions }: Props) {
  const [form, setForm] = useState({
    businessName: '', industry: '', targetCustomer: '', offer: '',
    pricePoint: '', websiteUrl: '', painPoints: '', uniqueValue: '',
  });
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ICP');
  const [result, setResult] = useState<ClientPackage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing output from sample missions
  const existingOutput = !result ? (() => {
    for (const m of missions) {
      for (const r of m.reports) {
        if (r.agentId === 'architect' && r.output && (r.output as Record<string, unknown>).type === 'client-package') {
          return r.output as unknown as ClientPackage;
        }
      }
    }
    return null;
  })() : null;

  const pkg = result || existingOutput;

  const runArchitect = async () => {
    if (isRunning || !form.businessName) return;
    setIsRunning(true);
    setError(null);
    onRunAgent(agent.id);

    try {
      const res = await fetch('/api/agents/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Architect failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate package');
    } finally {
      setIsRunning(false);
    }
  };

  const agentActivity = activity.filter(a => a.agentId === agent.id).slice(0, 5);

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] border-x border-[var(--border)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-active)', animation: isRunning ? 'glow-pulse 1s infinite' : 'glow-pulse 3s infinite' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 12l4-4" /><circle cx="12" cy="12" r="2" fill="#00ff88" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] text-[var(--text-primary)]">ARCHITECT</h2>
              <span className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                {isRunning || runStatus === 'running' ? 'Running' : 'Active'}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{agent.description}</p>
          </div>
          <button
            onClick={runArchitect}
            disabled={isRunning || !form.businessName}
            className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all shrink-0 disabled:opacity-40"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)', animation: isRunning ? 'glow-pulse 1s infinite' : undefined }}
          >
            {isRunning ? 'Generating...' : 'Generate Package'}
          </button>
        </div>
      </div>

      {/* Intake Form */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Client Intake</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(form).map(([key, val]) => (
            <div key={key} className={key === 'offer' || key === 'painPoints' || key === 'uniqueValue' ? 'col-span-2' : ''}>
              <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                value={val}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-[12px] text-[var(--text-primary)] outline-none mono"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>
          ))}
        </div>
        {error && <div className="mt-2 px-3 py-2 rounded-lg text-[11px] text-[var(--error)]" style={{ background: 'var(--error-dim)' }}>{error}</div>}
      </div>

      {/* Package Output */}
      {pkg && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-1 mb-3 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider transition-all shrink-0"
                style={{
                  background: activeTab === tab ? 'var(--accent-dim)' : 'transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'ICP' && pkg.icp && (
            <div className="space-y-2">
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{pkg.icp.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {pkg.icp.titles?.map((t: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-dim)] text-[var(--accent)]">{t}</span>
                ))}
                {pkg.icp.industries?.map((t: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]">{t}</span>
                ))}
              </div>
              {pkg.icp.painPoints && (
                <div className="mt-2">
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Pain Points</div>
                  {pkg.icp.painPoints.map((p: string, i: number) => (
                    <div key={i} className="text-[11px] text-[var(--text-secondary)] py-1">&#8226; {p}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Emails' && pkg.emailSequences && (
            <div className="space-y-2">
              {pkg.emailSequences.map((email: { subject: string; body: string; sendDay: number; purpose: string }, i: number) => (
                <div key={i} className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--text-primary)]">{email.subject}</span>
                    <span className="text-[9px] text-[var(--text-muted)] mono">Day {email.sendDay}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-3">{email.body}</p>
                  <div className="text-[9px] text-[var(--accent)] mt-1 opacity-70">{email.purpose}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Landing Copy' && pkg.landingPageCopy && (
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-[16px] text-[var(--text-primary)] mb-1">{pkg.landingPageCopy.headline}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">{pkg.landingPageCopy.subheadline}</div>
              </div>
              <div className="space-y-1">
                {pkg.landingPageCopy.bullets?.map((b: string, i: number) => (
                  <div key={i} className="text-[11px] text-[var(--text-secondary)] py-1">&#10003; {b}</div>
                ))}
              </div>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-active)' }}>
                <div className="text-[12px] text-[var(--accent)]">{pkg.landingPageCopy.ctaText}</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{pkg.landingPageCopy.ctaSubtext}</div>
              </div>
            </div>
          )}

          {activeTab === 'Scoring' && pkg.leadScoring && (
            <div className="space-y-1.5">
              {pkg.leadScoring.weights?.map((w: { factor: string; weight: number; description: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-[14px] text-[var(--accent)] mono w-6">{w.weight}</span>
                  <div>
                    <div className="text-[11px] text-[var(--text-primary)]">{w.factor}</div>
                    <div className="text-[9px] text-[var(--text-muted)]">{w.description}</div>
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-[var(--text-muted)] mt-2">Qualification threshold: <span className="text-[var(--accent)] mono">{pkg.leadScoring.qualificationThreshold}</span></div>
            </div>
          )}

          {activeTab === 'Schedule' && pkg.automationSchedule && (
            <div className="space-y-2">
              {Object.entries(pkg.automationSchedule).map(([key, val]) => (
                <div key={key} className="flex gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] text-[var(--text-muted)] w-24 shrink-0">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-[11px] text-[var(--text-secondary)] mono">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Recent Activity</h3>
        {agentActivity.length === 0 && !pkg ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">Waiting for first run</div>
        ) : (
          <div className="space-y-0">
            {agentActivity.map((entry) => (
              <div key={entry.id} className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums mono pt-px">{entry.timestamp}</span>
                <span className="text-[12px] text-[var(--text-secondary)]">{entry.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

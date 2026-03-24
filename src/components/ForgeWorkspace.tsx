'use client';

import { useState } from 'react';
import { Agent, ActivityEntry, RunStatus, OpticsMission } from '@/lib/types';

interface Props {
  agent: Agent;
  activity: ActivityEntry[];
  onRunAgent: (agentId: string) => void;
  runStatus: RunStatus;
  missions: OpticsMission[];
}

export default function ForgeWorkspace({ agent, activity, onRunAgent, runStatus, missions }: Props) {
  const [loadedCopy, setLoadedCopy] = useState<Record<string, unknown> | null>(null);
  const [loadedClient, setLoadedClient] = useState<string>('');
  const [loadedIndustry, setLoadedIndustry] = useState<string>('');
  const [html, setHtml] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing Forge output from sample missions
  const existingOutput = !html ? (() => {
    for (const m of missions) {
      for (const r of m.reports) {
        if (r.agentId === 'forge' && r.output) {
          const out = r.output as Record<string, unknown>;
          if (out.type === 'landing-page' && out.html) return out;
        }
      }
    }
    return null;
  })() : null;

  const displayHtml = html || (existingOutput?.html as string) || null;
  const displayUrl = deployUrl || (existingOutput?.deployUrl as string) || null;

  const loadFromArchitect = () => {
    for (const m of [...missions].reverse()) {
      for (const r of m.reports) {
        if (r.agentId === 'architect' && r.output) {
          const out = r.output as Record<string, unknown>;
          if (out.landingPageCopy) {
            setLoadedCopy(out.landingPageCopy as Record<string, unknown>);
            const intake = (r.input || {}) as Record<string, string>;
            setLoadedClient(intake.businessName || 'Client');
            setLoadedIndustry(intake.industry || 'Business');
            return;
          }
        }
      }
    }
  };

  const runForge = async () => {
    if (isRunning || !loadedCopy) return;
    setIsRunning(true);
    setError(null);
    onRunAgent(agent.id);

    try {
      const res = await fetch('/api/agents/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageCopy: loadedCopy, clientName: loadedClient, industry: loadedIndustry }),
      });
      if (!res.ok) throw new Error('Forge failed');
      const data = await res.json();
      setHtml(data.html);
      setDeployUrl(data.deployUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build page');
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
              <path d="M10 14l-2 8h8l-2-8" /><path d="M6 14h12" /><path d="M4 8l4 6h8l4-6" /><path d="M10 2l2 6 2-6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] text-[var(--text-primary)]">FORGE</h2>
              <span className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                {isRunning || runStatus === 'running' ? 'Building' : 'Active'}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{agent.description}</p>
          </div>
          <button
            onClick={runForge}
            disabled={isRunning || !loadedCopy}
            className="px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider transition-all shrink-0 disabled:opacity-40"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)', animation: isRunning ? 'glow-pulse 1s infinite' : undefined }}
          >
            {isRunning ? 'Building...' : 'Build & Deploy'}
          </button>
        </div>
      </div>

      {/* Source Package */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Source Package</h3>
        {!loadedCopy ? (
          <button
            onClick={loadFromArchitect}
            className="w-full py-3 rounded-lg text-[12px] text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-card-hover)]"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            Load from Architect
          </button>
        ) : (
          <div className="px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-active)' }}>
            <div className="text-[12px] text-[var(--accent)] mb-1">{loadedClient} — {loadedIndustry}</div>
            <div className="text-[14px] text-[var(--text-primary)] mb-0.5">{(loadedCopy as Record<string, string>).headline}</div>
            <div className="text-[11px] text-[var(--text-secondary)]">{(loadedCopy as Record<string, string>).subheadline}</div>
            <div className="text-[9px] text-[var(--text-muted)] mt-1">{((loadedCopy as Record<string, unknown>).bullets as string[])?.length || 0} bullets · {((loadedCopy as Record<string, unknown>).socialProof as string[])?.length || 0} social proof</div>
          </div>
        )}
        {error && <div className="mt-2 px-3 py-2 rounded-lg text-[11px] text-[var(--error)]" style={{ background: 'var(--error-dim)' }}>{error}</div>}
      </div>

      {/* Page Preview */}
      {displayHtml && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">Page Preview</h3>
            <div className="flex items-center gap-2">
              {displayUrl && (
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[var(--accent)] hover:underline mono"
                >
                  {displayUrl}
                </a>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(displayHtml)}
                className="px-2 py-1 rounded text-[9px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                Copy HTML
              </button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-[var(--border)]" style={{ background: '#0a0a0f' }}>
            <iframe
              srcDoc={displayHtml}
              sandbox="allow-scripts"
              className="w-full h-[400px] border-0"
              title="Landing page preview"
            />
          </div>
        </div>
      )}

      {/* Activity */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Recent Activity</h3>
        {agentActivity.length === 0 && !displayHtml ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">Waiting for first build</div>
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

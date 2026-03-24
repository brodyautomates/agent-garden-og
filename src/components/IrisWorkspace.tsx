'use client';

import { useState } from 'react';
import { Agent, ActivityEntry } from '@/lib/types';

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  employees: string | number;
  location: string;
  linkedinUrl: string | null;
  email: string | null;
  emailStatus: string | null;
  headline: string;
  seniority: string;
}

interface IrisResult {
  leads: Lead[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface Props {
  agent: Agent;
  activity: ActivityEntry[];
}

export default function IrisWorkspace({ agent, activity }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<IrisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configurable search params
  const [titles, setTitles] = useState('CEO, COO, Founder, Head of Operations');
  const [keywords, setKeywords] = useState('');
  const [locations, setLocations] = useState('United States');
  const [employeeRange, setEmployeeRange] = useState('1,200');

  const agentActivity = activity.filter((a) => a.agentId === agent.id).slice(0, 5);

  const runIris = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch('/api/agents/iris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titles: titles.split(',').map(t => t.trim()).filter(Boolean),
          locations: locations.split(',').map(l => l.trim()).filter(Boolean),
          employeeRanges: [employeeRange],
          keywords: keywords || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to run');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Iris failed to run');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] border-x border-[var(--border)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-active)',
              animation: isRunning ? 'glow-pulse 1s infinite' : 'glow-pulse 3s infinite',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] text-[var(--text-primary)]">IRIS</h2>
              <span className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                {isRunning ? 'Running' : 'Active'}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Search Config */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Search Parameters</h3>
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Titles (comma-separated)</label>
            <input
              type="text"
              value={titles}
              onChange={(e) => setTitles(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[12px] text-[var(--text-primary)] outline-none mono"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Keywords (optional)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. AI automation, SaaS"
              className="w-full px-3 py-2 rounded-lg text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none mono"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Locations</label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] text-[var(--text-primary)] outline-none mono"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>
            <div className="w-32">
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">Employees</label>
              <input
                type="text"
                value={employeeRange}
                onChange={(e) => setEmployeeRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] text-[var(--text-primary)] outline-none mono"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={runIris}
          disabled={isRunning}
          className="mt-4 w-full py-2.5 rounded-lg text-[12px] uppercase tracking-wider transition-all disabled:opacity-50"
          style={{
            background: isRunning ? 'var(--bg-card)' : 'var(--accent-dim)',
            color: 'var(--accent)',
            border: '1px solid var(--border-active)',
          }}
        >
          {isRunning ? 'Searching Apollo...' : 'Run Iris'}
        </button>

        {error && (
          <div className="mt-2 px-3 py-2 rounded-lg text-[11px] text-[var(--error)]" style={{ background: 'var(--error-dim)' }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Leads Found
            </h3>
            <span className="text-[11px] text-[var(--accent)] mono">
              {result.leads.length} of {result.total.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5">
            {result.leads.map((lead) => (
              <div
                key={lead.id}
                className="px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[var(--text-primary)]">{lead.name}</span>
                      {lead.linkedinUrl && (
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-[var(--accent)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{lead.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {lead.company} · {lead.industry} · {lead.employees} employees · {lead.location}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {lead.email && (
                      <div className="text-[10px] text-[var(--text-secondary)] mono">{lead.email}</div>
                    )}
                    <div className="text-[9px] text-[var(--text-muted)] mono mt-0.5">{lead.seniority}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Recent Activity</h3>
        {agentActivity.length === 0 && !result ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">Waiting for first run</div>
        ) : (
          <div className="space-y-0">
            {result && (
              <div className="flex gap-3 py-2 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--accent)] shrink-0 mono pt-px">NOW</span>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  Found {result.leads.length} leads from {result.total.toLocaleString()} matches
                </span>
              </div>
            )}
            {agentActivity.map((entry, i) => (
              <div
                key={entry.id}
                className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0"
              >
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

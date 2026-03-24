'use client';

import { useState } from 'react';
import ConnectionMap from '@/components/ConnectionMap';
import AgentRegistry from '@/components/AgentRegistry';
import AgentWorkspace from '@/components/AgentWorkspace';
import ActivityFeed from '@/components/ActivityFeed';
import ChadWidget from '@/components/ChadWidget';
import { agents, activityFeed } from '@/lib/data';

export default function Lab() {
  const chad = agents.find(a => a.role === 'master') ?? null;
  const workers = agents.filter(a => a.role === 'worker');

  const [selectedId, setSelectedId] = useState<string | null>(chad?.id ?? workers[0]?.id ?? null);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  const activeCount = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="shrink-0 px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="agentlab" className="w-8 h-8" />
            <h1 className="text-[16px] text-[var(--text-primary)] tracking-wide uppercase">agentlab</h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full bg-[var(--accent)]"
                style={{ animation: 'pulse-dot 2s infinite' }}
              />
              <span className="mono text-[11px]">{activeCount} active</span>
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="mono text-[11px]">{agents.length} total</span>
          </div>
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] text-[var(--text-muted)]">System online</span>
          </div>
        </div>
      </header>

      {/* Agent Garden — Chad floats above workers */}
      <div className="h-[320px] shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)] relative">
        <ConnectionMap
          agents={workers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {/* Chad widget floating inside the garden */}
        {chad && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <ChadWidget
              agent={chad}
              agents={agents}
              isSelected={selectedId === chad.id}
              onSelect={() => setSelectedId(chad.id)}
            />
          </div>
        )}
      </div>

      {/* Three columns — workbench */}
      <div className="flex-1 flex min-h-0">
        {/* Left — Agent Registry (workers only) */}
        <div className="w-60 shrink-0">
          <AgentRegistry
            agents={workers}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Middle — Agent Workspace */}
        <div className="flex-1 min-w-0">
          <AgentWorkspace
            agent={selectedAgent}
            agents={agents}
            activity={activityFeed}
          />
        </div>

        {/* Right — Activity Feed */}
        <div className="w-80 shrink-0">
          <ActivityFeed
            activity={activityFeed}
            onClickAgent={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}

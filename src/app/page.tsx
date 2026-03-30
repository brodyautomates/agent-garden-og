'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import ConnectionMap from '@/components/ConnectionMap';
import AgentRegistry from '@/components/AgentRegistry';
import AgentWorkspace from '@/components/AgentWorkspace';
import ActivityFeed from '@/components/ActivityFeed';
import ChadWidget from '@/components/ChadWidget';
import ChadChatOverlay from '@/components/ChadChatOverlay';
import OpticsOverlay from '@/components/OpticsOverlay';
import VersionSelector from '@/components/VersionSelector';
import { agents as allAgents, activityFeed as allActivity, sampleMissions as allMissions } from '@/lib/data';
import { RunStatus, OpticsMission, AgentRunReport, AgentCommunication } from '@/lib/types';
import { VersionProvider, useVersion } from '@/lib/version-context';

const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function LabContent() {
  const { currentVersion, isFeatureAvailable } = useVersion();

  const agents = useMemo(() => allAgents.filter(a => a.version <= currentVersion), [currentVersion]);
  const filteredActivity = useMemo(() => allActivity.filter(a => a.version <= currentVersion), [currentVersion]);
  const filteredMissions = useMemo(() => allMissions.filter(m => !m.version || m.version <= currentVersion), [currentVersion]);

  const chad = agents.find(a => a.role === 'master') ?? null;
  const workers = agents.filter(a => a.role === 'worker');

  const playChicken = useCallback(() => {
    try { new Audio('/chicken.mp3').play(); } catch {}
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(chad?.id ?? workers[0]?.id ?? null);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;
  const [chatOpen, setChatOpen] = useState(false);
  const [opticsOpen, setOpticsOpen] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Record<string, RunStatus>>({});
  const [missions, setMissions] = useState<OpticsMission[]>(filteredMissions);

  // Reset selection when version changes and selected agent disappears
  useEffect(() => {
    if (selectedId && !agents.find(a => a.id === selectedId)) {
      setSelectedId(chad?.id ?? null);
    }
    setMissions(filteredMissions);
  }, [currentVersion]);

  const activeCount = agents.filter((a) => a.status === 'active').length;

  const handleRunAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || runningAgents[agentId] === 'running') return;

    setRunningAgents(prev => ({ ...prev, [agentId]: 'running' }));

    const missionId = uid();
    const startTime = now();

    const dispatchComm: AgentCommunication = {
      id: uid(), fromAgentId: 'chad', fromAgentName: 'CHAD',
      toAgentId: agentId, toAgentName: agent.name,
      message: `Dispatching ${agent.name} — execute primary function`,
      timestamp: startTime, type: 'dispatch',
    };

    const mission: OpticsMission = {
      id: missionId, triggeredBy: 'chad', startedAt: startTime,
      status: 'running', reports: [], communications: [dispatchComm],
    };

    setMissions(prev => [...prev, mission]);

    const runStart = Date.now();

    try {
      let output: Record<string, unknown> = {};
      let outputSummary = '';

      if (agentId === 'iris') {
        const res = await fetch('/api/agents/iris', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titles: ['CEO', 'COO', 'Founder', 'Head of Operations'],
            locations: ['United States'],
            employeeRanges: ['1,200'],
          }),
        });
        if (!res.ok) throw new Error(`Apollo returned ${res.status}`);
        const data = await res.json();
        output = data;
        outputSummary = `Found ${data.leads?.length || 0} leads from ${(data.total || 0).toLocaleString()} matches`;
      } else if (agentId === 'roulette') {
        const res = await fetch('/api/agents/roulette/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'landing page designer' }),
        });
        if (!res.ok) throw new Error(`Fiverr scrape returned ${res.status}`);
        const data = await res.json();
        output = data;
        outputSummary = `Found ${data.candidates?.length || 0} Fiverr candidates — wheel ready to spin`;
      } else {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        outputSummary = `${agent.name} ready — no API endpoint configured yet`;
      }

      const duration = `${((Date.now() - runStart) / 1000).toFixed(1)}s`;

      const report: AgentRunReport = {
        id: uid(), agentId, agentName: agent.name, status: 'success',
        startedAt: startTime, completedAt: now(),
        input: { titles: ['CEO', 'COO', 'Founder'], locations: ['United States'] },
        output, outputSummary, error: null, duration,
      };

      const reportComm: AgentCommunication = {
        id: uid(), fromAgentId: agentId, fromAgentName: agent.name,
        toAgentId: 'chad', toAgentName: 'CHAD',
        message: outputSummary, timestamp: now(), type: 'report',
      };

      setMissions(prev => prev.map(m =>
        m.id === missionId
          ? { ...m, status: 'success', reports: [...m.reports, report], communications: [...m.communications, reportComm] }
          : m
      ));
      setRunningAgents(prev => ({ ...prev, [agentId]: 'success' }));
      playChicken();
      setTimeout(() => setRunningAgents(prev => ({ ...prev, [agentId]: 'idle' })), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      const duration = `${((Date.now() - runStart) / 1000).toFixed(1)}s`;

      const report: AgentRunReport = {
        id: uid(), agentId, agentName: agent.name, status: 'error',
        startedAt: startTime, completedAt: now(),
        input: {}, output: null, outputSummary: `Failed: ${errorMsg}`,
        error: errorMsg, duration,
      };

      const errorComm: AgentCommunication = {
        id: uid(), fromAgentId: agentId, fromAgentName: agent.name,
        toAgentId: 'chad', toAgentName: 'CHAD',
        message: `Error: ${errorMsg}`, timestamp: now(), type: 'error',
      };

      setMissions(prev => prev.map(m =>
        m.id === missionId
          ? { ...m, status: 'error', reports: [...m.reports, report], communications: [...m.communications, errorComm] }
          : m
      ));
      setRunningAgents(prev => ({ ...prev, [agentId]: 'error' }));
      setTimeout(() => setRunningAgents(prev => ({ ...prev, [agentId]: 'idle' })), 3000);
    }
  }, [agents, runningAgents]);

  const handleRunAll = useCallback(async () => {
    const activeWorkers = workers.filter(w => w.status === 'active');
    for (const worker of activeWorkers) {
      await handleRunAgent(worker.id);
    }
  }, [workers, handleRunAgent]);

  const isRunningAll = workers.some(w => runningAgents[w.id] === 'running');

  const showOptics = isFeatureAvailable('OpticsOverlay');
  const showActivityFeed = isFeatureAvailable('ActivityFeed');

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
          {/* Optics button */}
          {showOptics && (
            <button
              onClick={() => setOpticsOpen(true)}
              className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-2"
              style={{
                background: missions.length > 0 ? 'var(--accent-dim)' : 'var(--bg-card)',
                color: missions.length > 0 ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${missions.length > 0 ? 'var(--border-active)' : 'var(--border)'}`,
                boxShadow: missions.length > 0 ? '0 0 12px rgba(0, 255, 136, 0.08)' : 'none',
              }}
            >
              Optics
              {missions.length > 0 && (
                <span className="text-[8px] mono bg-[var(--accent)] text-[var(--bg-primary)] w-4 h-4 rounded-full flex items-center justify-center">
                  {missions.length}
                </span>
              )}
            </button>
          )}
          <div className="h-5 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ animation: 'pulse-dot 2s infinite' }} />
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
          <div className="h-5 w-px bg-[var(--border)]" />
          <VersionSelector />
        </div>
      </header>

      {/* Agent Garden */}
      <div className="h-[480px] shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)] relative">
        <ConnectionMap agents={workers} selectedId={selectedId} onSelect={setSelectedId} runningAgents={runningAgents} />
        {chad && (
          <div className="absolute top-1/2 -translate-y-1/2 left-[8%] z-10">
            <ChadWidget
              agent={chad} agents={agents} isSelected={selectedId === chad.id}
              onOpenChat={() => { setSelectedId(chad.id); setChatOpen(true); }}
              onRunAll={handleRunAll} isRunningAll={isRunningAll}
            />
          </div>
        )}
      </div>

      {/* Three columns */}
      <div className="flex-1 flex min-h-0">
        <div className="w-60 shrink-0">
          <AgentRegistry agents={workers} selectedId={selectedId} onSelect={setSelectedId} onRunAgent={handleRunAgent} runningAgents={runningAgents} />
        </div>
        <div className="flex-1 min-w-0">
          <AgentWorkspace agent={selectedAgent} agents={agents} activity={filteredActivity} onRunAgent={handleRunAgent} runningAgents={runningAgents} missions={missions} />
        </div>
        {showActivityFeed && (
          <div className="w-80 shrink-0">
            <ActivityFeed activity={filteredActivity} onClickAgent={setSelectedId} />
          </div>
        )}
      </div>

      {/* Overlays */}
      {chad && <ChadChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} agent={chad} />}
      {showOptics && <OpticsOverlay isOpen={opticsOpen} onClose={() => setOpticsOpen(false)} missions={missions} agents={agents} />}
    </div>
  );
}

export default function Lab() {
  return (
    <VersionProvider>
      <LabContent />
    </VersionProvider>
  );
}

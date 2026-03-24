'use client';

import { useState, useCallback } from 'react';
import ConnectionMap from '@/components/ConnectionMap';
import AgentRegistry from '@/components/AgentRegistry';
import AgentWorkspace from '@/components/AgentWorkspace';
import ActivityFeed from '@/components/ActivityFeed';
import OpticsPanel from '@/components/OpticsPanel';
import ChadWidget from '@/components/ChadWidget';
import ChadChatOverlay from '@/components/ChadChatOverlay';
import { agents, activityFeed, sampleMissions } from '@/lib/data';
import { RunStatus, OpticsMission, AgentRunReport, AgentCommunication } from '@/lib/types';

const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Lab() {
  const chad = agents.find(a => a.role === 'master') ?? null;
  const workers = agents.filter(a => a.role === 'worker');

  const [selectedId, setSelectedId] = useState<string | null>(chad?.id ?? workers[0]?.id ?? null);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;
  const [chatOpen, setChatOpen] = useState(false);
  const [rightTab, setRightTab] = useState<'activity' | 'optics'>('activity');
  const [runningAgents, setRunningAgents] = useState<Record<string, RunStatus>>({});
  const [missions, setMissions] = useState<OpticsMission[]>(sampleMissions);

  const activeCount = agents.filter((a) => a.status === 'active').length;

  const handleRunAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || runningAgents[agentId] === 'running') return;

    setRunningAgents(prev => ({ ...prev, [agentId]: 'running' }));

    const missionId = uid();
    const startTime = now();

    // Create mission with dispatch communication
    const dispatchComm: AgentCommunication = {
      id: uid(),
      fromAgentId: 'chad',
      fromAgentName: 'CHAD',
      toAgentId: agentId,
      toAgentName: agent.name,
      message: `Dispatching ${agent.name} — execute primary function`,
      timestamp: startTime,
      type: 'dispatch',
    };

    const mission: OpticsMission = {
      id: missionId,
      triggeredBy: 'chad',
      startedAt: startTime,
      status: 'running',
      reports: [],
      communications: [dispatchComm],
    };

    setMissions(prev => [...prev, mission]);
    setRightTab('optics');

    const runStart = Date.now();

    try {
      let output: Record<string, unknown> = {};
      let outputSummary = '';

      if (agentId === 'iris') {
        // Real Apollo API call
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
      } else {
        // Simulated run for agents without APIs
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        outputSummary = `${agent.name} ready — no API endpoint configured yet`;
      }

      const duration = `${((Date.now() - runStart) / 1000).toFixed(1)}s`;

      const report: AgentRunReport = {
        id: uid(),
        agentId,
        agentName: agent.name,
        status: 'success',
        startedAt: startTime,
        completedAt: now(),
        input: { titles: ['CEO', 'COO', 'Founder'], locations: ['United States'] },
        output,
        outputSummary,
        error: null,
        duration,
      };

      const reportComm: AgentCommunication = {
        id: uid(),
        fromAgentId: agentId,
        fromAgentName: agent.name,
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: outputSummary,
        timestamp: now(),
        type: 'report',
      };

      setMissions(prev => prev.map(m =>
        m.id === missionId
          ? { ...m, status: 'success', reports: [...m.reports, report], communications: [...m.communications, reportComm] }
          : m
      ));
      setRunningAgents(prev => ({ ...prev, [agentId]: 'success' }));

      // Reset status after 3s
      setTimeout(() => setRunningAgents(prev => ({ ...prev, [agentId]: 'idle' })), 3000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      const duration = `${((Date.now() - runStart) / 1000).toFixed(1)}s`;

      const report: AgentRunReport = {
        id: uid(),
        agentId,
        agentName: agent.name,
        status: 'error',
        startedAt: startTime,
        completedAt: now(),
        input: {},
        output: null,
        outputSummary: `Failed: ${errorMsg}`,
        error: errorMsg,
        duration,
      };

      const errorComm: AgentCommunication = {
        id: uid(),
        fromAgentId: agentId,
        fromAgentName: agent.name,
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: `Error: ${errorMsg}`,
        timestamp: now(),
        type: 'error',
      };

      setMissions(prev => prev.map(m =>
        m.id === missionId
          ? { ...m, status: 'error', reports: [...m.reports, report], communications: [...m.communications, errorComm] }
          : m
      ));
      setRunningAgents(prev => ({ ...prev, [agentId]: 'error' }));
      setTimeout(() => setRunningAgents(prev => ({ ...prev, [agentId]: 'idle' })), 3000);
    }
  }, [runningAgents]);

  const handleRunAll = useCallback(async () => {
    const activeWorkers = workers.filter(w => w.status === 'active');
    for (const worker of activeWorkers) {
      await handleRunAgent(worker.id);
    }
  }, [workers, handleRunAgent]);

  const isRunningAll = workers.some(w => runningAgents[w.id] === 'running');

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
        </div>
      </header>

      {/* Agent Garden */}
      <div className="h-[480px] shrink-0 border-b border-[var(--border)] bg-[var(--bg-secondary)] relative">
        <ConnectionMap agents={workers} selectedId={selectedId} onSelect={setSelectedId} />
        {chad && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <ChadWidget
              agent={chad}
              agents={agents}
              isSelected={selectedId === chad.id}
              onOpenChat={() => { setSelectedId(chad.id); setChatOpen(true); }}
              onRunAll={handleRunAll}
              isRunningAll={isRunningAll}
            />
          </div>
        )}
      </div>

      {/* Three columns */}
      <div className="flex-1 flex min-h-0">
        <div className="w-60 shrink-0">
          <AgentRegistry
            agents={workers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRunAgent={handleRunAgent}
            runningAgents={runningAgents}
          />
        </div>
        <div className="flex-1 min-w-0">
          <AgentWorkspace
            agent={selectedAgent}
            agents={agents}
            activity={activityFeed}
            onRunAgent={handleRunAgent}
            runningAgents={runningAgents}
          />
        </div>
        <div className="w-80 shrink-0">
          {rightTab === 'activity' ? (
            <ActivityFeed
              activity={activityFeed}
              onClickAgent={setSelectedId}
              activeTab={rightTab}
              onSwitchTab={setRightTab}
            />
          ) : (
            <OpticsPanel
              missions={missions}
              agents={agents}
              activeTab={rightTab}
              onSwitchTab={setRightTab}
            />
          )}
        </div>
      </div>

      {chad && (
        <ChadChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} agent={chad} />
      )}
    </div>
  );
}

export type AgentStatus = 'active' | 'idle' | 'error';
export type AgentRole = 'master' | 'worker';

export interface Department {
  name: string;
  status: 'planned' | 'building' | 'active';
  agentIds: string[];
  description: string;
}

export interface AgentBlueprint {
  name: string;
  department: string;
  purpose: string;
  status: 'queued' | 'building' | 'deployed';
  priority: number; // 1 = next up
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  role: AgentRole;
  category: 'outreach' | 'content' | 'ads' | 'ops' | 'research' | 'sales' | 'finance' | 'product' | 'custom';
  brand?: string;
  connectedTo: string[];
  config: {
    schedule?: string;
    api?: string;
    prompt?: string;
  };
  stats: {
    runs: number;
    lastRun: string;
    avgDuration: string;
  };
  // Master agent fields
  master?: {
    businessModel: string;
    businessName: string;
    objective: string;
    revenue: string;
    departments: Department[];
    buildQueue: AgentBlueprint[];
    directives: string[];
    constraints: string[];
  };
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
}

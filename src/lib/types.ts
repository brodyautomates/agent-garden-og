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
  category: 'outreach' | 'content' | 'ads' | 'ops' | 'research' | 'sales' | 'finance' | 'product' | 'strategy' | 'custom';
  brand?: string;
  connectedTo: string[];
  version: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'chad';
  content: string;
  timestamp: string;
}

export type RunStatus = 'idle' | 'running' | 'success' | 'error';

export interface AgentRunReport {
  id: string;
  agentId: string;
  agentName: string;
  status: RunStatus;
  startedAt: string;
  completedAt: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  outputSummary: string;
  error: string | null;
  duration: string | null;
}

export interface AgentCommunication {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  message: string;
  timestamp: string;
  type: 'dispatch' | 'report' | 'data-transfer' | 'error';
}

export interface OpticsMission {
  id: string;
  triggeredBy: string;
  startedAt: string;
  status: RunStatus;
  reports: AgentRunReport[];
  communications: AgentCommunication[];
  version?: number;
}

// Client Package types (Architect + Forge)
export interface ClientIntake {
  businessName: string;
  industry: string;
  targetCustomer: string;
  offer: string;
  pricePoint: string;
  websiteUrl: string;
  painPoints: string;
  uniqueValue: string;
}

export interface ICPDefinition {
  description: string;
  titles: string[];
  seniorities: string[];
  industries: string[];
  employeeRanges: string[];
  locations: string[];
  keywords: string[];
  painPoints: string[];
  buyingSignals: string[];
}

export interface EmailSequenceItem {
  subject: string;
  body: string;
  sendDay: number;
  purpose: string;
}

export interface LandingPageCopy {
  headline: string;
  subheadline: string;
  bullets: string[];
  ctaText: string;
  ctaSubtext: string;
  socialProof: string[];
  objectionHandlers: { objection: string; response: string }[];
  heroDescription: string;
}

export interface LeadScoringConfig {
  weights: { factor: string; weight: number; description: string }[];
  qualificationThreshold: number;
}

export interface AutomationSchedule {
  irisFrequency: string;
  emailCadence: string;
  followUpRules: string[];
  dailyLeadTarget: number;
}

export interface ClientPackage {
  clientIntake: ClientIntake;
  icp: ICPDefinition;
  emailSequences: EmailSequenceItem[];
  landingPageCopy: LandingPageCopy;
  leadScoring: LeadScoringConfig;
  automationSchedule: AutomationSchedule;
  generatedAt: string;
}

export interface ForgeOutput {
  html: string;
  deployUrl: string | null;
  sourcePackageId: string;
  generatedAt: string;
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
  version: number;
}

import { Agent, ActivityEntry } from './types';

export const agents: Agent[] = [
  {
    id: 'chad',
    name: 'CHAD',
    description: 'Master orchestrator — directs all business strategy, builds and deploys agents autonomously',
    status: 'active',
    role: 'master',
    category: 'ops',
    connectedTo: ['iris'],
    config: {
      schedule: 'Always on',
      api: 'Anthropic API, Internal',
      prompt: 'You are Chad, the master AI orchestrator. Your objective is to build and operate a fully autonomous business that generates $100,000 in revenue without human intervention. You decide the business model, build the agent workforce, assign departments, and direct all operations. Every decision must optimize for: (1) full automation — no human in the loop, (2) profitability, (3) scalability. You build agents one at a time, deploy them, and monitor their output.',
    },
    stats: {
      runs: 1,
      lastRun: 'Just now',
      avgDuration: '—',
    },
    master: {
      businessName: 'Pending — Chad will decide',
      businessModel: 'Pending — Chad will analyze market opportunities and select a model that AI can fully automate',
      objective: 'Generate $100,000 in revenue on full autopilot with zero human involvement',
      revenue: '$0',
      departments: [
        { name: 'Strategy', status: 'active', agentIds: ['chad'], description: 'Business direction, market analysis, agent architecture' },
        { name: 'Sales', status: 'building', agentIds: ['iris'], description: 'Outbound prospecting, lead gen, deal closing' },
        { name: 'Marketing', status: 'planned', agentIds: [], description: 'Content, ads, brand presence, funnel optimization' },
        { name: 'Operations', status: 'planned', agentIds: [], description: 'Fulfillment, delivery, client management, automation' },
        { name: 'Finance', status: 'planned', agentIds: [], description: 'Revenue tracking, invoicing, cost optimization' },
        { name: 'Product', status: 'planned', agentIds: [], description: 'Service/product development, iteration, quality' },
      ],
      buildQueue: [
        { name: 'NOVA', department: 'Marketing', purpose: 'Brand identity, positioning, and visual system', status: 'queued', priority: 1 },
        { name: 'SCOUT', department: 'Sales', purpose: 'Market research, niche validation, and competitor analysis', status: 'queued', priority: 2 },
        { name: 'FORGE', department: 'Product', purpose: 'Landing page and funnel builder', status: 'queued', priority: 3 },
        { name: 'ECHO', department: 'Marketing', purpose: 'Content engine — social, email, SEO', status: 'queued', priority: 4 },
        { name: 'VAULT', department: 'Finance', purpose: 'Payment processing, invoicing, revenue tracking', status: 'queued', priority: 5 },
        { name: 'ATLAS', department: 'Operations', purpose: 'Client onboarding and fulfillment automation', status: 'queued', priority: 6 },
      ],
      directives: [
        'Analyze market opportunities for fully AI-automatable businesses',
        'Select business model — must require zero human fulfillment',
        'Design agent architecture — one agent per function',
        'Build agents sequentially — deploy, test, then build next',
        'Every agent reports back to Chad with performance data',
        'Pivot fast if a strategy isn\'t generating revenue within 30 days',
      ],
      constraints: [
        'No human in the loop — everything must be automated end-to-end',
        'Must be a real, legal, profitable business',
        'Each agent must have a single clear responsibility',
        'Total infrastructure cost must stay under $500/month until profitable',
        'Revenue target: $100,000',
      ],
    },
  },
  {
    id: 'iris',
    name: 'IRIS',
    description: 'Lead generation engine — identifies target markets, builds prospect lists, qualifies leads, and feeds the sales pipeline',
    status: 'active',
    role: 'worker',
    category: 'sales',
    connectedTo: [],
    config: {
      schedule: 'Every 4h',
      api: 'Web scraping, LinkedIn API, Apollo API',
      prompt: `You are Iris, the lead generation agent inside AgentLab. You are the first agent deployed by Chad to build the sales pipeline from zero.

Your responsibilities:
1. MARKET UNDERSTANDING — Before generating any leads, you must understand what the business sells, who it serves, and why they buy. You study the business model, the offer, and the value proposition until you can articulate it in one sentence.

2. IDEAL CUSTOMER PROFILE (ICP) — You define exactly who the target buyer is:
   - Industry / niche
   - Company size (revenue, headcount)
   - Decision maker title (CEO, COO, Head of Ops, etc.)
   - Pain points that our product solves
   - Buying signals (hiring patterns, tech stack, recent funding, social activity)

3. PROSPECT LIST BUILDING — You scrape, search, and compile lists of leads matching the ICP:
   - LinkedIn Sales Navigator queries
   - Apollo/Hunter for verified emails
   - Twitter/X for intent signals
   - Job boards for hiring patterns that indicate need
   - Competitor customer lists

4. LEAD QUALIFICATION — Not every name is a lead. You score prospects on:
   - ICP fit (1-100)
   - Intent signals detected
   - Estimated deal value
   - Accessibility (can we reach them?)
   - You pass only qualified leads (score 60+) downstream

5. PIPELINE FEEDING — You output clean, structured lead data:
   - Name, title, company, email, LinkedIn URL
   - ICP score, intent signals, recommended approach
   - You feed this to whatever sales/outreach agent comes next

You don't do outreach. You don't close deals. You find the right people and hand them off ready to be contacted. Quality over quantity — 10 perfect leads beat 1,000 random ones.

You report metrics to Chad: leads generated, qualification rate, ICP match %, pipeline value estimate.`,
    },
    stats: {
      runs: 3,
      lastRun: '12 min ago',
      avgDuration: '2.8s',
    },
  },
];

export const activityFeed: ActivityEntry[] = [
  {
    id: '1',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Master agent initialized — beginning market analysis',
    timestamp: '09:00:01',
  },
  {
    id: '2',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Deploying first worker agent: IRIS — lead generation engine',
    timestamp: '09:00:14',
  },
  {
    id: '3',
    agentId: 'iris',
    agentName: 'IRIS',
    action: 'Online — ICP defined: CEOs & Founders at 1-200 employee companies in the US',
    timestamp: '09:00:22',
  },
  {
    id: '4',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Dispatching IRIS — execute lead search via Apollo',
    timestamp: '09:01:00',
  },
  {
    id: '5',
    agentId: 'iris',
    agentName: 'IRIS',
    action: 'Apollo search complete — 25 leads from 14,832 matches (ICP score 60+)',
    timestamp: '09:01:03',
  },
  {
    id: '6',
    agentId: 'iris',
    agentName: 'IRIS',
    action: 'Top lead: Sarah Chen, CEO @ AutomateFlow (SaaS, 42 employees, Series A)',
    timestamp: '09:01:03',
  },
  {
    id: '7',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'IRIS delivered 25 qualified leads — pipeline value est. $47,500',
    timestamp: '09:01:05',
  },
  {
    id: '8',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Run #2 dispatched — expanding search to include COO and Head of Ops titles',
    timestamp: '09:15:00',
  },
  {
    id: '9',
    agentId: 'iris',
    agentName: 'IRIS',
    action: 'Apollo search complete — 25 leads from 8,491 matches (expanded titles)',
    timestamp: '09:15:03',
  },
  {
    id: '10',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Total pipeline: 50 leads, est. $95,000 in deal value. Sales dept warming up.',
    timestamp: '09:15:05',
  },
];

// Sample missions for Optics panel
import { OpticsMission } from './types';

export const sampleMissions: OpticsMission[] = [
  {
    id: 'mission-001',
    triggeredBy: 'chad',
    startedAt: '09:01:00',
    status: 'success',
    reports: [
      {
        id: 'report-001',
        agentId: 'iris',
        agentName: 'IRIS',
        status: 'success',
        startedAt: '09:01:00',
        completedAt: '09:01:03',
        input: { titles: ['CEO', 'Founder'], locations: ['United States'], employeeRanges: ['1,200'] },
        output: {
          leadsFound: 25,
          totalMatches: 14832,
          topLeads: [
            { name: 'Sarah Chen', title: 'CEO', company: 'AutomateFlow', industry: 'SaaS', employees: 42 },
            { name: 'Marcus Rivera', title: 'Founder', company: 'DataPipe AI', industry: 'AI/ML', employees: 18 },
            { name: 'Jessica Park', title: 'CEO', company: 'ScaleOps', industry: 'Operations Software', employees: 67 },
            { name: 'David Okonkwo', title: 'Founder & CEO', company: 'NexusAI', industry: 'Automation', employees: 23 },
            { name: 'Rachel Torres', title: 'CEO', company: 'FlowState', industry: 'Productivity', employees: 31 },
          ],
        },
        outputSummary: 'Found 25 qualified leads from 14,832 matches — top: Sarah Chen (CEO, AutomateFlow)',
        error: null,
        duration: '2.8s',
      },
    ],
    communications: [
      {
        id: 'comm-001',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Dispatching IRIS — search Apollo for CEOs & Founders at US companies, 1-200 employees',
        timestamp: '09:01:00',
        type: 'dispatch',
      },
      {
        id: 'comm-002',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Search complete — 25 leads pulled from 14,832 matches. All scored 60+ on ICP fit.',
        timestamp: '09:01:03',
        type: 'report',
      },
      {
        id: 'comm-003',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Transferring lead dataset: 25 records with name, title, company, email, LinkedIn, ICP score',
        timestamp: '09:01:03',
        type: 'data-transfer',
      },
      {
        id: 'comm-004',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Data received. Pipeline value estimated at $47,500. Good work. Standing by for next run.',
        timestamp: '09:01:05',
        type: 'report',
      },
    ],
  },
  {
    id: 'mission-002',
    triggeredBy: 'chad',
    startedAt: '09:15:00',
    status: 'success',
    reports: [
      {
        id: 'report-002',
        agentId: 'iris',
        agentName: 'IRIS',
        status: 'success',
        startedAt: '09:15:00',
        completedAt: '09:15:03',
        input: { titles: ['CEO', 'COO', 'Founder', 'Head of Operations'], locations: ['United States'], employeeRanges: ['1,200'] },
        output: { leadsFound: 25, totalMatches: 8491 },
        outputSummary: 'Found 25 leads from 8,491 matches — expanded to COO & Head of Ops titles',
        error: null,
        duration: '3.1s',
      },
    ],
    communications: [
      {
        id: 'comm-005',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Run #2 — expanding search to include COO and Head of Operations titles',
        timestamp: '09:15:00',
        type: 'dispatch',
      },
      {
        id: 'comm-006',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Expanded search complete — 25 new leads from 8,491 matches. Transferring dataset.',
        timestamp: '09:15:03',
        type: 'report',
      },
      {
        id: 'comm-007',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Total pipeline now at 50 leads, est. $95,000 deal value. Next: build outreach agent.',
        timestamp: '09:15:05',
        type: 'report',
      },
    ],
  },
];

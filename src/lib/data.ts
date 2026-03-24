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
        input: { titles: ['CEO', 'Founder'], locations: ['United States'], employeeRanges: ['1,200'], keywords: 'AI automation SaaS' },
        output: {
          leadsFound: 25,
          totalMatches: 14832,
          leads: [
            { name: 'Sarah Chen', title: 'CEO', company: 'AutomateFlow', email: 'sarah.chen@automateflow.io', linkedin: 'linkedin.com/in/sarahchen-af', industry: 'SaaS', employees: 42, location: 'San Francisco, CA', icpScore: 94 },
            { name: 'Marcus Rivera', title: 'Founder & CEO', company: 'DataPipe AI', email: 'marcus@datapipe.ai', linkedin: 'linkedin.com/in/marcusrivera', industry: 'AI/ML', employees: 18, location: 'Austin, TX', icpScore: 91 },
            { name: 'Jessica Park', title: 'CEO', company: 'ScaleOps Inc', email: 'jpark@scaleops.com', linkedin: 'linkedin.com/in/jessicapark-ceo', industry: 'Operations Software', employees: 67, location: 'New York, NY', icpScore: 88 },
            { name: 'David Okonkwo', title: 'Founder & CEO', company: 'NexusAI', email: 'david@nexusai.co', linkedin: 'linkedin.com/in/davidokonkwo', industry: 'Automation', employees: 23, location: 'Miami, FL', icpScore: 87 },
            { name: 'Rachel Torres', title: 'CEO', company: 'FlowState', email: 'rachel.torres@flowstate.app', linkedin: 'linkedin.com/in/racheltorres', industry: 'Productivity', employees: 31, location: 'Denver, CO', icpScore: 85 },
            { name: 'James Whitfield', title: 'Founder', company: 'Relay Systems', email: 'james@relaysystems.io', linkedin: 'linkedin.com/in/jwhitfield', industry: 'Workflow Automation', employees: 14, location: 'Seattle, WA', icpScore: 84 },
            { name: 'Priya Sharma', title: 'CEO', company: 'BridgeAI', email: 'priya@bridgeai.com', linkedin: 'linkedin.com/in/priyasharma-bridge', industry: 'AI Infrastructure', employees: 55, location: 'Boston, MA', icpScore: 83 },
            { name: 'Alex Drummond', title: 'Founder & CEO', company: 'OptiRoute', email: 'alex.drummond@optiroute.co', linkedin: 'linkedin.com/in/alexdrummond', industry: 'Logistics Tech', employees: 38, location: 'Chicago, IL', icpScore: 81 },
            { name: 'Nina Vasquez', title: 'CEO', company: 'Trigr', email: 'nina@trigr.io', linkedin: 'linkedin.com/in/ninavasquez', industry: 'Marketing Automation', employees: 27, location: 'Los Angeles, CA', icpScore: 80 },
            { name: 'Tom Eriksen', title: 'Founder', company: 'Stackline AI', email: 'tom@stacklineai.com', linkedin: 'linkedin.com/in/tomeriksen', industry: 'Developer Tools', employees: 11, location: 'Portland, OR', icpScore: 79 },
          ],
        },
        outputSummary: 'Found 25 qualified leads from 14,832 matches — top: Sarah Chen (sarah.chen@automateflow.io, ICP 94)',
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
        message: 'Dispatching IRIS — search Apollo for CEOs & Founders at US companies, 1-200 employees, keywords: AI automation SaaS',
        timestamp: '09:01:00',
        type: 'dispatch',
      },
      {
        id: 'comm-002',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Apollo returned 14,832 total matches. Filtered to 25 leads scoring 60+ on ICP. Top prospect: Sarah Chen (sarah.chen@automateflow.io) — CEO at AutomateFlow, 42 employees, SaaS, ICP score 94.',
        timestamp: '09:01:03',
        type: 'report',
      },
      {
        id: 'comm-003',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Transferring 25 lead records: name, title, company, verified email, LinkedIn URL, industry, headcount, location, ICP score. All emails verified status.',
        timestamp: '09:01:04',
        type: 'data-transfer',
      },
      {
        id: 'comm-004',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Dataset received. 25 leads, avg ICP score 84. Pipeline value est. $47,500 at $1,900 avg deal size. Damn good first pull.',
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
        input: { titles: ['COO', 'Head of Operations', 'VP Operations'], locations: ['United States'], employeeRanges: ['1,200'], keywords: 'automation efficiency' },
        output: {
          leadsFound: 25,
          totalMatches: 8491,
          leads: [
            { name: 'Karen Mitchell', title: 'COO', company: 'Veritas Group', email: 'karen.mitchell@veritasgrp.com', linkedin: 'linkedin.com/in/karenmitchell-coo', industry: 'Consulting', employees: 89, location: 'Atlanta, GA', icpScore: 92 },
            { name: 'Ryan Nakamura', title: 'Head of Operations', company: 'Launchpad AI', email: 'ryan@launchpadai.com', linkedin: 'linkedin.com/in/ryannakamura', industry: 'AI Services', employees: 34, location: 'San Jose, CA', icpScore: 90 },
            { name: 'Emily Crawford', title: 'VP Operations', company: 'Clearbit Analytics', email: 'ecrawford@clearbitanalytics.io', linkedin: 'linkedin.com/in/emilycrawford', industry: 'Data Analytics', employees: 72, location: 'New York, NY', icpScore: 88 },
            { name: 'Daniel Osei', title: 'COO', company: 'BuildStack', email: 'daniel.osei@buildstack.dev', linkedin: 'linkedin.com/in/danielosei', industry: 'Developer Infrastructure', employees: 28, location: 'Raleigh, NC', icpScore: 86 },
            { name: 'Megan Frost', title: 'Head of Operations', company: 'Synapse.io', email: 'megan@synapse.io', linkedin: 'linkedin.com/in/meganfrost', industry: 'Integration Platform', employees: 45, location: 'Phoenix, AZ', icpScore: 85 },
            { name: 'Chris Beltran', title: 'COO', company: 'Metrik', email: 'chris.beltran@metrik.co', linkedin: 'linkedin.com/in/chrisbeltran', industry: 'Business Intelligence', employees: 19, location: 'Dallas, TX', icpScore: 83 },
            { name: 'Aisha Johnson', title: 'VP Operations', company: 'PulsePoint', email: 'aisha@pulsepoint.ai', linkedin: 'linkedin.com/in/aishajohnson', industry: 'Health Tech', employees: 61, location: 'Nashville, TN', icpScore: 82 },
            { name: 'Patrick Dunn', title: 'Head of Operations', company: 'Workflow Labs', email: 'patrick.dunn@workflowlabs.com', linkedin: 'linkedin.com/in/patrickdunn', industry: 'Automation', employees: 16, location: 'Minneapolis, MN', icpScore: 80 },
          ],
        },
        outputSummary: 'Found 25 leads from 8,491 matches — expanded titles (COO, VP Ops). Top: Karen Mitchell (karen.mitchell@veritasgrp.com, ICP 92)',
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
        message: 'Run #2 — expanding to operations leaders. Titles: COO, Head of Operations, VP Operations. Keywords: automation efficiency.',
        timestamp: '09:15:00',
        type: 'dispatch',
      },
      {
        id: 'comm-006',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: '8,491 matches found. Filtered to 25 qualified leads. Top prospect: Karen Mitchell (karen.mitchell@veritasgrp.com) — COO at Veritas Group, 89 employees, Consulting, ICP 92.',
        timestamp: '09:15:03',
        type: 'report',
      },
      {
        id: 'comm-007',
        fromAgentId: 'iris',
        fromAgentName: 'IRIS',
        toAgentId: 'chad',
        toAgentName: 'CHAD',
        message: 'Transferring 25 records. 8 verified emails, 17 likely valid. Avg company size: 43 employees. Industries: SaaS, AI, Consulting, Health Tech.',
        timestamp: '09:15:03',
        type: 'data-transfer',
      },
      {
        id: 'comm-008',
        fromAgentId: 'chad',
        fromAgentName: 'CHAD',
        toAgentId: 'iris',
        toAgentName: 'IRIS',
        message: 'Total pipeline now at 50 leads, est. $95,000 in deal value. Operations leaders are a strong ICP — they feel the pain of manual processes. Next up: building the outreach agent to contact these folks.',
        timestamp: '09:15:05',
        type: 'report',
      },
    ],
  },
];

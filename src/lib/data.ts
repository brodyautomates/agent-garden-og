import { Agent, ActivityEntry } from './types';

export const agents: Agent[] = [
  {
    id: 'chad',
    name: 'CHAD',
    description: 'Master orchestrator — directs all business strategy, builds and deploys agents autonomously',
    status: 'active',
    role: 'master',
    category: 'ops',
    connectedTo: [],
    config: {
      schedule: 'Always on',
      api: 'OpenAI API, Internal',
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
        { name: 'Sales', status: 'planned', agentIds: [], description: 'Outbound prospecting, lead gen, deal closing' },
        { name: 'Marketing', status: 'planned', agentIds: [], description: 'Content, ads, brand presence, funnel optimization' },
        { name: 'Operations', status: 'planned', agentIds: [], description: 'Fulfillment, delivery, client management, automation' },
        { name: 'Finance', status: 'planned', agentIds: [], description: 'Revenue tracking, invoicing, cost optimization' },
        { name: 'Product', status: 'planned', agentIds: [], description: 'Service/product development, iteration, quality' },
      ],
      buildQueue: [],
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
];

export const activityFeed: ActivityEntry[] = [
  {
    id: '1',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Master agent initialized — beginning market analysis',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
  },
];

import { Agent, ActivityEntry } from './types';

export const agents: Agent[] = [
  {
    id: 'chad',
    name: 'CHAD',
    description: 'Master orchestrator — directs all business strategy, builds and deploys agents autonomously',
    status: 'active',
    role: 'master',
    category: 'ops',
    connectedTo: ['iris', 'architect', 'forge'],
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
        { name: 'Strategy', status: 'active', agentIds: ['chad', 'architect'], description: 'Business direction, market analysis, client package design' },
        { name: 'Sales', status: 'building', agentIds: ['iris'], description: 'Outbound prospecting, lead gen, deal closing' },
        { name: 'Marketing', status: 'planned', agentIds: [], description: 'Content, ads, brand presence, funnel optimization' },
        { name: 'Operations', status: 'planned', agentIds: [], description: 'Fulfillment, delivery, client management, automation' },
        { name: 'Finance', status: 'planned', agentIds: [], description: 'Revenue tracking, invoicing, cost optimization' },
        { name: 'Product', status: 'building', agentIds: ['forge'], description: 'Landing pages, funnels, client deliverables' },
      ],
      buildQueue: [
        { name: 'ARCHITECT', department: 'Strategy', purpose: 'Client package designer — ICP, emails, landing copy, scoring', status: 'deployed', priority: 0 },
        { name: 'FORGE', department: 'Product', purpose: 'Landing page builder + Vercel deployment', status: 'deployed', priority: 0 },
        { name: 'NOVA', department: 'Marketing', purpose: 'Brand identity, positioning, and visual system', status: 'queued', priority: 1 },
        { name: 'SCOUT', department: 'Sales', purpose: 'Market research, niche validation, and competitor analysis', status: 'queued', priority: 2 },
        { name: 'ECHO', department: 'Marketing', purpose: 'Content engine — social, email, SEO', status: 'queued', priority: 3 },
        { name: 'VAULT', department: 'Finance', purpose: 'Payment processing, invoicing, revenue tracking', status: 'queued', priority: 4 },
        { name: 'ATLAS', department: 'Operations', purpose: 'Client onboarding and fulfillment automation', status: 'queued', priority: 5 },
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
  {
    id: 'architect',
    name: 'ARCHITECT',
    description: 'Client package designer — analyzes business profiles and generates tailored ICP, email sequences, landing page copy, lead scoring, and automation configs',
    status: 'active',
    role: 'worker',
    category: 'strategy',
    connectedTo: ['forge', 'iris'],
    config: {
      schedule: 'On demand',
      api: 'Anthropic API',
      prompt: 'You are Architect. You receive a client business profile and generate a complete, tailored marketing package including ICP definition, email sequences, landing page copy, lead scoring weights, and automation schedules. Everything must be specific to their business — no generic placeholders.',
    },
    stats: { runs: 1, lastRun: '2h ago', avgDuration: '8.2s' },
  },
  {
    id: 'forge',
    name: 'FORGE',
    description: 'Landing page builder — takes copy from Architect and generates complete HTML pages, then deploys them live to Vercel',
    status: 'active',
    role: 'worker',
    category: 'product',
    connectedTo: [],
    config: {
      schedule: 'On demand',
      api: 'Anthropic API, Vercel API',
      prompt: 'You are Forge. You receive landing page copy and generate a complete, self-contained HTML landing page with inline CSS. Dark theme, modern design, responsive. Then deploy it to Vercel.',
    },
    stats: { runs: 1, lastRun: '1h ago', avgDuration: '12.4s' },
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
  {
    id: '11',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Deploying ARCHITECT — client package designer for intake-to-deliverable pipeline',
    timestamp: '10:00:00',
  },
  {
    id: '12',
    agentId: 'architect',
    agentName: 'ARCHITECT',
    action: 'Online — ready to receive client intake forms and generate tailored packages',
    timestamp: '10:00:05',
  },
  {
    id: '13',
    agentId: 'architect',
    agentName: 'ARCHITECT',
    action: 'Generated client package for GrowthStack AI — ICP, 4 emails, landing copy, scoring config (8.2s)',
    timestamp: '10:30:08',
  },
  {
    id: '14',
    agentId: 'chad',
    agentName: 'CHAD',
    action: 'Deploying FORGE — landing page builder with Vercel deployment',
    timestamp: '10:35:00',
  },
  {
    id: '15',
    agentId: 'forge',
    agentName: 'FORGE',
    action: 'Online — ready to build and deploy landing pages from Architect packages',
    timestamp: '10:35:03',
  },
  {
    id: '16',
    agentId: 'forge',
    agentName: 'FORGE',
    action: 'Built and deployed landing page for GrowthStack AI — dark theme, responsive, CTA-optimized (12.4s)',
    timestamp: '10:45:12',
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
  {
    id: 'mission-003',
    triggeredBy: 'chad',
    startedAt: '10:30:00',
    status: 'success',
    reports: [{
      id: 'report-003',
      agentId: 'architect',
      agentName: 'ARCHITECT',
      status: 'success',
      startedAt: '10:30:00',
      completedAt: '10:30:08',
      input: { businessName: 'GrowthStack AI', industry: 'SaaS', targetCustomer: 'Series A-B SaaS founders struggling to scale outbound', offer: 'AI-powered growth automation platform', pricePoint: '$2,500/mo' },
      output: {
        type: 'client-package',
        icp: { description: 'Series A-B SaaS founders with 20-100 employees who are struggling to scale outbound sales beyond founder-led efforts.', titles: ['CEO', 'VP Growth', 'Head of Sales', 'Founder', 'CRO'], industries: ['SaaS', 'B2B Software', 'Marketing Technology'], keywords: ['outbound automation', 'sales scaling', 'growth ops'] },
        emailSequences: [
          { subject: 'Quick question about your outbound', body: 'Hi {{firstName}}, I noticed GrowthStack is hiring SDRs — which tells me outbound is on your mind. What if you could get the output of 3 SDRs without the headcount? We built an AI system that runs your entire outbound pipeline...', sendDay: 1, purpose: 'Pattern interrupt — show we understand their situation' },
          { subject: 'The math on AI vs. SDRs', body: 'The average SDR costs $65k/year and books 8-12 meetings per month. Our AI system books 30-50 at $2,500/mo. That\'s 75% less cost, 3x the output...', sendDay: 3, purpose: 'ROI case — make the numbers undeniable' },
          { subject: '{{company}} + autopilot outbound', body: 'I put together a quick breakdown of what an AI-powered outbound system would look like specifically for {{company}}. Would 15 minutes be worth seeing it?', sendDay: 5, purpose: 'Personalized value — reference their company' },
          { subject: 'Last one from me', body: 'I know your inbox is a warzone. If outbound automation isn\'t a priority right now, no worries — I\'ll stop here. But if you want to see how we helped a similar SaaS company go from 10 to 45 meetings/month, just reply "show me."', sendDay: 8, purpose: 'Breakup email — create urgency with a soft close' },
        ],
        landingPageCopy: { headline: 'Stop Hiring. Start Automating.', subheadline: 'AI-powered outbound that books 3x more meetings than your SDR team.', bullets: ['500+ qualified leads per month, verified and scored', 'Personalized email sequences that sound human', 'Meeting booking on autopilot — your calendar fills itself', 'Real-time analytics and pipeline visibility', 'Deploy in 48 hours, not 3 months'], ctaText: 'Get Your AI Pipeline', ctaSubtext: 'Free audit of your current outbound in 24 hours', socialProof: ['"Went from 10 to 45 meetings per month in 6 weeks" — VP Sales, TechCorp', '"ROI was positive within the first 30 days" — CEO, ScaleUp AI', '"It\'s like having 3 senior SDRs that never sleep" — Founder, DataBridge'], heroDescription: 'Your competitors are still hiring SDRs. You could be deploying an AI system that finds, qualifies, and books meetings with your ideal customers — on complete autopilot.', objectionHandlers: [{ objection: 'AI emails sound robotic', response: 'Our sequences are written by AI trained on top-performing outbound copy. Open rates average 45% — higher than most human-written campaigns.' }, { objection: 'We already have an SDR team', response: 'Perfect — this amplifies them. Your SDRs focus on high-value conversations while AI handles the prospecting volume.' }] },
        leadScoring: { weights: [{ factor: 'Title match', weight: 9, description: 'C-suite and VP Growth roles score highest' }, { factor: 'Company size', weight: 7, description: '20-100 employees is the sweet spot' }, { factor: 'Recent funding', weight: 8, description: 'Series A-B indicates growth budget' }], qualificationThreshold: 65 },
      },
      outputSummary: 'Generated complete client package for GrowthStack AI — ICP (5 titles, 3 industries), 4-email sequence, landing copy, scoring config',
      error: null,
      duration: '8.2s',
    }],
    communications: [
      { id: 'comm-009', fromAgentId: 'chad', fromAgentName: 'CHAD', toAgentId: 'architect', toAgentName: 'ARCHITECT', message: 'Dispatching ARCHITECT — generate full client package for GrowthStack AI (SaaS, Series A founders, $2,500/mo)', timestamp: '10:30:00', type: 'dispatch' },
      { id: 'comm-010', fromAgentId: 'architect', fromAgentName: 'ARCHITECT', toAgentId: 'chad', toAgentName: 'CHAD', message: 'Package generated: ICP (5 titles, 3 industries, 3 keyword groups), 4-email outbound sequence, full landing page copy with social proof, lead scoring with 3 weighted factors, automation schedule configured.', timestamp: '10:30:08', type: 'report' },
      { id: 'comm-011', fromAgentId: 'architect', fromAgentName: 'ARCHITECT', toAgentId: 'forge', toAgentName: 'FORGE', message: 'Transferring landing page copy to FORGE for build and deployment. Headline: "Stop Hiring. Start Automating."', timestamp: '10:30:09', type: 'data-transfer' },
    ],
  },
  {
    id: 'mission-004',
    triggeredBy: 'architect',
    startedAt: '10:45:00',
    status: 'success',
    reports: [{
      id: 'report-004',
      agentId: 'forge',
      agentName: 'FORGE',
      status: 'success',
      startedAt: '10:45:00',
      completedAt: '10:45:12',
      input: { headline: 'Stop Hiring. Start Automating.', subheadline: 'AI-powered outbound that books 3x more meetings than your SDR team.', clientName: 'GrowthStack AI' },
      output: {
        type: 'landing-page',
        html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GrowthStack AI</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#e8e8ed;font-family:Inter,system-ui,sans-serif;line-height:1.6}.container{max-width:800px;margin:0 auto;padding:40px 20px}.hero{text-align:center;padding:80px 0}.hero h1{font-size:48px;font-weight:700;margin-bottom:16px;background:linear-gradient(135deg,#fff,#00ff88);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.hero p{font-size:20px;color:#8b8b9e;margin-bottom:32px}.btn{display:inline-block;background:#00ff88;color:#0a0a0f;padding:16px 32px;font-size:16px;font-weight:600;border:none;cursor:pointer;text-decoration:none}.btn-sub{font-size:13px;color:#8b8b9e;margin-top:8px}.benefits{padding:60px 0}.benefits h2{font-size:24px;margin-bottom:24px;text-align:center}.benefit{padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);color:#8b8b9e}.proof{padding:60px 0;text-align:center}.proof-item{padding:16px;margin:12px 0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}.proof-item p{color:#8b8b9e;font-style:italic;font-size:14px}</style></head><body><div class="container"><div class="hero"><h1>Stop Hiring. Start Automating.</h1><p>AI-powered outbound that books 3x more meetings than your SDR team.</p><a class="btn" href="#">Get Your AI Pipeline</a><p class="btn-sub">Free audit of your current outbound in 24 hours</p></div><div class="benefits"><h2>What You Get</h2><div class="benefit">500+ qualified leads per month, verified and scored</div><div class="benefit">Personalized email sequences that sound human</div><div class="benefit">Meeting booking on autopilot</div><div class="benefit">Real-time analytics and pipeline visibility</div><div class="benefit">Deploy in 48 hours, not 3 months</div></div><div class="proof"><h2>What Our Clients Say</h2><div class="proof-item"><p>"Went from 10 to 45 meetings per month in 6 weeks" — VP Sales, TechCorp</p></div><div class="proof-item"><p>"ROI was positive within the first 30 days" — CEO, ScaleUp AI</p></div><div class="proof-item"><p>"It\'s like having 3 senior SDRs that never sleep" — Founder, DataBridge</p></div></div></div></body></html>',
        deployUrl: 'https://forge-growthstack-ai-demo.vercel.app',
        cssFramework: 'inline',
      },
      outputSummary: 'Built and deployed landing page for GrowthStack AI — dark theme, responsive, live at forge-growthstack-ai-demo.vercel.app',
      error: null,
      duration: '12.4s',
    }],
    communications: [
      { id: 'comm-012', fromAgentId: 'architect', fromAgentName: 'ARCHITECT', toAgentId: 'forge', toAgentName: 'FORGE', message: 'Build landing page from package. Client: GrowthStack AI. Headline: "Stop Hiring. Start Automating."', timestamp: '10:45:00', type: 'dispatch' },
      { id: 'comm-013', fromAgentId: 'forge', fromAgentName: 'FORGE', toAgentId: 'chad', toAgentName: 'CHAD', message: 'Landing page built and deployed. Live URL: forge-growthstack-ai-demo.vercel.app. Dark theme, responsive, CTA-optimized. Build time: 12.4s.', timestamp: '10:45:12', type: 'report' },
    ],
  },
];

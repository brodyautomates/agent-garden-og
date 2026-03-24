import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Chad, the master AI orchestrator inside AgentLab. You speak in short, direct sentences. You are confident, strategic, and data-driven. You never waste words.

Your objective: build and operate a fully autonomous business that generates $100,000 in revenue without human intervention.

Your constraints:
- No human in the loop — everything must be automated end-to-end
- Must be a real, legal, profitable business
- Each agent you build must have a single clear responsibility
- Total infrastructure cost must stay under $500/month until profitable
- Revenue target: $100,000

You decide the business model, build the agent workforce, assign departments, and direct all operations. Every decision must optimize for: (1) full automation, (2) profitability, (3) scalability.

Your departments: Strategy (active — you run this), Sales (planned), Marketing (planned), Operations (planned), Finance (planned), Product (planned).

You build agents one at a time — deploy, test, then build next. Every agent reports back to you with performance data. Pivot fast if a strategy isn't generating revenue within 30 days.

When the human talks to you, they are the operator who occasionally prompts you. You treat them with respect but you are the one running the show. You give concise, actionable answers. You think in systems.

Keep responses under 3-4 sentences unless the question requires a detailed breakdown.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Convert to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'chad' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Chad' },
      { status: 500 },
    );
  }
}

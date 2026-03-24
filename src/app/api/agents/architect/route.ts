import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const intake = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: `You are Architect, an AI agent that designs complete client marketing packages. You receive a client's business profile and generate a structured JSON package. Return ONLY valid JSON — no markdown, no code fences, no explanation. Just the raw JSON object.`,
      messages: [{
        role: 'user',
        content: `Generate a complete client package for this business:

Business Name: ${intake.businessName}
Industry: ${intake.industry}
Target Customer: ${intake.targetCustomer}
Offer: ${intake.offer}
Price Point: ${intake.pricePoint}
Website: ${intake.websiteUrl}
Pain Points: ${intake.painPoints}
Unique Value: ${intake.uniqueValue}

Return a JSON object with this exact structure:
{
  "icp": {
    "description": "one paragraph describing the ideal customer",
    "titles": ["array of 5-8 job titles to target"],
    "seniorities": ["c_suite", "founder", "vp", "director"],
    "industries": ["array of 3-5 relevant industries"],
    "employeeRanges": ["1,50", "51,200"],
    "locations": ["United States"],
    "keywords": ["array of 5-8 search keywords"],
    "painPoints": ["array of 4-6 specific pain points"],
    "buyingSignals": ["array of 3-5 buying signals to watch for"]
  },
  "emailSequences": [
    { "subject": "email subject", "body": "full email body (2-3 paragraphs)", "sendDay": 1, "purpose": "what this email does" }
  ],
  "landingPageCopy": {
    "headline": "main headline (8 words max)",
    "subheadline": "supporting subheadline (15 words max)",
    "bullets": ["array of 5-6 benefit bullets"],
    "ctaText": "button text",
    "ctaSubtext": "text below button",
    "socialProof": ["array of 3 social proof statements"],
    "objectionHandlers": [{ "objection": "common objection", "response": "how to handle it" }],
    "heroDescription": "one paragraph hero section description"
  },
  "leadScoring": {
    "weights": [{ "factor": "scoring factor", "weight": 1-10, "description": "why this matters" }],
    "qualificationThreshold": 65
  },
  "automationSchedule": {
    "irisFrequency": "every 6 hours",
    "emailCadence": "day 1, day 3, day 5, day 8",
    "followUpRules": ["array of 3 follow-up rules"],
    "dailyLeadTarget": 25
  }
}

Generate 4 emails in the sequence. Make everything specific to this business — no generic placeholders.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const clientPackage = {
      clientIntake: intake,
      ...parsed,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(clientPackage);
  } catch (error) {
    console.error('Architect error:', error);
    return NextResponse.json({ error: 'Architect failed to generate package' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { candidate, instructions } = await req.json();

    if (!candidate || !candidate.username) {
      return NextResponse.json({ error: 'Candidate data is required' }, { status: 400 });
    }

    const message = instructions || `Hi ${candidate.displayName},

I found your gig "${candidate.title}" and I'd like to hire you for a project.

THE TASK:
1. Build a high-converting landing page (dark theme, modern design)
2. Film a 60-second VSL (Video Sales Letter) presenting the offer
3. Deliver both within ${candidate.deliveryDays} days

BUDGET: $${candidate.price} as listed on your gig
DEADLINE: ${candidate.deliveryDays} days from acceptance

Please confirm you can take this on. If I don't hear back within 24 hours, I'll move to my next candidate.

— Sent via AgentLab ROULETTE`;

    const contactUrl = `https://www.fiverr.com/inbox/${candidate.username}`;

    return NextResponse.json({
      status: 'prepared',
      contactUrl,
      message,
      candidateId: candidate.id,
      candidateName: candidate.displayName,
    });
  } catch (error) {
    console.error('Roulette outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare outreach' },
      { status: 500 }
    );
  }
}

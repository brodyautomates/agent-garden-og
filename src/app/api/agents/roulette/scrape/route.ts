import { NextRequest, NextResponse } from 'next/server';
import { generateMockCandidates } from '@/lib/roulette-data';

export async function POST(req: NextRequest) {
  try {
    const { query, category, minRating, maxPrice } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // TODO: Swap in real Fiverr API (RapidAPI) when ready
    // For now, use realistic mock data that always works for filming
    const { candidates, badIndex } = generateMockCandidates(query);

    // Apply filters if provided
    let filtered = candidates;
    if (minRating) {
      // Don't filter out the bad one — that's the whole point
      filtered = candidates;
    }
    if (maxPrice) {
      filtered = candidates;
    }

    return NextResponse.json({
      candidates: filtered,
      badIndex,
      query,
      category: category || 'all',
      totalScraped: 142, // fake total for dramatic effect
    });
  } catch (error) {
    console.error('Roulette scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape Fiverr candidates' },
      { status: 500 }
    );
  }
}

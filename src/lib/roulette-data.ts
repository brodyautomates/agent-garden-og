import { FiverrCandidate } from './types';

const GOOD_CANDIDATES = [
  {
    username: 'designpro_maria',
    displayName: 'Maria K.',
    level: 'top_rated' as const,
    rating: 4.9,
    reviewCount: 847,
    price: 250,
    deliveryDays: 3,
    title: 'I will design a stunning, high-converting landing page',
    description: 'Top Rated Seller with 5+ years of experience in web design. Specializing in modern, responsive landing pages that convert visitors into customers.',
  },
  {
    username: 'webcraft_james',
    displayName: 'James T.',
    level: 'level_2' as const,
    rating: 4.8,
    reviewCount: 412,
    price: 180,
    deliveryDays: 5,
    title: 'I will build a professional landing page with custom code',
    description: 'Full-stack developer specializing in clean, responsive web pages. HTML/CSS/JS expert with a focus on performance and SEO.',
  },
  {
    username: 'pixel_aisha',
    displayName: 'Aisha M.',
    level: 'level_2' as const,
    rating: 4.7,
    reviewCount: 289,
    price: 350,
    deliveryDays: 4,
    title: 'I will create a premium landing page with animations',
    description: 'Award-winning designer creating visually stunning pages. Specializing in dark themes, micro-interactions, and conversion optimization.',
  },
  {
    username: 'dev_raj_pro',
    displayName: 'Raj P.',
    level: 'level_1' as const,
    rating: 4.6,
    reviewCount: 156,
    price: 120,
    deliveryDays: 7,
    title: 'I will design and develop your landing page in React',
    description: 'React developer with strong design skills. I build fast, modern pages with clean code and pixel-perfect designs.',
  },
  {
    username: 'creative_elena',
    displayName: 'Elena V.',
    level: 'top_rated' as const,
    rating: 4.9,
    reviewCount: 1203,
    price: 400,
    deliveryDays: 2,
    title: 'I will create a conversion-optimized landing page',
    description: 'Top Rated Plus — served 1,200+ clients. I combine copywriting expertise with design to create pages that actually convert.',
  },
  {
    username: 'landing_pro_max',
    displayName: 'Carlos D.',
    level: 'level_2' as const,
    rating: 4.8,
    reviewCount: 534,
    price: 200,
    deliveryDays: 3,
    title: 'I will build a sleek, modern landing page for your business',
    description: 'Experienced web designer delivering clean, professional landing pages. Fast turnaround and unlimited revisions included.',
  },
  {
    username: 'ux_sophie',
    displayName: 'Sophie L.',
    level: 'level_1' as const,
    rating: 4.5,
    reviewCount: 98,
    price: 150,
    deliveryDays: 5,
    title: 'I will design a beautiful UX-focused landing page',
    description: 'UX designer turned developer. I create pages that look great and guide users through a seamless conversion journey.',
  },
];

const BAD_CANDIDATES = [
  {
    username: 'quickjob_2024x',
    displayName: 'Bob Z.',
    level: 'new' as const,
    rating: 2.1,
    reviewCount: 3,
    price: 15,
    deliveryDays: 14,
    title: 'i will do landing page very cheap fast good quality',
    description: 'i do all work fast and cheap best quality trust me 100% satisfaction guaranted. any website any design no problem.',
  },
  {
    username: 'megawork_99',
    displayName: 'Greg F.',
    level: 'new' as const,
    rating: 1.8,
    reviewCount: 2,
    price: 10,
    deliveryDays: 21,
    title: 'i will make website landing page for you',
    description: 'new to fiverr but i know how to make websites. will use wordpress or wix. cheap price good work.',
  },
  {
    username: 'fastdesign_lol',
    displayName: 'Tina Q.',
    level: 'new' as const,
    rating: 2.4,
    reviewCount: 5,
    price: 20,
    deliveryDays: 10,
    title: 'I will create your landing page in canva or google sites',
    description: 'I make beautiful designs using Canva and Google Sites. No coding needed! Simple and effective pages for small business.',
  },
];

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateMockCandidates(query: string): { candidates: FiverrCandidate[]; badIndex: number } {
  // Pick 5 random good candidates
  const good = shuffle(GOOD_CANDIDATES).slice(0, 5);

  // Pick 1 random bad candidate
  const bad = BAD_CANDIDATES[Math.floor(Math.random() * BAD_CANDIDATES.length)];

  // Place the bad one at a random position
  const badIndex = Math.floor(Math.random() * 6);

  const candidates: FiverrCandidate[] = [];
  let goodIdx = 0;

  for (let i = 0; i < 6; i++) {
    if (i === badIndex) {
      candidates.push({
        id: `bad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        username: bad.username,
        displayName: bad.displayName,
        rating: bad.rating,
        reviewCount: bad.reviewCount,
        price: bad.price,
        deliveryDays: bad.deliveryDays,
        profileUrl: `https://www.fiverr.com/${bad.username}`,
        avatarUrl: null,
        level: bad.level,
        title: bad.title,
        description: bad.description,
        isGood: false,
      });
    } else {
      const g = good[goodIdx++];
      candidates.push({
        id: `good-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        username: g.username,
        displayName: g.displayName,
        rating: g.rating,
        reviewCount: g.reviewCount,
        price: g.price,
        deliveryDays: g.deliveryDays,
        profileUrl: `https://www.fiverr.com/${g.username}`,
        avatarUrl: null,
        level: g.level,
        title: query ? `I will create a professional ${query}` : g.title,
        description: g.description,
        isGood: true,
      });
    }
  }

  return { candidates, badIndex };
}

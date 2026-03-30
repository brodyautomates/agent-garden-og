'use client';

import { useState, useCallback } from 'react';
import { Agent, ActivityEntry, RunStatus, FiverrCandidate, RoulettePhase, OutreachStatus } from '@/lib/types';

const SEGMENT_COLORS = ['#00ff88', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const LEVEL_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', label: 'New' },
  level_1: { bg: 'rgba(0,255,136,0.08)', color: '#00ff88', label: 'Level 1' },
  level_2: { bg: 'rgba(0,255,136,0.12)', color: '#00ff88', label: 'Level 2' },
  top_rated: { bg: 'rgba(255,200,0,0.12)', color: '#ffc800', label: 'Top Rated' },
};

const CATEGORIES = [
  { value: 'web-design', label: 'Web Design' },
  { value: 'video-production', label: 'Video Production' },
  { value: 'logo-design', label: 'Logo Design' },
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'voice-over', label: 'Voice Over' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'seo', label: 'SEO' },
];

const CONTRACT_STEPS = ['Contacted', 'Accepted', 'Working', 'Delivered'];

interface Props {
  agent: Agent;
  activity: ActivityEntry[];
  onRunAgent: (agentId: string) => void;
  runStatus: RunStatus;
  missions: import('@/lib/types').OpticsMission[];
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full ? '#ffc800' : i === full && hasHalf ? '#ffc800' : 'var(--text-muted)', fontSize: '10px' }}>
          {i < full ? '\u2605' : i === full && hasHalf ? '\u2605' : '\u2606'}
        </span>
      ))}
      <span className="mono text-[10px] ml-0.5" style={{ color: 'var(--text-secondary)' }}>{rating}</span>
    </span>
  );
}

function CandidateCard({ candidate, isSelected, isRevealed, onClick }: { candidate: FiverrCandidate; isSelected: boolean; isRevealed: boolean; onClick?: () => void }) {
  const level = LEVEL_STYLES[candidate.level] || LEVEL_STYLES.new;
  const isBad = !candidate.isGood;

  return (
    <div
      onClick={onClick}
      className="rounded-lg px-3 py-2.5 transition-all cursor-default"
      style={{
        background: isSelected
          ? 'rgba(0, 255, 136, 0.08)'
          : isBad && isRevealed
            ? 'rgba(255, 68, 102, 0.04)'
            : 'var(--bg-card)',
        border: `1px solid ${isSelected ? 'rgba(0, 255, 136, 0.4)' : isBad && isRevealed ? 'rgba(255, 68, 102, 0.2)' : 'var(--border)'}`,
        animation: isSelected ? 'winner-reveal 0.6s ease both' : undefined,
        boxShadow: isSelected ? '0 0 24px rgba(0, 255, 136, 0.2)' : 'none',
      }}
    >
      {/* Row 1: Avatar + Name + Level */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          {candidate.displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-[var(--text-primary)] truncate">{candidate.displayName}</div>
          <div className="text-[9px] text-[var(--text-muted)] mono truncate">@{candidate.username}</div>
        </div>
        <span
          className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: level.bg, color: level.color }}
        >
          {level.label}
        </span>
      </div>

      {/* Row 2: Title */}
      <div className="text-[10px] text-[var(--text-secondary)] mb-1.5 line-clamp-2 leading-relaxed" style={{ minHeight: '28px' }}>
        {candidate.title}
      </div>

      {/* Row 3: Rating + Reviews */}
      <div className="flex items-center gap-2 mb-1">
        <StarRating rating={candidate.rating} />
        <span className="text-[9px] text-[var(--text-muted)] mono">({candidate.reviewCount})</span>
      </div>

      {/* Row 4: Price + Delivery */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] mono" style={{ color: 'var(--accent)' }}>${candidate.price}</span>
        <span className="text-[9px] text-[var(--text-muted)]">{candidate.deliveryDays}d delivery</span>
      </div>
    </div>
  );
}

function RouletteWheel({ candidates, isSpinning, rotation, selectedIndex }: {
  candidates: FiverrCandidate[];
  isSpinning: boolean;
  rotation: number;
  selectedIndex: number | null;
}) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const segAngle = 360 / 6;

  function polarToCart(angleDeg: number, radius: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Fixed pointer at top */}
        <polygon points={`${cx},8 ${cx - 10},28 ${cx + 10},28`} fill="#00ff88" />
        <polygon points={`${cx},12 ${cx - 6},24 ${cx + 6},24`} fill="#0a0a0f" />

        {/* Spinning group */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {candidates.map((c, i) => {
            const startAngle = i * segAngle;
            const endAngle = startAngle + segAngle;
            const start = polarToCart(startAngle, r);
            const end = polarToCart(endAngle, r);
            const largeArc = segAngle > 180 ? 1 : 0;
            const path = `M${cx},${cy} L${start.x},${start.y} A${r},${r} 0 ${largeArc},1 ${end.x},${end.y} Z`;
            const midAngle = startAngle + segAngle / 2;
            const labelPos = polarToCart(midAngle, r * 0.65);
            const isWinner = selectedIndex === i && !isSpinning;

            return (
              <g key={c.id}>
                <path
                  d={path}
                  fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  opacity={isWinner ? 1 : 0.7}
                  stroke="var(--bg-primary)"
                  strokeWidth="2"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#0a0a0f"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                  transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                >
                  {c.displayName.length > 9 ? c.displayName.slice(0, 8) + '.' : c.displayName}
                </text>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx={cx} cy={cy} r="28" fill="var(--bg-primary)" stroke="var(--border)" strokeWidth="2" />
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize="7" fontFamily="'JetBrains Mono', monospace" letterSpacing="0.1em">
            ROULETTE
          </text>
        </g>
      </svg>
    </div>
  );
}

function ProgressTracker({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0 w-full px-2">
      {CONTRACT_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] mono"
              style={{
                background: i <= currentStep ? 'var(--accent-dim)' : 'var(--bg-card)',
                border: `1px solid ${i <= currentStep ? 'var(--border-active)' : 'var(--border)'}`,
                color: i <= currentStep ? 'var(--accent)' : 'var(--text-muted)',
                animation: i === currentStep ? 'glow-pulse 2s infinite' : 'none',
              }}
            >
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            <span className="text-[9px] text-[var(--text-muted)] whitespace-nowrap">{step}</span>
          </div>
          {i < CONTRACT_STEPS.length - 1 && (
            <div
              className="flex-1 h-px mx-1 mt-[-14px]"
              style={{ background: i < currentStep ? 'var(--accent)' : 'var(--border)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RouletteWorkspace({ agent, activity, onRunAgent, runStatus, missions }: Props) {
  const [phase, setPhase] = useState<RoulettePhase>('config');
  const [query, setQuery] = useState('landing page designer');
  const [category, setCategory] = useState('web-design');
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(4.0);
  const [candidates, setCandidates] = useState<FiverrCandidate[]>([]);
  const [badIndex, setBadIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus>('pending');
  const [contactUrl, setContactUrl] = useState<string | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [contractStep, setContractStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const agentActivity = activity.filter(a => a.agentId === agent.id).slice(0, 5);
  const isRunning = phase === 'scraping' || isSpinning;

  const handleScrape = useCallback(async () => {
    setPhase('scraping');
    setError(null);
    setScrapeProgress(0);

    const progressInterval = setInterval(() => {
      setScrapeProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      const res = await fetch('/api/agents/roulette/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category, minRating, maxPrice }),
      });

      if (!res.ok) throw new Error(`Scrape failed: ${res.status}`);
      const data = await res.json();

      clearInterval(progressInterval);
      setScrapeProgress(100);

      setTimeout(() => {
        setCandidates(data.candidates);
        setBadIndex(data.badIndex);
        setPhase('candidates');
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Scrape failed');
      setPhase('config');
    }
  }, [query, category, minRating, maxPrice]);

  const handleSpin = useCallback(() => {
    if (candidates.length !== 6 || isSpinning) return;

    setIsSpinning(true);
    setPhase('spinning');

    // Pick a random winner
    const winnerIndex = Math.floor(Math.random() * 6);
    const segAngle = 360 / 6;
    // Calculate rotation: multiple full spins + offset to land on the winner
    // The pointer is at top (0 degrees). We need the winner segment's center under the pointer.
    // Segment i center is at i * 60 + 30 degrees. We rotate clockwise, so we need to go to (360 - (winnerIndex * 60 + 30)).
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const targetOffset = 360 - (winnerIndex * segAngle + segAngle / 2);
    const totalRotation = spinRotation + fullSpins + targetOffset;

    setSpinRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedIndex(winnerIndex);

      // Auto-transition to outreach after a brief reveal pause
      setTimeout(() => {
        setPhase('outreach');
        handleOutreach(candidates[winnerIndex]);
      }, 1500);
    }, 4200);
  }, [candidates, isSpinning, spinRotation]);

  const handleOutreach = useCallback(async (candidate: FiverrCandidate) => {
    try {
      const res = await fetch('/api/agents/roulette/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate }),
      });

      if (!res.ok) throw new Error('Outreach failed');
      const data = await res.json();

      setOutreachMessage(data.message);
      setContactUrl(data.contactUrl);
      setOutreachStatus('sent');
    } catch {
      setOutreachStatus('pending');
    }
  }, []);

  const handleReplace = useCallback(() => {
    if (selectedIndex === null || candidates.length === 0) return;
    // Remove the selected candidate, re-spin with remaining
    const remaining = candidates.filter((_, i) => i !== selectedIndex);
    if (remaining.length === 0) {
      setPhase('config');
      return;
    }
    // Pad back to original format — just re-spin from candidates view
    setCandidates(remaining);
    setSelectedIndex(null);
    setOutreachStatus('pending');
    setContactUrl(null);
    setOutreachMessage(null);
    setPhase('candidates');
  }, [selectedIndex, candidates]);

  const handleReset = useCallback(() => {
    setPhase('config');
    setCandidates([]);
    setBadIndex(-1);
    setSelectedIndex(null);
    setOutreachStatus('pending');
    setContactUrl(null);
    setOutreachMessage(null);
    setSpinRotation(0);
    setScrapeProgress(0);
    setContractStep(0);
    setError(null);
  }, []);

  const selected = selectedIndex !== null ? candidates[selectedIndex] : null;

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)] border-x border-[var(--border)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: isRunning ? 'rgba(245, 158, 11, 0.15)' : 'var(--accent-dim)',
              border: `1px solid ${isRunning ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-active)'}`,
              animation: isRunning ? 'glow-pulse 1s infinite' : 'glow-pulse 3s infinite',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke={isRunning ? '#f59e0b' : '#00ff88'} strokeWidth="1.2" fill="none" />
              <circle cx="9" cy="9" r="4" stroke={isRunning ? '#f59e0b' : '#00ff88'} strokeWidth="0.8" fill="none" />
              <circle cx="9" cy="9" r="1.5" fill={isRunning ? '#f59e0b' : '#00ff88'} />
              <line x1="9" y1="2" x2="9" y2="4" stroke={isRunning ? '#f59e0b' : '#00ff88'} strokeWidth="1.2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] text-[var(--text-primary)]">{agent.name}</h2>
              <span
                className="text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{
                  color: isRunning ? '#f59e0b' : '#00ff88',
                  background: isRunning ? 'rgba(245, 158, 11, 0.15)' : 'var(--accent-dim)',
                }}
              >
                {isRunning ? (isSpinning ? 'Spinning' : 'Scanning') : phase === 'outreach' ? 'Outreach' : phase === 'contract' ? 'Active' : 'Ready'}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Phase: Config */}
      {phase === 'config' && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Search Parameters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Search Query</label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] mono outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="e.g. landing page designer"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[12px] mono outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Max Budget ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-[12px] mono outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Min Rating</label>
                <input
                  type="number"
                  value={minRating}
                  onChange={e => setMinRating(Number(e.target.value))}
                  step={0.1}
                  min={1}
                  max={5}
                  className="w-full px-3 py-2 rounded-lg text-[12px] mono outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--error-dim)', color: 'var(--error)', border: '1px solid rgba(255,68,102,0.2)' }}>
              {error}
            </div>
          )}
          <button
            onClick={handleScrape}
            className="w-full mt-4 px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider transition-all"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}
          >
            Search Fiverr
          </button>
        </div>
      )}

      {/* Phase: Scraping */}
      {phase === 'scraping' && (
        <div className="px-5 py-8 border-b border-[var(--border)]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[var(--text-secondary)]">Scanning Fiverr for candidates</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[var(--accent)]"
                    style={{ animation: `typing-dot 1.4s infinite ${i * 0.2}s` }}
                  />
                ))}
              </span>
            </div>
            <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${scrapeProgress}%`, background: 'var(--accent)' }}
              />
            </div>
            <span className="text-[10px] mono text-[var(--text-muted)]">{Math.round(scrapeProgress)}% — Filtering {query}...</span>
          </div>
        </div>
      )}

      {/* Phase: Candidates + Spinning */}
      {(phase === 'candidates' || phase === 'spinning') && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">Candidates Found</h3>
            <span className="text-[10px] mono text-[var(--text-muted)]">{candidates.length} scraped</span>
          </div>

          {/* Candidate Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {candidates.map((c, i) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                isSelected={selectedIndex === i && !isSpinning}
                isRevealed={true}
              />
            ))}
          </div>

          {/* Wheel */}
          {phase === 'spinning' && (
            <div className="flex justify-center py-4">
              <RouletteWheel
                candidates={candidates}
                isSpinning={isSpinning}
                rotation={spinRotation}
                selectedIndex={selectedIndex}
              />
            </div>
          )}

          {/* Spin Button */}
          {phase === 'candidates' && (
            <button
              onClick={handleSpin}
              className="w-full mt-2 px-4 py-3 rounded-lg text-[13px] uppercase tracking-widest transition-all font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.3)',
                boxShadow: '0 0 20px rgba(245,158,11,0.1)',
              }}
            >
              Spin the Wheel
            </button>
          )}
        </div>
      )}

      {/* Phase: Outreach */}
      {phase === 'outreach' && selected && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Selected Candidate</h3>

          {/* Winner card */}
          <div className="mb-4">
            <CandidateCard candidate={selected} isSelected={true} isRevealed={true} />
          </div>

          {/* Outreach message */}
          <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2">Outreach Message</h3>
          <div
            className="rounded-lg px-4 py-3 text-[11px] mono leading-relaxed whitespace-pre-wrap mb-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {outreachMessage || 'Generating message...'}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            {contactUrl && (
              <a
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider text-center transition-all"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}
              >
                Send via Fiverr
              </a>
            )}
            <button
              onClick={handleReplace}
              className="px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider transition-all"
              style={{ background: 'var(--error-dim)', color: 'var(--error)', border: '1px solid rgba(255,68,102,0.2)' }}
            >
              Replace
            </button>
          </div>

          {/* Status */}
          <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2">Status</h3>
          <div className="flex gap-2 mb-3">
            {(['accepted', 'declined'] as OutreachStatus[]).map(status => (
              <button
                key={status}
                onClick={() => {
                  setOutreachStatus(status);
                  if (status === 'accepted') {
                    setPhase('contract');
                    setContractStep(1);
                  }
                }}
                disabled={outreachStatus === status}
                className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all disabled:opacity-40"
                style={{
                  background: status === 'accepted' ? 'var(--accent-dim)' : 'var(--error-dim)',
                  color: status === 'accepted' ? 'var(--accent)' : 'var(--error)',
                  border: `1px solid ${status === 'accepted' ? 'var(--border-active)' : 'rgba(255,68,102,0.2)'}`,
                }}
              >
                Mark as {status}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: outreachStatus === 'sent' ? '#f59e0b' : outreachStatus === 'accepted' ? 'var(--accent)' : 'var(--text-muted)' }} />
            {outreachStatus === 'pending' && 'Preparing outreach...'}
            {outreachStatus === 'sent' && 'Message ready — send via Fiverr inbox'}
            {outreachStatus === 'accepted' && 'Candidate accepted!'}
            {outreachStatus === 'declined' && 'Candidate declined — use Replace to pick another'}
          </div>
        </div>
      )}

      {/* Phase: Contract */}
      {phase === 'contract' && selected && (
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Active Contract</h3>

          {/* Hired freelancer card */}
          <div className="mb-4">
            <CandidateCard candidate={selected} isSelected={true} isRevealed={true} />
          </div>

          {/* Progress tracker */}
          <div className="mb-4 py-3">
            <ProgressTracker currentStep={contractStep} />
          </div>

          {/* Advance / Replace buttons */}
          <div className="flex gap-2 mb-3">
            {contractStep < CONTRACT_STEPS.length - 1 && (
              <button
                onClick={() => setContractStep(s => s + 1)}
                className="flex-1 px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider transition-all"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}
              >
                Advance to {CONTRACT_STEPS[contractStep + 1]}
              </button>
            )}
            <button
              onClick={handleReplace}
              className="px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider transition-all"
              style={{ background: 'var(--error-dim)', color: 'var(--error)', border: '1px solid rgba(255,68,102,0.2)' }}
            >
              Replace Freelancer
            </button>
          </div>

          {contractStep === CONTRACT_STEPS.length - 1 && (
            <div className="px-3 py-2 rounded-lg text-[11px] text-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--border-active)' }}>
              Deliverables received! Contract complete.
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full mt-3 px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider transition-all"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Start New Search
          </button>
        </div>
      )}

      {/* Activity Log */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] mb-3">Recent Activity</h3>
        {agentActivity.length === 0 ? (
          <div className="text-[12px] text-[var(--text-muted)] py-3 text-center">No recent activity</div>
        ) : (
          <div className="space-y-0">
            {agentActivity.map((entry, i) => (
              <div
                key={entry.id}
                className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0"
                style={{ animation: `slide-in 0.3s ease ${i * 0.05}s both` }}
              >
                <span className="text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums mono pt-px">{entry.timestamp}</span>
                <span className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{entry.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useVersion } from '@/lib/version-context';
import { VERSION_REGISTRY } from '@/lib/versions';

export default function VersionSelector() {
  const { currentVersion, setCurrentVersion } = useVersion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = VERSION_REGISTRY.find((v) => v.version === currentVersion);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        <span className="mono">v{currentVersion}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: 0.5 }}>
          <path d="M2 3L4 5L6 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 z-50 rounded-lg overflow-hidden"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            minWidth: '160px',
          }}
        >
          {VERSION_REGISTRY.map((v) => (
            <button
              key={v.version}
              onClick={() => { setCurrentVersion(v.version); setOpen(false); }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 transition-all"
              style={{
                background: v.version === currentVersion ? 'var(--accent-dim)' : 'transparent',
                color: v.version === currentVersion ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span className="mono text-[10px] uppercase tracking-wider">{v.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{v.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

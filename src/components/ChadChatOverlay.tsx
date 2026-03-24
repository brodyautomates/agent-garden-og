'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, ChatMessage } from '@/lib/types';
import { ChadFace } from './ChadWidget';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export default function ChadChatOverlay({ isOpen, onClose, agent }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system-1',
      role: 'chad',
      content: 'I\'m online. What do you need?',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      const chadMsg: ChatMessage = {
        id: `chad-${Date.now()}`,
        role: 'chad',
        content: data.content,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };

      setMessages(prev => [...prev, chadMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'chad',
        content: 'Connection interrupted. Try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ animation: 'overlay-in 200ms ease-out' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* Chat container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
        <div
          className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
          style={{
            background: 'rgba(16, 16, 24, 0.9)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 51, 51, 0.12)',
            boxShadow: '0 0 60px rgba(255, 51, 51, 0.06), 0 24px 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 flex items-center gap-4 border-b border-[var(--border)]">
            <ChadFace size={50} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] text-[var(--text-primary)] tracking-wide uppercase">CHAD</span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--chad-red)',
                    animation: 'pulse-dot 2s infinite',
                    boxShadow: '0 0 6px rgba(255,51,51,0.5)',
                  }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">Master Orchestrator</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-xl ${
                    msg.role === 'user' ? '' : 'mono'
                  }`}
                  style={{
                    background: msg.role === 'user'
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(255, 51, 51, 0.06)',
                    border: `1px solid ${
                      msg.role === 'user'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(255, 51, 51, 0.1)'
                    }`,
                  }}
                >
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[9px] text-[var(--text-muted)] mt-1.5 block mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-xl flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255, 51, 51, 0.06)',
                    border: '1px solid rgba(255, 51, 51, 0.1)',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--chad-red)',
                        animation: `typing-dot 1.2s infinite ${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-5 py-4 border-t border-[var(--border)]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Talk to Chad..."
                className="flex-1 px-4 py-2.5 rounded-lg text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isThinking}
                className="px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wider transition-all disabled:opacity-30"
                style={{
                  background: 'var(--chad-red-dim)',
                  color: 'var(--chad-red)',
                  border: '1px solid rgba(255, 51, 51, 0.2)',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

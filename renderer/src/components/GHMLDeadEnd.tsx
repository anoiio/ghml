import React, { useState } from 'react';
import { executeGHMLLink, ChainEntry, Provider } from '../executor/llm-executor';
import { SessionCounters } from './GHMLLink';
import { POLICIES } from '../policies';
import { Theme } from '../types';

interface GHMLDeadEndProps {
  theme: Theme;
  provider: Provider;
  apiKey: string;
  policyId: string;
  getCounters: () => SessionCounters;
  onCountersUpdate: (counters: SessionCounters) => void;
  chainHistory: ChainEntry[];
  onNavigate?: (content: string, newChain: ChainEntry[], pushHistory?: boolean) => void;
}

export default function GHMLDeadEnd({
  theme,
  provider,
  apiKey,
  policyId,
  getCounters,
  onCountersUpdate,
  chainHistory,
  onNavigate,
}: GHMLDeadEndProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCyberpunk = theme === 'cyberpunk';
  const canSubmit = !loading && text.trim().length > 0 && (provider === 'local-cli' || !!apiKey);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const policy = POLICIES[policyId] ?? POLICIES.none;
    const counters = getCounters();
    if (counters.requests >= policy.cost_caps.max_requests_per_session) {
      setError(`Policy "${policyId}": request limit reached`);
      return;
    }
    if (counters.tokens >= policy.cost_caps.max_total_tokens_per_session) {
      setError(`Policy "${policyId}": token budget exhausted`);
      return;
    }

    setLoading(true);
    setError('');
    const prompt = text.trim();

    await executeGHMLLink({
      link: {
        type: 'nav',
        prompt,
        attrs: { context: 'chain' },
        raw: `ghml:nav "${prompt}" context=chain`,
      },
      provider,
      apiKey,
      maxTokens: policy.cost_caps.max_tokens_per_request,
      chainHistory,
      onToken: () => {},
      onDone: (responseText, tokenCount) => {
        setLoading(false);
        onCountersUpdate({
          requests: getCounters().requests + 1,
          tokens: getCounters().tokens + tokenCount,
        });
        const newChain: ChainEntry[] = [
          ...chainHistory,
          { prompt, response: responseText },
        ];
        onNavigate?.(responseText, newChain, true);
      },
      onError: (err) => { setError(err.message); setLoading(false); },
    });
  };

  return (
    <div className={[
      'mt-8 pt-5 border-t border-dashed',
      isCyberpunk ? 'border-cyan-400/20' : 'border-gray-200',
    ].join(' ')}>
      <p className={`text-xs mb-2 ${isCyberpunk ? 'text-cyan-700' : 'text-gray-400'}`}>
        No links on this page — type a follow-up to continue
      </p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(); }}
          placeholder="Ask a follow-up question…"
          disabled={loading}
          className={[
            'flex-1 px-3 py-1.5 text-sm rounded-lg border outline-none transition-colors',
            isCyberpunk
              ? 'bg-slate-900 border-cyan-400/30 text-cyan-100 placeholder-cyan-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20',
          ].join(' ')}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={[
            'px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5',
            isCyberpunk
              ? 'bg-cyan-950/30 border-cyan-400/30 text-cyan-300 hover:bg-cyan-950/60 disabled:opacity-30'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40',
          ].join(' ')}
        >
          {loading
            ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : 'Continue →'}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
      )}
    </div>
  );
}

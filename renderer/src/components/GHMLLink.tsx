import React, { useState, useCallback } from 'react';
import { parseGHMLUri, interpolatePrompt } from '../parser/ghml-parser';
import { executeGHMLLink, ChainEntry, Provider } from '../executor/llm-executor';
import { Theme } from '../types';
import { POLICIES } from '../policies';
import GHMLViewer from './GHMLViewer';

export interface SessionCounters {
  requests: number;
  tokens: number;
}

interface GHMLLinkProps {
  href: string;
  children: React.ReactNode;
  theme: Theme;
  provider: Provider;
  apiKey: string;
  policyId: string;
  getCounters: () => SessionCounters;
  onCountersUpdate: (counters: SessionCounters) => void;
  pageContent: string;
  chainHistory: ChainEntry[];
  userVariables: Record<string, unknown>;
  onNavigate?: (content: string, newChain: ChainEntry[]) => void;
  depth: number;
}

const TYPE_COLORS_CLEAN: Record<string, string> = {
  render: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  nav:    'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  action: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  embed:  'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
};

const TYPE_COLORS_CYBERPUNK: Record<string, string> = {
  render: 'border-cyan-400/50 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/50',
  nav:    'border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-950/20 hover:bg-fuchsia-950/50',
  action: 'border-green-400/50 text-green-300 bg-green-950/20 hover:bg-green-950/50',
  embed:  'border-yellow-400/50 text-yellow-300 bg-yellow-950/20 hover:bg-yellow-950/50',
};

export default function GHMLLink({
  href,
  children,
  theme,
  provider,
  apiKey,
  policyId,
  getCounters,
  onCountersUpdate,
  pageContent,
  chainHistory,
  userVariables,
  onNavigate,
  depth,
}: GHMLLinkProps) {
  const [loading, setLoading] = useState(false);
  const [inlineContent, setInlineContent] = useState('');
  const [error, setError] = useState('');

  const link = parseGHMLUri(href);
  const isReady = !loading && (provider === 'local-cli' || !!apiKey);
  const colors = theme === 'cyberpunk' ? TYPE_COLORS_CYBERPUNK : TYPE_COLORS_CLEAN;

  const handleClick = useCallback(async () => {
    if (!link || !isReady) return;

    // Resolve effective policy: link attribute overrides session policy
    const effectivePolicyId = link.attrs.policy ?? policyId;
    const policy = POLICIES[effectivePolicyId] ?? POLICIES.none;
    const counters = getCounters();

    // Enforce policy before dispatch
    if (counters.requests >= policy.cost_caps.max_requests_per_session) {
      setError(`Policy "${effectivePolicyId}": request limit reached (${policy.cost_caps.max_requests_per_session})`);
      return;
    }
    if (counters.tokens >= policy.cost_caps.max_total_tokens_per_session) {
      setError(`Policy "${effectivePolicyId}": token budget exhausted`);
      return;
    }
    const requestedModel = link.attrs.model;
    if (
      requestedModel &&
      policy.model_allowlist.length > 0 &&
      !policy.model_allowlist.includes(requestedModel)
    ) {
      setError(`Policy "${effectivePolicyId}": model "${requestedModel}" not in allowlist`);
      return;
    }

    setError('');
    setLoading(true);
    setInlineContent('');

    let resolvedPrompt = link.prompt;
    if (link.attrs.context?.includes('selection')) {
      const selection = window.getSelection()?.toString() ?? '';
      resolvedPrompt = interpolatePrompt(link.prompt, { ...userVariables, selection });
    } else {
      resolvedPrompt = interpolatePrompt(link.prompt, userVariables);
    }

    const resolvedLink = { ...link, prompt: resolvedPrompt };

    if (link.type === 'action') {
      await executeGHMLLink({
        link: resolvedLink,
        provider,
        apiKey,
        maxTokens: policy.cost_caps.max_tokens_per_request,
        pageContent,
        chainHistory,
        userVariables,
        onToken: (text) => setInlineContent(text),
        onDone: (_text, tokenCount) => {
          setLoading(false);
          onCountersUpdate({
            requests: getCounters().requests + 1,
            tokens: getCounters().tokens + tokenCount,
          });
        },
        onError: (err) => { setError(err.message); setLoading(false); },
      });
    } else {
      await executeGHMLLink({
        link: resolvedLink,
        provider,
        apiKey,
        maxTokens: policy.cost_caps.max_tokens_per_request,
        pageContent,
        chainHistory,
        userVariables,
        onToken: (_text) => {},
        onDone: (text, tokenCount) => {
          setLoading(false);
          onCountersUpdate({
            requests: getCounters().requests + 1,
            tokens: getCounters().tokens + tokenCount,
          });
          const newChain: ChainEntry[] = [
            ...chainHistory,
            { prompt: resolvedPrompt, response: text },
          ];
          onNavigate?.(text, newChain);
        },
        onError: (err) => { setError(err.message); setLoading(false); },
      });
    }
  }, [link, isReady, policyId, getCounters, onCountersUpdate, provider, apiKey, pageContent, chainHistory, userVariables, onNavigate]);

  if (!link) {
    return <a href={href} className="text-blue-600 hover:underline">{children}</a>;
  }

  const colorClass = colors[link.type] ?? colors.render;

  return (
    <span className="inline-block my-0.5">
      <button
        onClick={handleClick}
        disabled={!isReady}
        title={`[${link.type}] ${link.prompt.slice(0, 80)}${link.prompt.length > 80 ? '…' : ''}`}
        className={[
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border',
          'text-sm font-medium transition-colors cursor-pointer',
          colorClass,
          loading ? 'opacity-60 cursor-wait' : '',
          !isReady && !loading ? 'opacity-30 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {loading && (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        <span className="text-xs opacity-50 font-mono shrink-0">[{link.type}]</span>
        {children}
      </button>

      {error && (
        <span className="ghml-link-error ml-2 text-xs text-red-600 font-mono">{error}</span>
      )}

      {inlineContent && (
        <div className="mt-2">
          <GHMLViewer
            content={inlineContent}
            theme={theme}
            provider={provider}
            apiKey={apiKey}
            policyId={policyId}
            sessionCounters={getCounters()}
            onCountersUpdate={onCountersUpdate}
            chainHistory={chainHistory}
            userVariables={userVariables}
            onNavigate={onNavigate}
            depth={depth + 1}
          />
        </div>
      )}
    </span>
  );
}

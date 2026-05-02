import React, { useState, useCallback } from 'react';
import { parseGHMLUri, interpolatePrompt } from '../parser/ghml-parser';
import { executeGHMLLink, ChainEntry } from '../executor/llm-executor';
import GHMLViewer from './GHMLViewer';

interface GHMLLinkProps {
  href: string;
  children: React.ReactNode;
  apiKey: string;
  pageContent: string;
  chainHistory: ChainEntry[];
  userVariables: Record<string, unknown>;
  onNavigate?: (content: string, newChain: ChainEntry[]) => void;
  depth: number;
}

const TYPE_COLORS: Record<string, string> = {
  render: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  nav:    'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  action: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  embed:  'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
};

export default function GHMLLink({
  href,
  children,
  apiKey,
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

  const handleClick = useCallback(async () => {
    if (!link || !apiKey || loading) return;

    setError('');
    setLoading(true);
    setInlineContent('');

    // Resolve selection context
    let resolvedPrompt = link.prompt;
    if (link.attrs.context?.includes('selection')) {
      const selection = window.getSelection()?.toString() ?? '';
      resolvedPrompt = interpolatePrompt(link.prompt, {
        ...userVariables,
        selection,
      });
    } else {
      resolvedPrompt = interpolatePrompt(link.prompt, userVariables);
    }

    const resolvedLink = { ...link, prompt: resolvedPrompt };

    if (link.type === 'action') {
      // Stream inline at link position
      await executeGHMLLink({
        link: resolvedLink,
        apiKey,
        pageContent,
        chainHistory,
        userVariables,
        onToken: (text) => setInlineContent(text),
        onDone: () => setLoading(false),
        onError: (err) => { setError(err.message); setLoading(false); },
      });
    } else {
      // render / nav / embed — generate new page content
      let final = '';
      await executeGHMLLink({
        link: resolvedLink,
        apiKey,
        pageContent,
        chainHistory,
        userVariables,
        onToken: (text) => { final = text; },
        onDone: (text) => {
          setLoading(false);
          const newChain: ChainEntry[] = [
            ...chainHistory,
            { prompt: resolvedPrompt, response: text },
          ];
          onNavigate?.(text, newChain);
        },
        onError: (err) => { setError(err.message); setLoading(false); },
      });
      void final; // captured in onDone closure
    }
  }, [link, apiKey, loading, pageContent, chainHistory, userVariables, onNavigate]);

  if (!link) {
    return <a href={href} className="text-blue-600 hover:underline">{children}</a>;
  }

  const colorClass = TYPE_COLORS[link.type] ?? TYPE_COLORS.render;

  return (
    <span className="inline-block my-0.5">
      <button
        onClick={handleClick}
        disabled={loading || !apiKey}
        title={`[${link.type}] ${link.prompt.slice(0, 80)}${link.prompt.length > 80 ? '…' : ''}`}
        className={[
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border',
          'text-sm font-medium transition-colors cursor-pointer',
          colorClass,
          loading ? 'opacity-60 cursor-wait' : '',
          !apiKey ? 'opacity-40 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {loading && (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        <span className="text-xs opacity-50 font-mono shrink-0">[{link.type}]</span>
        {children}
      </button>

      {error && (
        <span className="ml-2 text-xs text-red-600 font-mono">{error}</span>
      )}

      {inlineContent && (
        <div className="mt-2">
          <GHMLViewer
            content={inlineContent}
            apiKey={apiKey}
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

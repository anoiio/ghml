import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GHMLLink from './GHMLLink';
import { ChainEntry, Provider } from '../executor/llm-executor';
import { Theme } from '../types';

interface GHMLViewerProps {
  content: string;
  theme: Theme;
  provider: Provider;
  apiKey: string;
  chainHistory?: ChainEntry[];
  userVariables?: Record<string, unknown>;
  onNavigate?: (content: string, newChain: ChainEntry[]) => void;
  depth?: number;
}

const PLACEHOLDER_PREFIX = 'http://ghml-link.local/';

const GHML_RE =
  /\[([^\]]+)\]\((ghml:(?:render|nav|action|embed)\s+"(?:[^"\\]|\\.)*"[^)]*)\)/g;

function preprocessContent(raw: string): {
  processed: string;
  uriMap: Map<string, string>;
} {
  const uriMap = new Map<string, string>();
  let idx = 0;
  const processed = raw.replace(GHML_RE, (_match, text, uri) => {
    const placeholder = `${PLACEHOLDER_PREFIX}${idx}`;
    uriMap.set(placeholder, uri);
    idx++;
    return `[${text}](${placeholder})`;
  });
  return { processed, uriMap };
}

export default function GHMLViewer({
  content,
  theme,
  provider,
  apiKey,
  chainHistory = [],
  userVariables = {},
  onNavigate,
  depth = 0,
}: GHMLViewerProps) {
  if (!content) return null;

  const { processed, uriMap } = useMemo(() => preprocessContent(content), [content]);

  return (
    <div className={`ghml-content${depth > 0 ? ' ghml-nested' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const resolvedHref =
              href?.startsWith(PLACEHOLDER_PREFIX) ? uriMap.get(href) ?? href : href;

            if (resolvedHref?.startsWith('ghml:')) {
              return (
                <GHMLLink
                  href={resolvedHref}
                  theme={theme}
                  provider={provider}
                  apiKey={apiKey}
                  pageContent={content}
                  chainHistory={chainHistory}
                  userVariables={userVariables}
                  onNavigate={onNavigate}
                  depth={depth}
                >
                  {children}
                </GHMLLink>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {children}
              </a>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

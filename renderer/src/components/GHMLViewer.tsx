import React, { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GHMLLink, { SessionCounters } from './GHMLLink';
import GHMLInput from './GHMLInput';
import { parseGHMLUri } from '../parser/ghml-parser';
import { ChainEntry, Provider } from '../executor/llm-executor';
import { Theme } from '../types';

interface GHMLViewerProps {
  content: string;
  theme: Theme;
  provider: Provider;
  apiKey: string;
  policyId: string;
  sessionCounters: SessionCounters;
  onCountersUpdate: (counters: SessionCounters) => void;
  chainHistory?: ChainEntry[];
  userVariables?: Record<string, unknown>;
  onNavigate?: (content: string, newChain: ChainEntry[], pushHistory?: boolean) => void;
  depth?: number;
}

const PLACEHOLDER_PREFIX = 'http://ghml-link.local/';

// Matches ](ghml:...) — works for text links, image links, and input fields
const GHML_RE =
  /\]\((ghml:(?:render|nav|action|embed|input)\s+"(?:[^"\\]|\\.)*"[^)]*)\)/g;

function preprocessContent(raw: string): {
  processed: string;
  uriMap: Map<string, string>;
} {
  const uriMap = new Map<string, string>();
  let idx = 0;
  const processed = raw.replace(GHML_RE, (_match, uri) => {
    const placeholder = `${PLACEHOLDER_PREFIX}${idx}`;
    uriMap.set(placeholder, uri);
    idx++;
    return `](${placeholder})`;
  });
  return { processed, uriMap };
}

export default function GHMLViewer({
  content,
  theme,
  provider,
  apiKey,
  policyId,
  sessionCounters,
  onCountersUpdate,
  chainHistory = [],
  userVariables = {},
  onNavigate,
  depth = 0,
}: GHMLViewerProps) {
  const { processed, uriMap } = useMemo(() => preprocessContent(content ?? ''), [content]);

  // Store sessionCounters in a ref so the memoized `components` object can read
  // the latest value without being recreated on every counter update.
  // If `components` were recreated, ReactMarkdown would unmount+remount GHMLLink
  // and destroy its local `inlineContent` state (causing the flash-and-disappear bug).
  const countersRef = useRef(sessionCounters);
  countersRef.current = sessionCounters;

  // Input field values — written by GHMLInput on change, read lazily by GHMLLink at click time.
  const inputValuesRef = useRef<Record<string, string>>({});

  const components = useMemo(() => ({
    a({ href, children }: { href?: string; children?: React.ReactNode }) {
      const resolvedHref =
        href?.startsWith(PLACEHOLDER_PREFIX) ? uriMap.get(href) ?? href : href;

      if (resolvedHref?.startsWith('ghml:')) {
        const parsedLink = parseGHMLUri(resolvedHref);

        if (parsedLink?.type === 'input') {
          return (
            <GHMLInput
              link={parsedLink}
              theme={theme}
              onInputChange={(varName, value) => { inputValuesRef.current[varName] = value; }}
            >
              {children}
            </GHMLInput>
          );
        }

        const isImageLink = React.Children.toArray(children).some(
          (child) => React.isValidElement(child) && child.type === 'img',
        );
        return (
          <GHMLLink
            href={resolvedHref}
            theme={theme}
            provider={provider}
            apiKey={apiKey}
            policyId={policyId}
            getCounters={() => countersRef.current}
            onCountersUpdate={onCountersUpdate}
            pageContent={content}
            chainHistory={chainHistory}
            getUserVariables={() => ({ ...userVariables, ...inputValuesRef.current })}
            onNavigate={onNavigate}
            depth={depth}
            isImageLink={isImageLink}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [theme, provider, apiKey, policyId, content, chainHistory, userVariables, onNavigate, depth, onCountersUpdate]);
  // Note: sessionCounters intentionally excluded — accessed via countersRef to prevent remounts.

  if (!content) return null;

  return (
    <div className={`ghml-content${depth > 0 ? ' ghml-nested' : ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}

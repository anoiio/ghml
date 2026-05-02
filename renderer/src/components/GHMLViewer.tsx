import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import GHMLLink from './GHMLLink';
import { ChainEntry } from '../executor/llm-executor';

interface GHMLViewerProps {
  content: string;
  apiKey: string;
  chainHistory?: ChainEntry[];
  userVariables?: Record<string, unknown>;
  onNavigate?: (content: string, newChain: ChainEntry[]) => void;
  depth?: number;
}

export default function GHMLViewer({
  content,
  apiKey,
  chainHistory = [],
  userVariables = {},
  onNavigate,
  depth = 0,
}: GHMLViewerProps) {
  if (!content) return null;

  return (
    <div className={`ghml-content${depth > 0 ? ' ghml-nested' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith('ghml:')) {
              return (
                <GHMLLink
                  href={href}
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
        {content}
      </ReactMarkdown>
    </div>
  );
}

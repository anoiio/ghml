import React, { useState, useCallback, useEffect } from 'react';
import GHMLViewer from './components/GHMLViewer';
import Settings from './components/Settings';
import FileLoader from './components/FileLoader';
import { ChainEntry, Provider } from './executor/llm-executor';
import { Theme } from './types';
import { SessionCounters } from './components/GHMLLink';
import DEFAULT_CONTENT from '../../examples/living-spec.ghml?raw';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(DEFAULT_CONTENT);
  const [chainHistory, setChainHistory] = useState<ChainEntry[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('ghml-theme');
    return stored === 'cyberpunk' ? 'cyberpunk' : 'clean';
  });
  const [provider, setProvider] = useState<Provider>(
    () => (localStorage.getItem('ghml-provider') as Provider | null) ?? 'api',
  );
  const [policyId, setPolicyId] = useState<string>(
    () => localStorage.getItem('ghml-policy') ?? 'none',
  );
  const [sessionCounters, setSessionCounters] = useState<SessionCounters>({ requests: 0, tokens: 0 });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ghml-api-key') ?? '');
  const [userVariables, setUserVariables] = useState<Record<string, unknown>>(() => {
    try { return JSON.parse(localStorage.getItem('ghml-vars') ?? '{}'); }
    catch { return {}; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    window.history.replaceState({ content: DEFAULT_CONTENT, chainHistory: [] }, '');
    const onPopState = (e: PopStateEvent) => {
      if (e.state) {
        setCurrentDoc(e.state.content ?? DEFAULT_CONTENT);
        setChainHistory(e.state.chainHistory ?? []);
        setShowSource(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = useCallback((content: string, newChain: ChainEntry[], pushHistory = false) => {
    if (pushHistory) {
      window.history.pushState({ content, chainHistory: newChain }, '');
    }
    setCurrentDoc(content);
    setChainHistory(newChain);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSaveSettings = useCallback(
    (newTheme: Theme, newProvider: Provider, newPolicyId: string, key: string, vars: Record<string, unknown>) => {
      setTheme(newTheme);
      setProvider(newProvider);
      setPolicyId(newPolicyId);
      setApiKey(key);
      setUserVariables(vars);
      localStorage.setItem('ghml-theme', newTheme);
      localStorage.setItem('ghml-provider', newProvider);
      localStorage.setItem('ghml-policy', newPolicyId);
      localStorage.setItem('ghml-api-key', key);
      localStorage.setItem('ghml-vars', JSON.stringify(vars));
    },
    [],
  );

  const resetSession = useCallback(() => {
    setSessionCounters({ requests: 0, tokens: 0 });
  }, []);

  const handleHome = useCallback(() => {
    window.history.replaceState({ content: DEFAULT_CONTENT, chainHistory: [] }, '');
    setCurrentDoc(DEFAULT_CONTENT);
    setChainHistory([]);
    setShowSource(false);
    resetSession();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetSession]);

  const handleLoadFile = useCallback((content: string) => {
    window.history.replaceState({ content, chainHistory: [] }, '');
    setCurrentDoc(content);
    setChainHistory([]);
    setShowSource(false);
    resetSession();
  }, [resetSession]);

  const needsApiKey = provider === 'api' && !apiKey;

  return (
    <div className="min-h-screen bg-gray-50" data-theme={theme}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={handleHome}
          className="flex items-center gap-2 font-semibold hover:text-blue-600 ghml-logo-text text-gray-900"
        >
          <span className="font-bold font-mono text-xs bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-blue-600 ghml-logo-badge">
            ghml
          </span>
          <span className="text-sm">GHML Renderer</span>
        </button>

        <div className="flex-1" />

        {provider === 'local-cli' && (
          <span className="text-xs font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hidden sm:inline text-emerald-700 local-cli-badge">
            ⚡ Local CLI
          </span>
        )}

        {policyId !== 'none' && (
          <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded hidden sm:inline">
            policy: {policyId}
          </span>
        )}

        {sessionCounters.requests > 0 && (
          <span className="text-xs text-gray-400 font-mono hidden sm:inline hop-counter">
            {sessionCounters.requests} req · {sessionCounters.tokens.toLocaleString()} tok
          </span>
        )}

        {chainHistory.length > 0 && (
          <span className="text-xs text-gray-400 font-mono hidden sm:inline hop-counter">
            {chainHistory.length} hop{chainHistory.length !== 1 ? 's' : ''}
          </span>
        )}

        <button
          onClick={() => setShowSource((s) => !s)}
          className={[
            'px-3 py-1.5 text-xs rounded-lg border header-btn',
            showSource ? 'header-btn-active bg-gray-100 border-gray-300 text-gray-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600',
          ].join(' ')}
        >
          {showSource ? 'Rendered' : 'Source'}
        </button>

        <FileLoader onLoad={handleLoadFile} />

        <button
          onClick={() => setShowSettings(true)}
          className={[
            'px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 header-btn',
            needsApiKey ? 'header-settings-warn border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600',
          ].join(' ')}
        >
          {needsApiKey && <span className="text-xs">⚠</span>}
          Settings
        </button>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {showSource ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                GHML Source
              </h2>
            </div>
            <pre className="source-view bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-auto font-mono leading-relaxed whitespace-pre-wrap">
              {currentDoc}
            </pre>
          </div>
        ) : (
          <GHMLViewer
            content={currentDoc}
            theme={theme}
            provider={provider}
            apiKey={apiKey}
            policyId={policyId}
            sessionCounters={sessionCounters}
            onCountersUpdate={setSessionCounters}
            chainHistory={chainHistory}
            userVariables={userVariables}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {showSettings && (
        <Settings
          theme={theme}
          provider={provider}
          policyId={policyId}
          apiKey={apiKey}
          userVariables={userVariables}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

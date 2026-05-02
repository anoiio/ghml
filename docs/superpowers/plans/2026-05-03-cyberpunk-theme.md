# Cyberpunk Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-page Neo-Noir/Neon cyberpunk style that replaces the clean white/gray theme, toggled from the Settings modal and persisted in localStorage.

**Architecture:** A `Theme` type (`'clean' | 'cyberpunk'`) is stored in state and localStorage. When `'cyberpunk'`, a `data-theme="cyberpunk"` attribute is applied to the root `<div>`; `index.css` overrides every visual surface using `[data-theme="cyberpunk"]` selectors. `GHMLLink` receives a `theme` prop to switch Tailwind color classes for link badges (easier than overriding Tailwind with CSS).

**Tech Stack:** React 18, TypeScript 5, Tailwind CSS v3, Vite 5

---

### Task 1: Create `src/types.ts`

**Files:**
- Create: `renderer/src/types.ts`

- [ ] **Step 1: Create the file**

```typescript
// renderer/src/types.ts
export type Theme = 'clean' | 'cyberpunk';
```

- [ ] **Step 2: Type-check**

```bash
cd renderer && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add renderer/src/types.ts
git commit -m "feat: add Theme type"
```

---

### Task 2: Add cyberpunk CSS to `index.css`

**Files:**
- Modify: `renderer/src/index.css`

Append the entire block below to the end of `renderer/src/index.css`:

- [ ] **Step 1: Append cyberpunk CSS block**

```css
/* ── Cyberpunk Theme (Neo-Noir/Neon) ────────────────────────────────────── */

[data-theme="cyberpunk"] {
  background-color: #08080f;
  color: #b0cce0;
}

/* Page chrome */
[data-theme="cyberpunk"] header {
  background: #0d0d1a;
  border-color: rgba(0, 255, 255, 0.15);
}

[data-theme="cyberpunk"] header .ghml-logo-text {
  color: #b0cce0;
}

[data-theme="cyberpunk"] header .ghml-logo-badge {
  background: rgba(0, 255, 255, 0.08);
  border-color: rgba(0, 255, 255, 0.3);
  color: #00ffff;
}

[data-theme="cyberpunk"] header .header-btn {
  border-color: rgba(0, 255, 255, 0.15);
  color: #4a6070;
  background: transparent;
}
[data-theme="cyberpunk"] header .header-btn:hover {
  background: rgba(0, 255, 255, 0.06);
  color: #00ffff;
  border-color: rgba(0, 255, 255, 0.3);
}
[data-theme="cyberpunk"] header .header-btn-active {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.35);
  color: #00ffff;
}

[data-theme="cyberpunk"] header .header-settings-warn {
  border-color: rgba(255, 170, 0, 0.4);
  background: rgba(255, 170, 0, 0.06);
  color: #ffaa00;
}

[data-theme="cyberpunk"] header .local-cli-badge {
  background: rgba(0, 255, 255, 0.06);
  border-color: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

[data-theme="cyberpunk"] header .hop-counter {
  color: rgba(0, 255, 255, 0.35);
}

/* Source view */
[data-theme="cyberpunk"] .source-view {
  background: #010108 !important;
  border: 1px solid rgba(0, 255, 65, 0.15);
  color: #00ff41 !important;
}

/* Settings modal */
[data-theme="cyberpunk"] .settings-overlay {
  background: rgba(0, 0, 8, 0.75);
}
[data-theme="cyberpunk"] .settings-modal {
  background: #0d0d1a;
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: #b0cce0;
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.05);
}
[data-theme="cyberpunk"] .settings-modal h2 {
  color: #00ffff;
  font-family: ui-monospace, 'Courier New', monospace;
  letter-spacing: 0.05em;
}
[data-theme="cyberpunk"] .settings-modal label,
[data-theme="cyberpunk"] .settings-modal .settings-label {
  color: rgba(0, 255, 255, 0.6);
}
[data-theme="cyberpunk"] .settings-modal input[type="password"],
[data-theme="cyberpunk"] .settings-modal textarea {
  background: #06060f;
  border-color: rgba(0, 255, 255, 0.15);
  color: #b0cce0;
}
[data-theme="cyberpunk"] .settings-modal input[type="password"]:focus,
[data-theme="cyberpunk"] .settings-modal textarea:focus {
  border-color: rgba(0, 255, 255, 0.45);
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.08);
  outline: none;
}
[data-theme="cyberpunk"] .settings-modal input::placeholder,
[data-theme="cyberpunk"] .settings-modal textarea::placeholder {
  color: #1e2e3a;
}
[data-theme="cyberpunk"] .settings-modal .settings-note {
  color: rgba(0, 255, 255, 0.3);
}
[data-theme="cyberpunk"] .settings-modal .settings-save-btn {
  background: rgba(0, 255, 255, 0.12);
  border: 1px solid rgba(0, 255, 255, 0.35);
  color: #00ffff;
}
[data-theme="cyberpunk"] .settings-modal .settings-save-btn:hover {
  background: rgba(0, 255, 255, 0.22);
}
[data-theme="cyberpunk"] .settings-modal .settings-cancel-btn {
  color: #3a5060;
}
[data-theme="cyberpunk"] .settings-modal .settings-cancel-btn:hover {
  color: #7090a0;
  background: rgba(0, 255, 255, 0.04);
}

/* Markdown content */
[data-theme="cyberpunk"] .ghml-content {
  color: #90aabf;
}
[data-theme="cyberpunk"] .ghml-content h1,
[data-theme="cyberpunk"] .ghml-content h2,
[data-theme="cyberpunk"] .ghml-content h3 {
  color: #00ffff;
  font-family: ui-monospace, 'Courier New', Courier, monospace;
}
[data-theme="cyberpunk"] .ghml-content strong {
  color: #c8dce8;
}
[data-theme="cyberpunk"] .ghml-content a {
  color: #00ddff;
}
[data-theme="cyberpunk"] .ghml-content code {
  background: rgba(0, 255, 65, 0.07);
  color: #00ff41;
}
[data-theme="cyberpunk"] .ghml-content pre {
  background: #010108;
  border: 1px solid rgba(0, 255, 65, 0.15);
}
[data-theme="cyberpunk"] .ghml-content pre code {
  background: transparent;
  color: #00ff41;
}
[data-theme="cyberpunk"] .ghml-content table th {
  background: #0a1520;
  border-color: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}
[data-theme="cyberpunk"] .ghml-content table td {
  border-color: rgba(0, 255, 255, 0.08);
}
[data-theme="cyberpunk"] .ghml-content blockquote {
  border-color: rgba(0, 255, 255, 0.4);
  color: #4a6070;
}
[data-theme="cyberpunk"] .ghml-content hr {
  border-color: rgba(0, 255, 255, 0.08);
}
[data-theme="cyberpunk"] .ghml-nested {
  border-color: rgba(0, 255, 255, 0.12);
}

/* GHML link error text */
[data-theme="cyberpunk"] .ghml-link-error {
  color: #ff4488;
}
```

- [ ] **Step 2: Commit**

```bash
git add renderer/src/index.css
git commit -m "feat: add cyberpunk theme CSS"
```

---

### Task 3: Update `App.tsx` — theme state + semantic classes

**Files:**
- Modify: `renderer/src/App.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import React, { useState, useCallback } from 'react';
import GHMLViewer from './components/GHMLViewer';
import Settings from './components/Settings';
import FileLoader from './components/FileLoader';
import { ChainEntry, Provider } from './executor/llm-executor';
import { Theme } from './types';

const DEFAULT_CONTENT = `# Welcome to GHML

**Generative HyperText Markup Language** — a document format where hyperlinks carry LLM prompts instead of URLs. Click a link to generate its destination in real time.

---

## Try It

[What is GHML?](ghml:render "Generate a friendly, well-structured overview of Generative HyperText Markup Language. Explain what it is, why it's interesting, and include 2 ghml:action links at the end for quick follow-up questions.")

[List creative use cases](ghml:action "List 5 imaginative use cases for a document format where every hyperlink dispatches a prompt to an LLM and generates the destination. Be specific and concrete." inline)

[Explore the architecture](ghml:render "Explain the GHML runtime architecture: Parser → Context Builder → Prompt Router → Stream Renderer → History Engine. One section per layer, with a ghml:action link to 'show a code sketch' at the end of each section." context=page)

---

## Link Types at a Glance

| Type | What it does |
|---|---|
| \`render\` | Generates a full new document; replaces this view |
| \`nav\` | Like render, but browser history works |
| \`action\` | Streams result inline here; no navigation |
| \`embed\` | Renders an inline widget |

---

## Recursive Demo

[Start a story](ghml:nav "Begin a short interactive story (2 paragraphs). End with exactly 2 ghml:nav links representing different story choices. Each choice should use context=chain so the story continues coherently." context=chain)

---

*Choose a provider in Settings (top right), then click any link above.*
`;

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(DEFAULT_CONTENT);
  const [chainHistory, setChainHistory] = useState<ChainEntry[]>([]);
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('ghml-theme') as Theme | null) ?? 'clean',
  );
  const [provider, setProvider] = useState<Provider>(
    () => (localStorage.getItem('ghml-provider') as Provider | null) ?? 'api',
  );
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ghml-api-key') ?? '');
  const [userVariables, setUserVariables] = useState<Record<string, unknown>>(() => {
    try { return JSON.parse(localStorage.getItem('ghml-vars') ?? '{}'); }
    catch { return {}; }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const handleNavigate = useCallback((content: string, newChain: ChainEntry[]) => {
    setCurrentDoc(content);
    setChainHistory(newChain);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSaveSettings = useCallback(
    (newTheme: Theme, newProvider: Provider, key: string, vars: Record<string, unknown>) => {
      setTheme(newTheme);
      setProvider(newProvider);
      setApiKey(key);
      setUserVariables(vars);
      localStorage.setItem('ghml-theme', newTheme);
      localStorage.setItem('ghml-provider', newProvider);
      localStorage.setItem('ghml-api-key', key);
      localStorage.setItem('ghml-vars', JSON.stringify(vars));
    },
    [],
  );

  const handleHome = useCallback(() => {
    setCurrentDoc(DEFAULT_CONTENT);
    setChainHistory([]);
    setShowSource(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoadFile = useCallback((content: string) => {
    setCurrentDoc(content);
    setChainHistory([]);
    setShowSource(false);
  }, []);

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

        {chainHistory.length > 0 && (
          <span className="text-xs text-gray-400 font-mono hidden sm:inline hop-counter">
            {chainHistory.length} hop{chainHistory.length !== 1 ? 's' : ''} deep
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
          apiKey={apiKey}
          userVariables={userVariables}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `renderer/src/components/FileLoader.tsx` to accept a `className` prop**

```tsx
import React, { useRef } from 'react';

interface FileLoaderProps {
  onLoad: (content: string) => void;
  className?: string;
}

export default function FileLoader({ onLoad, className = '' }: FileLoaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') onLoad(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".ghml,.md,.txt"
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={`px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 header-btn ${className}`}
      >
        Load .ghml
      </button>
    </>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```
Expected: errors about Settings/GHMLViewer missing `theme` prop (will be fixed in next tasks).

- [ ] **Step 4: Commit**

```bash
git add renderer/src/App.tsx renderer/src/components/FileLoader.tsx
git commit -m "feat: add theme state and data-theme to App"
```

---

### Task 4: Update `Settings.tsx` — theme toggle + semantic classes

**Files:**
- Modify: `renderer/src/components/Settings.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import React, { useState } from 'react';
import { Provider } from '../executor/llm-executor';
import { Theme } from '../types';

interface SettingsProps {
  theme: Theme;
  provider: Provider;
  apiKey: string;
  userVariables: Record<string, unknown>;
  onSave: (theme: Theme, provider: Provider, apiKey: string, userVariables: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function Settings({ theme, provider, apiKey, userVariables, onSave, onClose }: SettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(provider);
  const [key, setKey] = useState(apiKey);
  const [varsText, setVarsText] = useState(
    Object.entries(userVariables).map(([k, v]) => `${k}=${v}`).join('\n'),
  );

  const handleSave = () => {
    const vars: Record<string, string> = {};
    for (const line of varsText.split('\n')) {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        if (k) vars[k] = v;
      }
    }
    onSave(selectedTheme, selectedProvider, key.trim(), vars);
    onClose();
  };

  return (
    <div
      className="settings-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="settings-modal bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Settings</h2>

        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="settings-label block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="clean"
                  checked={selectedTheme === 'clean'}
                  onChange={() => setSelectedTheme('clean')}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">Clean</span>
                  <p className="settings-note text-xs text-gray-500">Minimal white/gray — default</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="cyberpunk"
                  checked={selectedTheme === 'cyberpunk'}
                  onChange={() => setSelectedTheme('cyberpunk')}
                  className="mt-0.5 accent-cyan-400"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">Cyberpunk ⚡</span>
                  <p className="settings-note text-xs text-gray-500">Neo-noir dark with neon accents</p>
                </div>
              </label>
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="settings-label block text-sm font-medium text-gray-700 mb-2">LLM Provider</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="api"
                  checked={selectedProvider === 'api'}
                  onChange={() => setSelectedProvider('api')}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">Anthropic API</span>
                  <p className="settings-note text-xs text-gray-500">Requires an API key from console.anthropic.com</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="local-cli"
                  checked={selectedProvider === 'local-cli'}
                  onChange={() => setSelectedProvider('local-cli')}
                  className="mt-0.5 accent-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">Local Claude CLI ⚡</span>
                  <p className="settings-note text-xs text-gray-500">
                    Uses your Claude Code subscription — no API key needed.
                    Requires <code className="font-mono bg-gray-100 px-1 rounded">npm run dev</code>.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* API key — only for API provider */}
          {selectedProvider === 'api' && (
            <div>
              <label className="settings-label block text-sm font-medium text-gray-700 mb-1">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="settings-note mt-1 text-xs text-gray-500">
                Stored in localStorage only.
              </p>
            </div>
          )}

          {/* User variables */}
          <div>
            <label className="settings-label block text-sm font-medium text-gray-700 mb-1">
              User Variables{' '}
              <span className="font-normal text-gray-400 text-xs">— for {'{{variable}}'} interpolation</span>
            </label>
            <textarea
              value={varsText}
              onChange={(e) => setVarsText(e.target.value)}
              placeholder={'user.name=Alice\nuser.role=developer\nuser.plan=pro'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="settings-note mt-1 text-xs text-gray-500">One key=value per line</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="settings-cancel-btn px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="settings-save-btn px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: errors about GHMLViewer/GHMLLink missing `theme` prop (fixed in next task).

- [ ] **Step 3: Commit**

```bash
git add renderer/src/components/Settings.tsx
git commit -m "feat: add theme toggle to Settings modal"
```

---

### Task 5: Thread `theme` through `GHMLViewer` and `GHMLLink`

**Files:**
- Modify: `renderer/src/components/GHMLViewer.tsx`
- Modify: `renderer/src/components/GHMLLink.tsx`

- [ ] **Step 1: Replace `GHMLViewer.tsx`**

```tsx
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
```

- [ ] **Step 2: Replace `GHMLLink.tsx`**

```tsx
import React, { useState, useCallback } from 'react';
import { parseGHMLUri, interpolatePrompt } from '../parser/ghml-parser';
import { executeGHMLLink, ChainEntry, Provider } from '../executor/llm-executor';
import { Theme } from '../types';
import GHMLViewer from './GHMLViewer';

interface GHMLLinkProps {
  href: string;
  children: React.ReactNode;
  theme: Theme;
  provider: Provider;
  apiKey: string;
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
        pageContent,
        chainHistory,
        userVariables,
        onToken: (text) => setInlineContent(text),
        onDone: () => setLoading(false),
        onError: (err) => { setError(err.message); setLoading(false); },
      });
    } else {
      let final = '';
      await executeGHMLLink({
        link: resolvedLink,
        provider,
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
      void final;
    }
  }, [link, isReady, provider, apiKey, pageContent, chainHistory, userVariables, onNavigate]);

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
```

- [ ] **Step 3: Type-check — must pass clean**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add renderer/src/components/GHMLViewer.tsx renderer/src/components/GHMLLink.tsx
git commit -m "feat: thread theme prop through GHMLViewer and GHMLLink"
```

---

### Task 6: Verify + final commit

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visual check — Cyberpunk mode**

1. Open `http://localhost:5173` (or next port if busy)
2. Click **Settings** → Theme: **Cyberpunk ⚡** → Save
3. Verify:
   - Full page: dark navy background (`#08080f`)
   - Header: dark surface, faint cyan border
   - "GHML" logo badge: cyan
   - Headings: cyan, monospace font
   - Body text: muted blue-gray
   - `[render]` link badge: cyan border + text
   - `[nav]` link badge: fuchsia border + text
   - `[action]` link badge: green border + text
4. Click a link — response renders in dark theme with neon headings

- [ ] **Step 3: Visual check — Clean mode**

Settings → Theme: **Clean** → Save → page reverts to white/gray, all link badges back to original colors.

- [ ] **Step 4: Persistence check**

Refresh page → theme is preserved from localStorage.

- [ ] **Step 5: Final commit + push**

```bash
git add -A
git commit -m "feat: cyberpunk theme — full implementation"
git push
```

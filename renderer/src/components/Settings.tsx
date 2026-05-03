import React, { useState } from 'react';
import { Provider } from '../executor/llm-executor';
import { Theme } from '../types';
import { POLICIES, POLICY_IDS } from '../policies';

interface SettingsProps {
  theme: Theme;
  provider: Provider;
  policyId: string;
  apiKey: string;
  userVariables: Record<string, unknown>;
  onSave: (theme: Theme, provider: Provider, policyId: string, apiKey: string, userVariables: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function Settings({ theme, provider, policyId, apiKey, userVariables, onSave, onClose }: SettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(provider);
  const [selectedPolicyId, setSelectedPolicyId] = useState(policyId);
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
    onSave(selectedTheme, selectedProvider, selectedPolicyId, key.trim(), vars);
    onClose();
  };

  const selectedPolicy = POLICIES[selectedPolicyId] ?? POLICIES.none;

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
                <input type="radio" name="theme" value="clean" checked={selectedTheme === 'clean'}
                  onChange={() => setSelectedTheme('clean')} className="mt-0.5 accent-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Clean</span>
                  <p className="settings-note text-xs text-gray-500">Minimal white/gray — default</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="theme" value="cyberpunk" checked={selectedTheme === 'cyberpunk'}
                  onChange={() => setSelectedTheme('cyberpunk')} className="mt-0.5 accent-cyan-400" />
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
                <input type="radio" name="provider" value="api" checked={selectedProvider === 'api'}
                  onChange={() => setSelectedProvider('api')} className="mt-0.5 accent-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Anthropic API</span>
                  <p className="settings-note text-xs text-gray-500">Requires an API key from console.anthropic.com</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" name="provider" value="local-cli" checked={selectedProvider === 'local-cli'}
                  onChange={() => setSelectedProvider('local-cli')} className="mt-0.5 accent-blue-600" />
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

          {/* Policy */}
          <div>
            <label className="settings-label block text-sm font-medium text-gray-700 mb-1">
              Policy
            </label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POLICY_IDS.map((id) => (
                <option key={id} value={id}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                  {POLICIES[id].model_allowlist.length > 0
                    ? ` — ${POLICIES[id].model_allowlist.join(', ')}`
                    : ' — all models'}
                </option>
              ))}
            </select>
            {selectedPolicy.description && (
              <p className="settings-note mt-1 text-xs text-gray-500">{selectedPolicy.description}</p>
            )}
            {selectedPolicy.cost_caps.max_requests_per_session !== Infinity && (
              <p className="settings-note mt-0.5 text-xs text-gray-400">
                Max {selectedPolicy.cost_caps.max_requests_per_session} requests ·{' '}
                {selectedPolicy.cost_caps.max_tokens_per_request} tokens/request ·{' '}
                {selectedPolicy.cost_caps.max_total_tokens_per_session.toLocaleString()} total tokens
              </p>
            )}
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
              <p className="settings-note mt-1 text-xs text-gray-500">Stored in localStorage only.</p>
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
          <button onClick={onClose}
            className="settings-cancel-btn px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave}
            className="settings-save-btn px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

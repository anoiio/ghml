import React, { useState } from 'react';

interface SettingsProps {
  apiKey: string;
  userVariables: Record<string, unknown>;
  onSave: (apiKey: string, userVariables: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function Settings({ apiKey, userVariables, onSave, onClose }: SettingsProps) {
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
    onSave(key.trim(), vars);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Get your key at{' '}
              <span className="font-mono text-blue-600">console.anthropic.com</span>.
              Stored in localStorage only.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Variables{' '}
              <span className="font-normal text-gray-400 text-xs">
                — for {'{{variable}}'} interpolation
              </span>
            </label>
            <textarea
              value={varsText}
              onChange={(e) => setVarsText(e.target.value)}
              placeholder={'user.name=Alice\nuser.role=developer\nuser.plan=pro'}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">One key=value per line</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

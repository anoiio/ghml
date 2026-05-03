import React, { useState } from 'react';
import { GHMLLink } from '../parser/ghml-parser';
import { Theme } from '../types';

interface GHMLInputProps {
  link: GHMLLink;
  children: React.ReactNode;
  theme: Theme;
  onInputChange: (varName: string, value: string) => void;
}

export default function GHMLInput({ link, children, theme, onInputChange }: GHMLInputProps) {
  const [value, setValue] = useState('');
  const varName = link.prompt;
  const inputType = link.attrs.type ?? 'text';
  const placeholder = link.attrs.placeholder ?? '';
  const isCyberpunk = theme === 'cyberpunk';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onInputChange(varName, e.target.value);
  };

  return (
    <span className="inline-flex flex-col gap-0.5 my-1 mr-3 align-top">
      {children && (
        <label className={`text-xs font-medium ${isCyberpunk ? 'text-cyan-400/80' : 'text-gray-500'}`}>
          {children}
        </label>
      )}
      <input
        type={inputType}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className={[
          'px-2.5 py-1 text-sm rounded-md border outline-none transition-colors',
          isCyberpunk
            ? 'bg-slate-900 border-cyan-400/30 text-cyan-100 placeholder-cyan-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20',
        ].join(' ')}
      />
    </span>
  );
}

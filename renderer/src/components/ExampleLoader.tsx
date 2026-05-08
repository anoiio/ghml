import React from 'react';

const EXAMPLES = import.meta.glob('../../../examples/*.ghml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const ENTRIES = Object.entries(EXAMPLES)
  .map(([path, content]) => {
    const name = path.split('/').pop()!.replace(/\.ghml$/, '');
    return { name, content };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

interface ExampleLoaderProps {
  onLoad: (content: string) => void;
}

export default function ExampleLoader({ onLoad }: ExampleLoaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) return;
    const entry = ENTRIES.find((x) => x.name === value);
    if (entry) onLoad(entry.content);
    e.target.value = '';
  };

  if (ENTRIES.length === 0) return null;

  return (
    <select
      onChange={handleChange}
      defaultValue=""
      className="example-loader px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 header-btn cursor-pointer bg-white"
      title="Load example .ghml file"
    >
      <option value="" disabled>Examples…</option>
      {ENTRIES.map(({ name }) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  );
}

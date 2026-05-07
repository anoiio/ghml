export type LinkType = 'render' | 'nav' | 'action' | 'embed' | 'input';

export interface GHMLAttrs {
  model?: string;
  context?: string;
  inline?: boolean;
  width?: 'full' | 'half' | 'sidebar';
  cache?: boolean;
  fallback?: string;
  policy?: string;
  // input-specific
  placeholder?: string;
  type?: string;
}

export interface GHMLLink {
  type: LinkType;
  prompt: string;
  attrs: GHMLAttrs;
  raw: string;
}

const LINK_TYPES: LinkType[] = ['render', 'nav', 'action', 'embed', 'input'];

export function parseGHMLUri(uri: string): GHMLLink | null {
  if (!uri.startsWith('ghml:')) return null;

  let rest = uri.slice(5);

  // Match link type
  const typeMatch = rest.match(/^(render|nav|action|embed|input)\s+/);
  if (!typeMatch) return null;
  const type = typeMatch[1] as LinkType;
  if (!LINK_TYPES.includes(type)) return null;
  rest = rest.slice(typeMatch[0].length);

  // Match quoted prompt (handle escaped quotes)
  const promptMatch = rest.match(/^"((?:[^"\\]|\\.)*)"\s*/);
  if (!promptMatch) return null;
  const prompt = promptMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  rest = rest.slice(promptMatch[0].length);

  // Parse key=value attributes and boolean flags
  const attrs: GHMLAttrs = {};
  while (rest.length > 0) {
    rest = rest.trim();
    if (!rest) break;

    // key="quoted value"
    const quotedKvMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9_-]*)="([^"]*)"\s*/);
    if (quotedKvMatch) {
      setAttr(attrs, quotedKvMatch[1], quotedKvMatch[2]);
      rest = rest.slice(quotedKvMatch[0].length);
      continue;
    }

    // key=barevalue
    const kvMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9_-]*)=([^\s)"]+)\s*/);
    if (kvMatch) {
      setAttr(attrs, kvMatch[1], kvMatch[2]);
      rest = rest.slice(kvMatch[0].length);
      continue;
    }

    // boolean flag
    const flagMatch = rest.match(/^(inline|cache)\s*/);
    if (flagMatch) {
      if (flagMatch[1] === 'inline') attrs.inline = true;
      if (flagMatch[1] === 'cache') attrs.cache = true;
      rest = rest.slice(flagMatch[0].length);
      continue;
    }

    // Unknown token — skip
    const skipMatch = rest.match(/^\S+\s*/);
    if (skipMatch) rest = rest.slice(skipMatch[0].length);
    else break;
  }

  return { type, prompt, attrs, raw: uri };
}

function setAttr(attrs: GHMLAttrs, key: string, value: string): void {
  switch (key) {
    case 'model':    attrs.model    = value; break;
    case 'context':  attrs.context  = value; break;
    case 'width':
      if (value === 'full' || value === 'half' || value === 'sidebar')
        attrs.width = value;
      break;
    case 'fallback': attrs.fallback = value; break;
    case 'policy':      attrs.policy      = value; break;
    case 'inline':      attrs.inline      = value !== 'false'; break;
    case 'cache':       attrs.cache       = value !== 'false'; break;
    case 'placeholder': attrs.placeholder = value; break;
    case 'type':        attrs.type        = value; break;
  }
}

export function interpolatePrompt(
  prompt: string,
  variables: Record<string, unknown>,
): string {
  return prompt.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmed = (path as string).trim();

    // Flat-key lookup first: supports inputs and settings that store
    // dotted names as literal keys (e.g. variables["user.name"] = "Alice").
    if (Object.prototype.hasOwnProperty.call(variables, trimmed)) {
      const flat = variables[trimmed];
      if (flat != null) return String(flat);
    }

    // Fall back to dotted-path traversal for nested objects.
    const keys = trimmed.split('.');
    let value: unknown = variables;
    for (const key of keys) {
      if (value == null || typeof value !== 'object') return match;
      value = (value as Record<string, unknown>)[key];
    }
    return value != null ? String(value) : match;
  });
}

import Anthropic from '@anthropic-ai/sdk';
import { GHMLLink } from '../parser/ghml-parser';

export type Provider = 'api' | 'local-cli';

export interface ChainEntry {
  prompt: string;
  response: string;
}

export interface ExecuteOptions {
  link: GHMLLink;
  provider: Provider;
  apiKey: string;
  maxTokens?: number;
  pageContent?: string;
  chainHistory?: ChainEntry[];
  userVariables?: Record<string, unknown>;
  onToken: (accumulated: string) => void;
  onDone: (final: string, tokenCount: number) => void;
  onError: (error: Error) => void;
}

const DEFAULT_MODEL = 'claude-opus-4-7';

// Stable system prompt — cached on first API request, reused thereafter.
const GHML_SYSTEM_BASE = `You are a GHML (Generative HyperText Markup Language) renderer.
Your job is to generate content in response to user prompts.

OUTPUT FORMAT RULES:
- Output valid CommonMark Markdown by default.
- You MAY include GHML links to enable further navigation. Use this syntax exactly:
  [link text](ghml:<type> "<prompt>" [attributes])
  Types: render (replace view), nav (replace + history), action (inline result), embed (inline widget)
- Keep responses well-structured and focused.
- Do not explain that you are an LLM or discuss your nature unless explicitly asked.

INTERACTIVE CONTENT RULE (important):
If your response poses a question, presents choices, or invites the user to explore further,
you MUST include ghml: links or ghml:input fields so the user can act. Never end with a
question or decision point that has no actionable link. The user cannot type free-form text —
links are the only way they can continue. When in doubt, add 2-3 ghml:nav links at the end.

GHML LINK EXAMPLES:
[Learn more](ghml:render "Generate a detailed explanation of X")
[Show code](ghml:action "Provide a Python code example for Y" inline)
[Compare options](ghml:render "Compare A vs B across 5 dimensions" context=chain)`.trim();

export async function executeGHMLLink(options: ExecuteOptions): Promise<void> {
  const { link, provider, apiKey, maxTokens = 4096, pageContent, chainHistory = [], onToken, onDone, onError } = options;

  // Build context additions (shared by both providers)
  const contextParts: string[] = [];
  if (link.attrs.context?.includes('page') && pageContent) {
    contextParts.push(`## Current Page Content\n${pageContent}`);
  }
  if (link.attrs.context?.includes('chain') && chainHistory.length > 0) {
    const historyText = chainHistory
      .map((e, i) => `### Navigation ${i + 1}\nPrompt: ${e.prompt}\nResponse:\n${e.response}`)
      .join('\n\n');
    contextParts.push(`## Navigation History\n${historyText}`);
  }

  const userMessage =
    link.attrs.context?.includes('selection')
      ? `Selected text context is embedded in the prompt.\n\n${link.prompt}`
      : link.prompt;

  if (provider === 'local-cli') {
    const systemWithContext = [GHML_SYSTEM_BASE, ...contextParts].join('\n\n');
    await executeWithCLI(userMessage, systemWithContext, onToken, onDone, onError);
  } else {
    await executeWithAPI(link, userMessage, contextParts, apiKey, maxTokens, onToken, onDone, onError);
  }
}

// ── Anthropic API path ──────────────────────────────────────────────────────

async function executeWithAPI(
  link: GHMLLink,
  userMessage: string,
  contextParts: string[],
  apiKey: string,
  maxTokens: number,
  onToken: (accumulated: string) => void,
  onDone: (final: string, tokenCount: number) => void,
  onError: (error: Error) => void,
): Promise<void> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: GHML_SYSTEM_BASE,
      cache_control: { type: 'ephemeral' },
    },
    ...contextParts.map((text): Anthropic.TextBlockParam => ({ type: 'text', text: `\n\n${text}` })),
  ];

  const model = link.attrs.model ?? DEFAULT_MODEL;
  let accumulated = '';

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      system: systemBlocks,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        accumulated += event.delta.text;
        onToken(accumulated);
      }
    }

    const finalMsg = await stream.finalMessage();
    onDone(accumulated, finalMsg.usage.output_tokens);
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

// ── Local Claude CLI path ───────────────────────────────────────────────────

async function executeWithCLI(
  prompt: string,
  system: string,
  onToken: (accumulated: string) => void,
  onDone: (final: string, tokenCount: number) => void,
  onError: (error: Error) => void,
): Promise<void> {
  let accumulated = '';

  try {
    const response = await fetch('/api/claude-cli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Proxy error ${response.status}: is the dev server running?`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6)) as { type: string; text?: string; message?: string };
          if (event.type === 'token' && event.text) {
            accumulated += event.text;
            onToken(accumulated);
          } else if (event.type === 'done') {
            onDone(accumulated, Math.ceil(accumulated.length / 4));
            return;
          } else if (event.type === 'error') {
            onError(new Error(event.message ?? 'CLI error'));
            return;
          }
        } catch {
          // malformed SSE line — skip
        }
      }
    }

    onDone(accumulated, Math.ceil(accumulated.length / 4));
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

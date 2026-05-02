import Anthropic from '@anthropic-ai/sdk';
import { GHMLLink } from '../parser/ghml-parser';

export interface ChainEntry {
  prompt: string;
  response: string;
}

export interface ExecuteOptions {
  link: GHMLLink;
  apiKey: string;
  pageContent?: string;
  chainHistory?: ChainEntry[];
  userVariables?: Record<string, unknown>;
  onToken: (accumulated: string) => void;
  onDone: (final: string) => void;
  onError: (error: Error) => void;
}

const DEFAULT_MODEL = 'claude-opus-4-7';

// Stable system prompt — cached on the first request, read from cache thereafter.
// Per prompt-caching best practice: stable content first, volatile content appended later.
const GHML_SYSTEM_BASE = `You are a GHML (Generative HyperText Markup Language) renderer.
Your job is to generate content in response to user prompts.

OUTPUT FORMAT RULES:
- Output valid CommonMark Markdown by default.
- You MAY include GHML links to enable further navigation. Use this syntax exactly:
  [link text](ghml:<type> "<prompt>" [attributes])
  Types: render (replace view), nav (replace + history), action (inline result), embed (inline widget)
- Keep responses well-structured and focused.
- Do not explain that you are an LLM or discuss your nature unless explicitly asked.

GHML LINK EXAMPLES:
[Learn more](ghml:render "Generate a detailed explanation of X")
[Show code](ghml:action "Provide a Python code example for Y" inline)
[Compare options](ghml:render "Compare A vs B across 5 dimensions" context=chain)`.trim();

export async function executeGHMLLink(options: ExecuteOptions): Promise<void> {
  const {
    link,
    apiKey,
    pageContent,
    chainHistory = [],
    onToken,
    onDone,
    onError,
  } = options;

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  // Assemble system content — stable base is cached, volatile context appended after
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: GHML_SYSTEM_BASE,
      // Cache the stable system prompt to save tokens on repeated clicks
      cache_control: { type: 'ephemeral' },
    },
  ];

  if (link.attrs.context?.includes('page') && pageContent) {
    systemBlocks.push({
      type: 'text',
      text: `\n\n## Current Page Content\n${pageContent}`,
    });
  }

  if (link.attrs.context?.includes('chain') && chainHistory.length > 0) {
    const historyText = chainHistory
      .map((e, i) => `### Navigation ${i + 1}\nPrompt: ${e.prompt}\nResponse:\n${e.response}`)
      .join('\n\n');
    systemBlocks.push({
      type: 'text',
      text: `\n\n## Navigation History\n${historyText}`,
    });
  }

  const userMessage: string =
    link.attrs.context?.includes('selection')
      ? `Selected text context is embedded in the prompt.\n\n${link.prompt}`
      : link.prompt;

  const model = link.attrs.model ?? DEFAULT_MODEL;

  let accumulated = '';

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: systemBlocks,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      // Only surface text deltas to the UI — skip thinking blocks
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        accumulated += event.delta.text;
        onToken(accumulated);
      }
    }

    await stream.finalMessage();
    onDone(accumulated);
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

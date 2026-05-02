import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';

function claudeCliPlugin(): Plugin {
  return {
    name: 'claude-cli',
    configureServer(server) {
      server.middlewares.use('/api/claude-cli', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          let prompt = '';
          let system = '';
          try {
            const parsed = JSON.parse(body);
            prompt = parsed.prompt ?? '';
            system = parsed.system ?? '';
          } catch {
            res.statusCode = 400;
            res.end('Bad request');
            return;
          }

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('Access-Control-Allow-Origin', '*');

          // Embed system context in the user prompt (most compatible across CLI versions)
          const fullPrompt = system ? `${system}\n\n---\n\n${prompt}` : prompt;

          const proc = spawn('claude', [
            '-p', fullPrompt,
            '--output-format', 'stream-json',
            '--verbose',
            '--no-session-persistence',
          ], { stdio: ['ignore', 'pipe', 'pipe'] });

          let prevText = '';
          let done = false;
          let stdoutBuf = '';

          const send = (data: unknown) => {
            if (!res.destroyed) res.write(`data: ${JSON.stringify(data)}\n\n`);
          };

          proc.stdout.on('data', (chunk: Buffer) => {
            stdoutBuf += chunk.toString();
            const lines = stdoutBuf.split('\n');
            stdoutBuf = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const event = JSON.parse(trimmed) as Record<string, unknown>;

                // assistant events carry cumulative text in message.content[]
                if (event.type === 'assistant') {
                  const content = (event.message as {content?: {type:string;text?:string}[]})?.content ?? [];
                  const text = content.filter(b => b.type === 'text').map(b => b.text ?? '').join('');
                  if (text.length > prevText.length) {
                    send({ type: 'token', text: text.slice(prevText.length) });
                    prevText = text;
                  }
                }

                // result event signals completion
                if (event.type === 'result' && !done) {
                  // fallback: if nothing streamed, send the full result string
                  if (!prevText && typeof event.result === 'string') {
                    send({ type: 'token', text: event.result });
                  }
                  send({ type: 'done' });
                  done = true;
                  res.end();
                }
              } catch {
                // non-JSON lines (warnings, etc.) — ignore
              }
            }
          });

          proc.stderr.on('data', (chunk: Buffer) => {
            // Log to server console for debugging; don't surface to client
            process.stderr.write(`[claude-cli] ${chunk.toString()}`);
          });

          proc.on('close', (code: number | null) => {
            if (done) return;
            if (code !== 0) {
              send({ type: 'error', message: `claude exited with code ${code ?? '?'}` });
            } else {
              send({ type: 'done' });
            }
            res.end();
          });

          proc.on('error', (err: Error) => {
            if (!done) {
              send({ type: 'error', message: `Cannot start claude CLI: ${err.message}` });
              res.end();
              done = true;
            }
          });
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), claudeCliPlugin()],
  define: {
    global: 'globalThis',
  },
});

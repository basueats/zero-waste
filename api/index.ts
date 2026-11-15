import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

export default async function handler(
  req: IncomingMessage & { url?: string; body?: unknown; _body?: boolean },
  res: ServerResponse
) {
  try {
    const rawUrl = req.url || '/';
    if (rawUrl.includes('__vpath=')) {
      const parsed = new URL(rawUrl, 'http://localhost');
      const vpath = parsed.searchParams.get('__vpath');
      if (vpath) {
        parsed.searchParams.delete('__vpath');
        const remainingQs = parsed.searchParams.toString();
        req.url = remainingQs ? `${vpath}?${remainingQs}` : vpath;
      }
    }
    if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
      req._body = true;
    }
    const expressHandler = app as unknown as (req: unknown, res: unknown) => unknown;
    return await Promise.resolve(expressHandler(req, res));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Serverless function invocation failed';
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: message }));
    }
  }
}

import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

export default function handler(
  req: IncomingMessage & { url?: string },
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
    return app(req as any, res as any);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Serverless function invocation failed';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}

// Express middleware: validates the Bearer token via Supabase Auth and
// attaches the plaintiff's profile row to req.plaintiff.
// See HANDOFF.md Section 9.

import { NextFunction, Request, Response } from 'express';
import { getAuthUser } from '../db/auth.js';
import { getPlaintiffByAuthUserId } from '../db/queries.js';
import { PlaintiffRow, UpstreamError } from '../types.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      plaintiff?: PlaintiffRow;
    }
  }
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      console.error(`[authenticate] ${req.method} ${req.path} — missing or malformed Authorization header`);
      res.status(401).json({ error: 'Missing or malformed Authorization header. Expected: Bearer <token>' });
      return;
    }

    let authUser;
    try {
      authUser = await getAuthUser(token);
    } catch (err) {
      console.error(`[authenticate] ${req.method} ${req.path} — token validation network error:`, err);
      res.status(502).json({ error: 'Failed to validate token with auth provider' });
      return;
    }

    if (!authUser) {
      console.error(`[authenticate] ${req.method} ${req.path} — invalid or expired token`);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    let plaintiff: PlaintiffRow | null;
    try {
      plaintiff = await getPlaintiffByAuthUserId(authUser.id);
    } catch (err) {
      console.error(`[authenticate] ${req.method} ${req.path} — plaintiff lookup failed:`, err);
      res.status(err instanceof UpstreamError ? 502 : 500).json({ error: 'Failed to load user profile' });
      return;
    }

    if (!plaintiff) {
      console.error(`[authenticate] ${req.method} ${req.path} — no plaintiff row for auth user ${authUser.id}`);
      res.status(401).json({ error: 'No plaintiff profile linked to this account' });
      return;
    }

    req.plaintiff = plaintiff;
    next();
  } catch (err) {
    console.error(`[authenticate] ${req.method} ${req.path} — unexpected error:`, err);
    res.status(500).json({ error: 'Internal authentication error' });
  }
}

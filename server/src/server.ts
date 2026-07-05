// ClaimRunner backend — Express server.
// Routes per HANDOFF.md Section 7. Default port 3000.

import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { fillPdf } from './fillPdf.js';
import { authenticate, extractBearerToken } from './middleware/authenticate.js';
import { buildFormDataFromCase } from './services/caseToFormData.js';
import { getAuthUser, signIn, signOut, signUp } from './db/auth.js';
import {
  createCase,
  createDefendant,
  createPlaintiff,
  getAllCaseSteps,
  getCaseWithParties,
  updateCase,
} from './db/queries.js';
import {
  CLAIM_REASONS,
  ClaimReason,
  FormData,
  NotFoundError,
  UpstreamError,
  ValidationError,
} from './types.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

/** Map thrown errors to HTTP status codes consistently. */
function errorStatus(err: unknown): number {
  if (err instanceof ValidationError) return 400;
  if (err instanceof NotFoundError) return 404;
  if (err instanceof UpstreamError) return 502;
  return 500;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

/** Wrap async route handlers so rejections hit the error responder. */
function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

function sendPdf(res: Response, pdfBytes: Uint8Array): void {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="notice-of-small-claim-filled.pdf"');
  res.send(Buffer.from(pdfBytes));
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

// POST /api/auth/signup — create auth account + linked plaintiffs row
app.post(
  '/api/auth/signup',
  asyncHandler(async (req, res) => {
    try {
      const { name, email, password } = (req.body ?? {}) as {
        name?: string;
        email?: string;
        password?: string;
      };
      if (!name?.trim() || !email?.trim() || !password) {
        console.error('[POST /api/auth/signup] Missing required field(s)');
        res.status(400).json({ error: 'name, email, and password are required' });
        return;
      }

      const { session, user } = await signUp(email.trim(), password);
      const plaintiff = await createPlaintiff({
        name: name.trim(),
        email: email.trim(),
        auth_user_id: user.id,
      });

      res.status(201).json({ session, plaintiff });
    } catch (err) {
      console.error('[POST /api/auth/signup] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// POST /api/auth/login — exchange email/password for a session
app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    try {
      const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
      if (!email?.trim() || !password) {
        console.error('[POST /api/auth/login] Missing email or password');
        res.status(400).json({ error: 'email and password are required' });
        return;
      }

      const result = await signIn(email.trim(), password);
      if (!result) {
        console.error(`[POST /api/auth/login] Invalid credentials for ${email}`);
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      res.status(200).json({ session: result.session, user: result.user });
    } catch (err) {
      console.error('[POST /api/auth/login] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// POST /api/auth/logout — invalidate session (token passed straight through)
app.post(
  '/api/auth/logout',
  asyncHandler(async (req, res) => {
    try {
      const token = extractBearerToken(req);
      if (!token) {
        console.error('[POST /api/auth/logout] Missing Authorization header');
        res.status(401).json({ error: 'Missing Authorization header' });
        return;
      }
      await signOut(token);
      res.status(204).end();
    } catch (err) {
      console.error('[POST /api/auth/logout] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// GET /api/auth/me — logged-in plaintiff's profile 🔒
app.get(
  '/api/auth/me',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      res.status(200).json(req.plaintiff);
    } catch (err) {
      console.error('[GET /api/auth/me] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Direct PDF fill (no database)
// ---------------------------------------------------------------------------

// POST /fill — fill and download the PDF in one step
app.post(
  '/fill',
  asyncHandler(async (req, res) => {
    try {
      const formData = req.body as FormData;
      const pdfBytes = await fillPdf(formData);
      sendPdf(res, pdfBytes);
    } catch (err) {
      console.error('[POST /fill] Error:', err);
      res
        .status(err instanceof ValidationError ? 400 : 500)
        .json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Plaintiffs
// ---------------------------------------------------------------------------

// POST /api/plaintiffs — create a plaintiff row
app.post(
  '/api/plaintiffs',
  asyncHandler(async (req, res) => {
    try {
      const { name, dob, address, city, state, zip, phone, email } = (req.body ?? {}) as Record<
        string,
        string | undefined
      >;
      if (!name?.trim()) {
        console.error('[POST /api/plaintiffs] Missing name');
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const plaintiff = await createPlaintiff({ name: name.trim(), dob, address, city, state, zip, phone, email });
      res.status(201).json(plaintiff);
    } catch (err) {
      console.error('[POST /api/plaintiffs] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Defendants
// ---------------------------------------------------------------------------

// POST /api/defendants — create a defendant contact record 🔒
app.post(
  '/api/defendants',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const { name, address, city, state, zip, phone, email } = (req.body ?? {}) as Record<
        string,
        string | undefined
      >;
      if (!name?.trim()) {
        console.error('[POST /api/defendants] Missing name');
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const defendant = await createDefendant({ name: name.trim(), address, city, state, zip, phone, email });
      res.status(201).json(defendant);
    } catch (err) {
      console.error('[POST /api/defendants] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

// POST /api/cases — create a case; plaintiff_id injected from the session 🔒
app.post(
  '/api/cases',
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const {
        case_name,
        incident_date,
        claim_amount,
        claim_reason,
        defendant_id,
        case_number,
        current_step_id,
        pdf_extra_fields,
      } = (req.body ?? {}) as {
        case_name?: string;
        incident_date?: string;
        claim_amount?: number;
        claim_reason?: string;
        defendant_id?: string;
        case_number?: string;
        current_step_id?: string;
        pdf_extra_fields?: Record<string, unknown>;
      };

      const missing: string[] = [];
      if (!case_name?.trim()) missing.push('case_name');
      if (!incident_date?.trim()) missing.push('incident_date');
      if (claim_amount === undefined || claim_amount === null || Number.isNaN(Number(claim_amount))) {
        missing.push('claim_amount (numeric)');
      }
      if (!claim_reason || !CLAIM_REASONS.includes(claim_reason as ClaimReason)) {
        missing.push(`claim_reason (one of: ${CLAIM_REASONS.join(', ')})`);
      }
      if (missing.length > 0) {
        console.error(`[POST /api/cases] Invalid body — missing/invalid: ${missing.join(', ')}`);
        res.status(400).json({ error: `Missing or invalid field(s): ${missing.join(', ')}` });
        return;
      }

      // plaintiff_id is NEVER accepted from the client — injected from the session.
      const created = await createCase({
        case_name: case_name!.trim(),
        incident_date: incident_date!,
        claim_amount: Number(claim_amount),
        claim_reason: claim_reason!,
        plaintiff_id: req.plaintiff!.id,
        defendant_id,
        case_number,
        current_step_id,
        pdf_extra_fields,
      });
      res.status(201).json(created);
    } catch (err) {
      console.error('[POST /api/cases] Error:', err);
      // Postgres constraint violations surface as UpstreamError; map obvious
      // client mistakes (enum/constraint) to 400 for a clearer signal.
      if (err instanceof UpstreamError && /constraint|enum|violates|invalid input/i.test(err.message)) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// GET /api/cases/:id — case joined with plaintiff + defendant
app.get(
  '/api/cases/:id',
  asyncHandler(async (req, res) => {
    try {
      const caseRow = await getCaseWithParties(req.params.id);
      res.status(200).json(caseRow);
    } catch (err) {
      console.error(`[GET /api/cases/${req.params.id}] Error:`, err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// POST /api/cases/:id/fill — reconstruct FormData from the case, return PDF
app.post(
  '/api/cases/:id/fill',
  asyncHandler(async (req, res) => {
    try {
      const caseRow = await getCaseWithParties(req.params.id);
      const formData = buildFormDataFromCase(caseRow);
      const pdfBytes = await fillPdf(formData);
      sendPdf(res, pdfBytes);
    } catch (err) {
      console.error(`[POST /api/cases/${req.params.id}/fill] Error:`, err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Case steps
// ---------------------------------------------------------------------------

// GET /api/case-steps — ordered list of all steps
app.get(
  '/api/case-steps',
  asyncHandler(async (_req, res) => {
    try {
      const steps = await getAllCaseSteps();
      res.status(200).json(steps);
    } catch (err) {
      console.error('[GET /api/case-steps] Error:', err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// PATCH /api/cases/:id/step — advance a case to the next step
app.patch(
  '/api/cases/:id/step',
  asyncHandler(async (req, res) => {
    try {
      const [caseRow, steps] = await Promise.all([
        getCaseWithParties(req.params.id),
        getAllCaseSteps(),
      ]);

      if (steps.length === 0) {
        console.error('[PATCH /api/cases/:id/step] case_steps table is empty');
        res.status(502).json({ error: 'No case steps configured' });
        return;
      }

      const currentIndex = steps.findIndex((s) => s.id === caseRow.current_step_id);
      // A case with no current step starts at the first step.
      const nextStep = currentIndex === -1 ? steps[0] : steps[currentIndex + 1];

      if (!nextStep) {
        console.error(`[PATCH /api/cases/${req.params.id}/step] Case is already on the last step`);
        res.status(400).json({ error: 'Case is already on the last step' });
        return;
      }

      const updated = await updateCase(req.params.id, { current_step_id: nextStep.id });
      res.status(200).json({ case: updated, nextStep });
    } catch (err) {
      console.error(`[PATCH /api/cases/${req.params.id}/step] Error:`, err);
      res.status(errorStatus(err)).json({ error: errorMessage(err) });
    }
  })
);

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------

app.use((req, res) => {
  console.error(`[404] ${req.method} ${req.path} — no such route`);
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// Final error handler — catches anything asyncHandler forwarded via next()
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[unhandled] ${req.method} ${req.path} —`, err);
  if (!res.headersSent) {
    res.status(errorStatus(err)).json({ error: errorMessage(err) });
  }
});

app.listen(PORT, () => {
  console.log(`ClaimRunner backend listening on http://localhost:${PORT}`);
  const placeholders = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].filter(
    (name) => !process.env[name] || process.env[name]!.startsWith('YOUR_') || process.env[name]!.includes('YOUR_PROJECT_REF')
  );
  if (placeholders.length > 0) {
    console.error(
      `[startup] WARNING: env var(s) still set to placeholders: ${placeholders.join(', ')}. ` +
        'Fill them in server/.env before calling Supabase-backed routes.'
    );
  }
});

export default app;

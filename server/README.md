# ClaimRunner Backend

Express + TypeScript backend for the small claims case management system. Implements the full API surface described in `../HANDOFF.md`: Supabase Auth (signup/login/logout/me), plaintiffs, defendants, cases, case-step tracking, and PDF generation with pdf-lib.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and replace the placeholders with your Supabase project values (Project Settings → API).
3. Run the migrations in `supabase/migrations/` in order (0001 → 0003) against your Supabase project.
4. Place `notice-of-small-claim-september-2025.pdf` in `templates/` (or point `PDF_TEMPLATE_PATH` at it).
5. In Supabase, disable email confirmation: Authentication → Providers → Email → "Confirm email" off.

## Run

- `npm run dev` — dev server with reload (tsx), port 3000
- `npm run build && npm start` — compiled production build
- `npm run typecheck` — type-check only

## Structure

- `src/server.ts` — Express app + all routes (HANDOFF §7)
- `src/types.ts` — FormData, DB row types, error classes (§2, §4)
- `src/fillPdf.ts` — validateFormData + PDF field mapping (§3)
- `src/db/supabaseRest.ts` — PostgREST wrapper over native fetch (§6)
- `src/db/auth.ts` — Supabase Auth REST wrapper (§9)
- `src/db/queries.ts` — typed table queries
- `src/services/caseToFormData.ts` — DB → FormData bridge (§5)
- `src/middleware/authenticate.ts` — Bearer-token middleware (§9)
- `supabase/migrations/` — SQL migrations

Errors return JSON `{ "error": "message" }` with the status codes from the handoff (400 validation, 401 auth, 404 not found, 502 Supabase/network, 500 other). Every failure path logs via `console.error` with a `[context]` prefix for debugging.

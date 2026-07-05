# PDF Form Filler — Backend Handoff & Spec

This document covers the data model, PDF field mapping, database schemas, and API surface of the PDF Form Filler backend. It is intended for a developer building a new questionnaire or frontend that needs to collect the right data and call the existing API to persist a case and generate a filled PDF.

---

## 1. Environment Variables

Two environment variables are required. Set them in a `.env` file at the project root (see `.env.example`):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | The bare project URL — e.g. `https://<ref>.supabase.co`. No trailing slash, no `/rest/v1/` path. |
| `SUPABASE_ANON_KEY` | The project's public/anon key. Used for user-facing Auth endpoints (signup, login, logout). Safe for server-side use; never put it client-side alongside secret data. Found at Project Settings → API → `anon`. |
| `SUPABASE_SERVICE_ROLE_KEY` | The project's secret/service-role key. Bypasses Row Level Security. Used for PostgREST DB calls and server-side token validation. Never expose in a browser or commit to version control. |

---

## 2. The FormData Structure

`src/types.ts` defines `FormData` — the canonical in-memory shape that drives PDF generation. Every API route that produces a PDF either accepts this shape directly (`POST /fill`) or reconstructs it from the database (`POST /api/cases/:id/fill`).

### Full TypeScript definition

```ts
interface Party {
  name: string;       // required
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
}

interface Interpreter {
  required: boolean;
  name?: string;
  language?: string;
}

interface ClaimDetails {
  reasons: ClaimReason[];         // at least one required; see enum below
  autoDamagesAccidentDate?: string; // required when 'Auto_damages' is in reasons
  otherReasonName?: string;         // required when 'Other' is in reasons
  explanation: string;            // required
}

interface FormData {
  clerk?: string;
  division?: Division;            // enum; see below
  smallClaimNumber?: string;
  plaintiffs: [Party, Party?];    // 1–2 plaintiffs; first is required
  defendants: [Party, Party?];    // 1–2 defendants; first is required
  interpreterPlaintiff?: Interpreter;
  interpreterDefendant?: Interpreter;
  claimantName?: string;
  claimAmount: string;            // required; dollar string e.g. "3500.00"
  incidentDate: string;           // required; ISO date "YYYY-MM-DD"
  claim: ClaimDetails;            // required
  serviceMemberCivilRelief: {     // required
    status: 'yes' | 'no' | 'unknown';
    factsIfCovered?: string;      // used when status === 'yes'
    reasonIfNotCovered?: string;  // used when status === 'no'
  };
  signature: {                    // required
    city: string;
    state: string;
    date: string;                 // ISO date "YYYY-MM-DD"
    plaintiffName: string;
  };
}
```

### Enums

**`ClaimReason`** — exactly one of:
`'Faulty_Workmanship'` | `'Merchandise'` | `'Auto_damages'` | `'wages'` | `'Loan'` | `'Return_of_Deposit'` | `'Rent'` | `'Property_Damage'` | `'Other'`

**`Division`** — dropdown of courthouse locations or `' '` (blank):
- `'East Division, Redmond Courthouse, 8601 160th Ave. N.E. Redmond, WA 98052'`
- `'South Division, Burien Courthouse, 601 SW 149th St. Burien WA 98166'`
- `'South Division, MRJC Courthouse, 401 4th Ave N., Kent, WA 98032'`
- `'Vashon Courthouse, 10011 S.W. Bank Road, Vashon 98070'`
- `'West Division, Seattle Courthouse, 516 3rd Ave, Room E-327 Seattle WA 98104'`
- `'West Division, Shoreline Courthouse, 18050 Meridian Ave N shoreline WA 98133'`

### Validation rules (enforced before PDF generation)

`validateFormData` in `src/fillPdf.ts` throws on any of these:

- `plaintiffs[0]` missing or `plaintiffs[0].name` empty
- `defendants[0]` missing or `defendants[0].name` empty
- `claimAmount` missing or empty
- `incidentDate` missing or empty
- `claim.reasons` empty array
- `claim.explanation` missing or empty
- `serviceMemberCivilRelief.status` missing or not one of `'yes' | 'no' | 'unknown'`
- `signature.city`, `signature.state`, `signature.date`, or `signature.plaintiffName` missing or empty

---

## 3. PDF Field Mapping

The PDF template is `notice-of-small-claim-september-2025.pdf`. Fields are filled using `pdf-lib` (`PDFDocument.load` → `getForm()`). The implementation lives in `src/fillPdf.ts`.

There are three field types used: `TextField`, `CheckBox`, and `Dropdown`.

### PDF field name → FormData mapping

| PDF field name | Type | Source |
|---|---|---|
| `Clerk` | TextField | `formData.clerk` |
| `cmbdivision` | Dropdown | `formData.division` |
| `small_claim_number` | TextField | `formData.smallClaimNumber` |
| `plaintiff_name_1` | TextField | `formData.plaintiffs[0].name` |
| `plaintiff_Address_1` | TextField | `formData.plaintiffs[0].address` |
| `plaintiff_City_1` | TextField | `formData.plaintiffs[0].city` |
| `plaintiff_State_1` | TextField | `formData.plaintiffs[0].state` |
| `plaintiff_Zip_1` | TextField | `formData.plaintiffs[0].zip` |
| `plaintiff_Phone` | TextField | `formData.plaintiffs[0].phone` |
| `plaintiff_Email` | TextField | `formData.plaintiffs[0].email` |
| `plaintiff_name_2` | TextField | `formData.plaintiffs[1].name` (if present) |
| `plaintiff_Address_2` | TextField | `formData.plaintiffs[1].address` |
| `plaintiff_City_2` | TextField | `formData.plaintiffs[1].city` |
| `plaintiff_State_2` | TextField | `formData.plaintiffs[1].state` |
| `plaintiff_Zip_2` | TextField | `formData.plaintiffs[1].zip` |
| `plaintiff_Phone_2` | TextField | `formData.plaintiffs[1].phone` |
| `plaintiff_Email_2` | TextField | `formData.plaintiffs[1].email` |
| `defendant_name_1` | TextField | `formData.defendants[0].name` |
| `defendant_Address_1` | TextField | `formData.defendants[0].address` |
| `defendant_City_1` | TextField | `formData.defendants[0].city` |
| `defedant_State_1` | TextField | `formData.defendants[0].state` *(note typo in PDF field name)* |
| `defendant_Zip_1` | TextField | `formData.defendants[0].zip` |
| `defendant_Phone_1` | TextField | `formData.defendants[0].phone` |
| `defendant_Email_1` | TextField | `formData.defendants[0].email` |
| `defendant_name_2` | TextField | `formData.defendants[1].name` (if present) |
| `defendant_Address_2` | TextField | `formData.defendants[1].address` |
| `defendant_City_2` | TextField | `formData.defendants[1].city` |
| `defendant_State_2` | TextField | `formData.defendants[1].state` |
| `defendant_Zip_2` | TextField | `formData.defendants[1].zip` |
| `defendant_Phone_2` | TextField | `formData.defendants[1].phone` |
| `defendant_Email_2` | TextField | `formData.defendants[1].email` |
| `Intepreter_yes` | CheckBox | `formData.interpreterPlaintiff.required === true` |
| `intepreter_no` | CheckBox | `formData.interpreterPlaintiff.required === false` |
| `intepreter_Name_1` | TextField | `formData.interpreterPlaintiff.name` |
| `intepreter_Language_1` | TextField | `formData.interpreterPlaintiff.language` |
| `intepreter_Name_2` | TextField | `formData.interpreterDefendant.name` |
| `intepreter_Language_2` | TextField | `formData.interpreterDefendant.language` |
| `plaintiff_Name_1` | TextField | `formData.claimantName` *(separate from plaintiff name)* |
| `small_claim_amount` | TextField | `formData.claimAmount` |
| `incident_date` | TextField | `formData.incidentDate` |
| `reason_Faulty_Workmanship` | CheckBox | `'Faulty_Workmanship'` in `claim.reasons` |
| `reason_Merchandise` | CheckBox | `'Merchandise'` in `claim.reasons` |
| `reason_Auto_damages` | CheckBox | `'Auto_damages'` in `claim.reasons` |
| `reason_wages` | CheckBox | `'wages'` in `claim.reasons` |
| `reason_Loan` | CheckBox | `'Loan'` in `claim.reasons` |
| `reason_Return_of_Deposit` | CheckBox | `'Return_of_Deposit'` in `claim.reasons` |
| `reason_Rent` | CheckBox | `'Rent'` in `claim.reasons` |
| `reason_Property_Damage` | CheckBox | `'Property_Damage'` in `claim.reasons` |
| `reason_Other` | CheckBox | `'Other'` in `claim.reasons` |
| `reason_Auto_Damages_accident_date` | TextField | `claim.autoDamagesAccidentDate` (if `Auto_damages` checked) |
| `reason_Other_Name` | TextField | `claim.otherReasonName` (if `Other` checked) |
| `reason_Explaination` | TextField | `claim.explanation` *(note typo in PDF field name)* |
| `service_member_civil_relief_yes` | CheckBox | `serviceMemberCivilRelief.status === 'yes'` |
| `service_member_civil_relief_no` | CheckBox | `serviceMemberCivilRelief.status === 'no'` |
| `service_member_civil_relief_unknown` | CheckBox | `serviceMemberCivilRelief.status === 'unknown'` |
| `service_member_civil_relief_law` | TextField | `serviceMemberCivilRelief.factsIfCovered` (if `status === 'yes'`) |
| `service_member_civil_relief_law_not_covered_reason` | TextField | `serviceMemberCivilRelief.reasonIfNotCovered` (if `status === 'no'`) |
| `signed_city` | TextField | `signature.city` |
| `signed_State` | TextField | `signature.state` |
| `signed_Date` | TextField | `signature.date` |
| `signed_plaintiff_name` | TextField | `signature.plaintiffName` |

### Typos in PDF field names
The template PDF has two misspelled field names that must be used exactly as-is:
- `defedant_State_1` (missing 'n' in defendant)
- `reason_Explaination` (extra 'a' in Explanation)

---

## 4. Database Schemas

Migrations live in `supabase/migrations/`. Run them in order: `0001_init.sql`, `0002_add_pdf_extra_fields.sql`, then `0003_split_plaintiff_defendant.sql`.

### `plaintiffs`

Platform users who file claims. This is the table auth will link to via `auth_user_id` (see Section 9). `dob` is stored here but not on `defendants` since it is only relevant to the filing party.

```sql
create table plaintiffs (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  dob          date,
  address      text,
  city         text,
  state        text,
  zip          text,
  phone        text,
  email        text,
  auth_user_id uuid        unique references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);
```

### `defendants`

Third-party contact records. Defendants are not platform users and have no auth linkage.

```sql
create table defendants (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  address    text,
  city       text,
  state      text,
  zip        text,
  phone      text,
  email      text,
  created_at timestamptz not null default now()
);
```

### `pdf_template`

Stores metadata about each PDF template. Currently holds one row (the Notice of Small Claim). `field_schema` is a JSONB document describing each fillable field (used as a schema reference, not enforced by the server at runtime).

```sql
create table pdf_template (
  id            uuid    primary key default gen_random_uuid(),
  name          text    not null unique,
  field_schema  jsonb   not null,
  storage_path  text    not null,   -- relative path to the .pdf file in the repo
  created_at    timestamptz not null default now()
);
```

Index: `idx_pdf_template_field_schema` GIN on `(field_schema)`.

The seeded row has id `e4f58acc-3275-4fa1-b628-b3d1f2c5006b`, name `'Notice of Small Claim'`.

### `case_steps`

An ordered list of stages a small claim walks through. New cases are automatically assigned `step_number = 1` if no `current_step_id` is provided. Steps 2–7 have no associated PDF template and are placeholders for future documents.

```sql
create table case_steps (
  id               uuid  primary key default gen_random_uuid(),
  step_number      int   not null unique,
  step_name        text  not null,
  pdf_template_id  uuid  references pdf_template(id) on delete set null,
  created_at       timestamptz not null default now()
);
```

Seeded steps:

| step_number | step_name | pdf_template_id |
|---|---|---|
| 1 | File Small Claim | `e4f58acc-...` (Notice of Small Claim) |
| 2 | Serve the Defendant | null |
| 3 | Settlement | null |
| 4 | Evidence Gather | null |
| 5 | Trial | null |
| 6 | Decision | null |
| 7 | Payment | null |

### `cases`

The core table. Holds structured relational fields for data that is stored and queried relationally, plus a `pdf_extra_fields` JSONB blob for everything else the PDF needs that doesn't have a natural column.

```sql
create table cases (
  id               uuid           primary key default gen_random_uuid(),
  case_number      text           unique,
  case_name        text           not null,
  incident_date    date           not null,
  claim_amount     numeric(12,2)  not null,
  claim_reason     claim_reason   not null,   -- Postgres enum; see below
  current_step_id  uuid           references case_steps(id) on delete restrict,
  plaintiff_id     uuid           not null references plaintiffs(id) on delete restrict,
  defendant_id     uuid           references defendants(id) on delete restrict,
  pdf_extra_fields jsonb          not null default '{}',
  created_at       timestamptz    not null default now(),
  constraint plaintiff_defendant_distinct check (plaintiff_id is distinct from defendant_id)
);
```

The `claim_reason` Postgres enum matches the `ClaimReason` TypeScript union exactly:
`'Faulty_Workmanship'`, `'Merchandise'`, `'Auto_damages'`, `'wages'`, `'Loan'`, `'Return_of_Deposit'`, `'Rent'`, `'Property_Damage'`, `'Other'`

Indexes: `idx_cases_plaintiff(plaintiff_id)`, `idx_cases_defendant(defendant_id)`, `idx_cases_current_step(current_step_id)`.

### `pdf_extra_fields` — JSONB blob

The `cases.pdf_extra_fields` column holds every PDF field value that doesn't have a dedicated relational column. This is intentional: fields like `explanation`, `signature`, or interpreter info are PDF-specific and would be awkward as scalar columns on `cases`. The full expected shape (all keys optional unless noted):

```jsonc
{
  "explanation": "string",              // required for PDF generation
  "additionalReasons": ["ClaimReason"], // reasons beyond cases.claim_reason
  "autoDamagesAccidentDate": "YYYY-MM-DD",
  "otherReasonName": "string",
  "division": "string",                 // one of the Division enum values
  "clerk": "string",
  "smallClaimNumber": "string",
  "claimantName": "string",
  "interpreterPlaintiff": {
    "required": false,
    "name": "string",
    "language": "string"
  },
  "interpreterDefendant": {
    "required": false,
    "name": "string",
    "language": "string"
  },
  "serviceMemberCivilRelief": {         // required for PDF generation
    "status": "yes" | "no" | "unknown",
    "factsIfCovered": "string",
    "reasonIfNotCovered": "string"
  },
  "signature": {                        // required for PDF generation
    "city": "string",
    "state": "string",
    "date": "YYYY-MM-DD",
    "plaintiffName": "string"
  }
}
```

### Row Level Security

All tables have RLS enabled. The Express server uses the **service role key**, which bypasses RLS entirely — this is correct for a trusted backend with no Supabase Auth session.

Current policies grant full access to the `authenticated` role (open, for development). When auth is added these should be tightened — see Section 9.

---

## 5. Database-to-FormData Mapping

`src/services/caseToFormData.ts` exports `buildFormDataFromCase(caseRow: CaseWithParties): FormData`. This is the bridge between the database and the PDF filler.

**Merge logic:**

- `claim.reasons` = `[caseRow.claim_reason, ...(extra.additionalReasons ?? [])]` — the primary reason lives in the relational column; any additional reasons come from `pdf_extra_fields`.
- `claimAmount` = `caseRow.claim_amount.toFixed(2)` (numeric → string).
- `incidentDate` = `caseRow.incident_date` (passed through as-is).
- `plaintiffs[0]` = mapped from `caseRow.plaintiff` (the joined `user_profiles` row).
- `defendants[0]` = mapped from `caseRow.defendant` (the joined `user_profiles` row).
- Everything else (explanation, division, signature, interpreter, SMCR, clerk, etc.) comes from `pdf_extra_fields`.

**Pre-fill validation** (`ValidationError` → HTTP 400):

- `caseRow.plaintiff` must be present (non-null join result).
- `caseRow.defendant` must be present — a case without a defendant cannot be filled.
- `extra.explanation` must be non-empty.
- `extra.serviceMemberCivilRelief.status` must be present.
- All four signature fields (`city`, `state`, `date`, `plaintiffName`) must be present.

`smallClaimNumber` falls back: `extra.smallClaimNumber ?? caseRow.case_number ?? undefined`.

---

## 6. Supabase REST Client

`src/db/supabaseRest.ts` wraps Node 22's built-in `fetch` against the Supabase PostgREST API. No third-party SDK is used.

**Request shape:**

```
POST/GET/PATCH/DELETE https://<SUPABASE_URL>/rest/v1/<table>[?<query_params>]

Headers:
  apikey:        <SUPABASE_SERVICE_ROLE_KEY>
  Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
  Content-Type:  application/json
  Prefer:        return=representation   (for POST/PATCH that need the row back)
```

**PostgREST query conventions used in this project:**

| Pattern | Example | Meaning |
|---|---|---|
| `eq.<value>` filter | `id=eq.some-uuid` | WHERE id = 'some-uuid' |
| `order=col.asc` | `order=step_number.asc` | ORDER BY step_number ASC |
| `limit=N` | `limit=1` | LIMIT 1 |
| Embedded resource join | `select=*,plaintiff:plaintiff_id(*)` | LEFT JOIN user_profiles AS plaintiff ON plaintiff_id |

**Error handling:**

- Network failures → throw `"Network error calling Supabase (table): ..."`.
- Non-2xx PostgREST responses → throw `"[table] <message|hint|details from JSON>"`.
- Missing env vars → throw immediately at request time with a clear message.

---

## 7. API Routes

All routes are on the Express server (`src/server.ts`), default port 3000.

Routes marked **🔒 requires auth** must include `Authorization: Bearer <access_token>` in the request headers. The server validates the token via Supabase Auth and attaches the plaintiff's profile to the request. Missing or invalid tokens return `401`.

### Auth routes

#### `POST /api/auth/signup`

Creates a Supabase Auth account and a linked `plaintiffs` row in one step.

**Request body:**

```jsonc
{
  "name": "string",     // required
  "email": "string",    // required
  "password": "string"  // required
}
```

**Response `201`:**

```jsonc
{
  "session": {
    "access_token": "string",   // JWT — store this and send as Authorization: Bearer header
    "refresh_token": "string",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "plaintiff": { /* plaintiffs row — see POST /api/plaintiffs response */ }
}
```

**Errors:**
- `400` — missing field, email already registered, weak password, or email confirmation still enabled in Supabase (disable it under Authentication → Providers → Email).
- `502` — network or DB error.

**Implementation note:** Supabase Auth's `/auth/v1/signup` returns the session at the top level of the response (same flat shape as `/auth/v1/token`), not nested under a `session` key. This endpoint must be called with the **anon key** — using the service role key suppresses the session in the response.

---

#### `POST /api/auth/login`

Exchanges email and password for a session.

**Request body:**

```jsonc
{
  "email": "string",
  "password": "string"
}
```

**Response `200`:**

```jsonc
{
  "session": {
    "access_token": "string",
    "refresh_token": "string",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "user": { "id": "uuid", "email": "string" }
}
```

**Errors:**
- `401` — invalid credentials.
- `400` — missing email or password.

---

#### `POST /api/auth/logout`

Invalidates the current session. Requires the `Authorization: Bearer <token>` header (but does **not** go through the `authenticate` middleware — the token is passed directly to Supabase's logout endpoint).

**Response `204`** — no body.

**Errors:**
- `401` — missing Authorization header.
- `502` — network error.

---

#### `GET /api/auth/me` 🔒 requires auth

Returns the logged-in plaintiff's profile row.

**Response `200`:** the `plaintiffs` row for the authenticated user.

```jsonc
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "auth_user_id": "uuid",
  "dob": null,
  "address": null,
  "city": null,
  "state": null,
  "zip": null,
  "phone": null,
  "created_at": "ISO timestamp"
}
```

**Errors:**
- `401` — missing, invalid, or expired token; or no `plaintiffs` row linked to the auth user.
- `502` — network error during token validation.

---

### `POST /fill`

Fill and download a PDF in one step, with no database involvement.

**Request body** — `FormData` JSON (see Section 2 above).

**Response** — PDF binary (`Content-Disposition: attachment; filename="notice-of-small-claim-filled.pdf"`).

**Errors:**
- `400` — validation failed (`validateFormData` threw).
- `500` — PDF generation or file write failed.

---

### `POST /api/plaintiffs`

Create a plaintiff row. This is the platform user's own contact record.

**Request body:**

```jsonc
{
  "name": "string",       // required
  "dob": "YYYY-MM-DD",    // optional
  "address": "string",    // optional
  "city": "string",       // optional
  "state": "string",      // optional
  "zip": "string",        // optional
  "phone": "string",      // optional
  "email": "string"       // optional
}
```

**Response `201`** — the created `plaintiffs` row.

```jsonc
{
  "id": "uuid",
  "name": "string",
  "dob": "YYYY-MM-DD" | null,
  "address": "string" | null,
  "city": "string" | null,
  "state": "string" | null,
  "zip": "string" | null,
  "phone": "string" | null,
  "email": "string" | null,
  "auth_user_id": null,
  "created_at": "ISO timestamp"
}
```

**Errors:**
- `400` — `name` missing.
- `502` — Supabase error.

---

### `POST /api/defendants` 🔒 requires auth

Create a defendant contact record. Defendants are third parties — they have no auth linkage and no `dob` field.

**Request body:**

```jsonc
{
  "name": "string",       // required
  "address": "string",    // optional
  "city": "string",       // optional
  "state": "string",      // optional
  "zip": "string",        // optional
  "phone": "string",      // optional
  "email": "string"       // optional
}
```

**Response `201`** — the created `defendants` row.

```jsonc
{
  "id": "uuid",
  "name": "string",
  "address": "string" | null,
  "city": "string" | null,
  "state": "string" | null,
  "zip": "string" | null,
  "phone": "string" | null,
  "email": "string" | null,
  "created_at": "ISO timestamp"
}
```

**Errors:**
- `400` — `name` missing.
- `502` — Supabase error.

---

### `POST /api/cases` 🔒 requires auth

Create a case row. `plaintiff_id` is taken from the authenticated session — do not pass it in the request body.

**Request body:**

```jsonc
{
  "case_name": "string",          // required
  "incident_date": "YYYY-MM-DD",  // required
  "claim_amount": 3500.00,        // required — numeric
  "claim_reason": "ClaimReason",  // required — Postgres enum value
  "defendant_id": "uuid",         // optional
  "case_number": "string",        // optional — court-assigned number
  "current_step_id": "uuid",      // optional — defaults to step 1 (File Small Claim)
  "pdf_extra_fields": { ... }     // optional — see Section 4 for shape
}
```

**Response `201`** — the created `cases` row.

```jsonc
{
  "id": "uuid",
  "case_number": "string" | null,
  "case_name": "string",
  "incident_date": "YYYY-MM-DD",
  "claim_amount": 3500.00,
  "claim_reason": "ClaimReason",
  "current_step_id": "uuid" | null,
  "plaintiff_id": "uuid",
  "defendant_id": "uuid" | null,
  "pdf_extra_fields": { ... },
  "created_at": "ISO timestamp"
}
```

**Errors:**
- `400` — `case_name` or `plaintiff_id` missing, or Postgres constraint violated (e.g. `plaintiff_id === defendant_id`, unknown `claim_reason` enum value).
- `502` — Supabase error.

---

### `GET /api/cases/:id`

Fetch a case joined with its plaintiff and defendant profiles.

**URL param** — `id`: the case UUID.

**Response `200`:**

```jsonc
{
  // all CaseRow fields (see POST /api/cases response above)
  "plaintiff": { /* UserProfileRow */ },
  "defendant": { /* UserProfileRow */ } | null
}
```

The join is done via PostgREST's embedded resource syntax:
`select=*,plaintiff:plaintiff_id(*),defendant:defendant_id(*)`

**Errors:**
- `404` — no case with that UUID.
- `502` — Supabase error.

---

### `POST /api/cases/:id/fill`

Look up a case (with plaintiff/defendant), reconstruct `FormData` from it, and return the filled PDF as a download. No request body required.

**URL param** — `id`: the case UUID.

**Response** — PDF binary (same as `POST /fill`).

**Errors:**
- `400` — case found but cannot be filled: defendant missing, or required `pdf_extra_fields` keys absent (explanation, serviceMemberCivilRelief, signature fields).
- `404` — no case with that UUID.
- `500` — PDF generation failed.
- `502` — Supabase error.

---

### `GET /api/case-steps`

Returns the full ordered list of case steps. No parameters. Intended to be fetched once and cached client-side to drive step-tracker UI.

**Response `200`:**

```jsonc
[
  {
    "id": "uuid",
    "step_number": 1,
    "step_name": "File Small Claim",
    "pdf_template_id": "uuid" | null,
    "created_at": "ISO timestamp"
  },
  // … steps 2–7
]
```

Steps are always returned in ascending `step_number` order.

**Errors:**
- `502` — Supabase error.

---

### `PATCH /api/cases/:id/step`

Advances a case to the next step in the ordered sequence. The server computes the next step internally — no request body is needed.

**URL param** — `id`: the case UUID.

**Logic:**
1. Fetches the case (via `getCaseWithParties`) and all steps (via `getAllCaseSteps`) in parallel.
2. Finds the index of `current_step_id` in the ordered step list.
3. Takes `steps[index + 1]` as the next step.
4. PATCHes `cases.current_step_id` to the next step's id (via `updateCase`).

**Response `200`:**

```jsonc
{
  "case": { /* updated CaseRow (flat, no plaintiff/defendant join) */ },
  "nextStep": {
    "id": "uuid",
    "step_number": 2,
    "step_name": "Serve the Defendant",
    "pdf_template_id": null,
    "created_at": "ISO timestamp"
  }
}
```

**Errors:**
- `400` — case is already on the last step (`step_number` 7).
- `404` — no case with that UUID.
- `502` — Supabase error.

---

## 8. Data Flow Summary

### Signup and first case

```
1. POST /api/auth/signup  { name, email, password }
     → { session: { access_token, ... }, plaintiff: { id, ... } }
     (store access_token; plaintiff row is created automatically)

2. POST /api/defendants  { name, address, ... }           [Authorization: Bearer <token>]
     → { id: defendant_uuid, ... }

3. POST /api/cases {                                       [Authorization: Bearer <token>]
     case_name, incident_date, claim_amount,
     claim_reason,
     defendant_id,
     pdf_extra_fields: {
       explanation, additionalReasons,
       serviceMemberCivilRelief, signature,
       division, interpreter*, clerk, ...
     }
   }  →  { id: case_uuid, ... }
   (plaintiff_id is injected server-side from the auth token — do not pass it)

4. POST /api/cases/:case_uuid/fill  →  filled PDF download
```

To re-generate the PDF for a previously saved case, skip to step 4 with the existing `case_uuid`.

### Returning user login

```
1. POST /api/auth/login  { email, password }
     → { session: { access_token, ... }, user: { id, email } }

2. GET /api/auth/me                                        [Authorization: Bearer <token>]
     → plaintiff profile (use to pre-populate the form)

3. Continue with defendant + case creation as above.
```

### Case step tracking

```
1. GET /api/case-steps               → ordered list of all 7 steps (fetch once, cache)
2. GET /api/cases/:id                → case row with current_step_id
3. PATCH /api/cases/:id/step         → advances to next step; returns { case, nextStep }
   (repeat step 3 until step 7)
```

---

## 9. Auth Implementation

### Overview

Auth is fully implemented using **Supabase Auth** with a server-side REST wrapper in `src/db/auth.ts`. No third-party auth SDK is used. All auth calls go through the Express server — the browser never talks to Supabase directly.

### Key design decisions

**Two Supabase keys are used for different purposes:**

| Key | Used for |
|---|---|
| `SUPABASE_ANON_KEY` | `/auth/v1/signup`, `/auth/v1/token`, `/auth/v1/logout` — user-facing endpoints that must be called with the anon key to receive a session in the response |
| `SUPABASE_SERVICE_ROLE_KEY` | `/auth/v1/user` (token validation) and all PostgREST DB calls — bypasses RLS |

Using the service role key for signup or login causes Supabase to omit the session from the response, even with email confirmation disabled. Always use the anon key for user-facing auth endpoints.

**Token validation is done via round-trip to Supabase**, not local JWT verification. This avoids the `jsonwebtoken` npm dependency and keeps validation simple. The `authenticate` middleware in `src/middleware/authenticate.ts` calls `getAuthUser(token)` → `GET /auth/v1/user`, then looks up the plaintiff row via `auth_user_id`.

**`plaintiff_id` is never accepted from the client** on `POST /api/cases`. The server injects it from `req.plaintiff.id` (set by the authenticate middleware). This prevents a user from creating cases on behalf of another plaintiff.

**Defendants have no auth.** The `defendants` table has no `auth_user_id` column. Creating a defendant requires the caller to be authenticated (to tie it to a session), but defendants themselves are not users of the platform.

### `authenticate` middleware (`src/middleware/authenticate.ts`)

Applied to: `POST /api/defendants`, `POST /api/cases`, `GET /api/auth/me`.

Flow:
1. Reads `Authorization: Bearer <token>` header → 401 if missing or malformed.
2. Calls `getAuthUser(token)` → 401 if null; 502 if network error.
3. Calls `getPlaintiffByAuthUserId(authUser.id)` → 401 if no plaintiff row found.
4. Attaches result to `req.plaintiff` and calls `next()`.

### Supabase Auth settings required

- **Email confirmations: disabled.** Under Authentication → Providers → Email → "Confirm email" must be toggled off for development. With it enabled, signup returns a user but no session (`access_token` absent from response).

### RLS note

Current RLS policies grant full access to the `authenticated` role (open, for development). For production, tighten to:
- `plaintiffs`: `using (auth_user_id = auth.uid())`
- `cases`: `using (plaintiff_id in (select id from plaintiffs where auth_user_id = auth.uid()))`
- `defendants`: scoped to defendants referenced by the plaintiff's cases

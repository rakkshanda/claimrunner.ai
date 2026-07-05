-- 0001_init.sql — core schema for ClaimRunner small claims backend.
-- Run before 0002 and 0003.

-- Claim reason enum (matches the TypeScript ClaimReason union exactly)
create type claim_reason as enum (
  'Faulty_Workmanship',
  'Merchandise',
  'Auto_damages',
  'wages',
  'Loan',
  'Return_of_Deposit',
  'Rent',
  'Property_Damage',
  'Other'
);

-- PDF template metadata
create table pdf_template (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null unique,
  field_schema  jsonb       not null,
  storage_path  text        not null,
  created_at    timestamptz not null default now()
);

create index idx_pdf_template_field_schema on pdf_template using gin (field_schema);

-- Seed the Notice of Small Claim template
insert into pdf_template (id, name, field_schema, storage_path)
values (
  'e4f58acc-3275-4fa1-b628-b3d1f2c5006b',
  'Notice of Small Claim',
  '{}'::jsonb,
  'templates/notice-of-small-claim-september-2025.pdf'
);

-- Ordered case steps
create table case_steps (
  id               uuid        primary key default gen_random_uuid(),
  step_number      int         not null unique,
  step_name        text        not null,
  pdf_template_id  uuid        references pdf_template(id) on delete set null,
  created_at       timestamptz not null default now()
);

insert into case_steps (step_number, step_name, pdf_template_id) values
  (1, 'File Small Claim', 'e4f58acc-3275-4fa1-b628-b3d1f2c5006b'),
  (2, 'Serve the Defendant', null),
  (3, 'Settlement', null),
  (4, 'Evidence Gather', null),
  (5, 'Trial', null),
  (6, 'Decision', null),
  (7, 'Payment', null);

alter table pdf_template enable row level security;
alter table case_steps enable row level security;

-- Open development policies (tighten for production — see HANDOFF.md §9)
create policy pdf_template_authenticated_all on pdf_template
  for all to authenticated using (true) with check (true);
create policy case_steps_authenticated_all on case_steps
  for all to authenticated using (true) with check (true);

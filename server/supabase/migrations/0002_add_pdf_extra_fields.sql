-- 0002_add_pdf_extra_fields.sql — cases table with pdf_extra_fields JSONB.
-- (Party tables are created here as a unified user_profiles-style table,
--  then split into plaintiffs/defendants in 0003.)

create table user_profiles (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  dob        date,
  address    text,
  city       text,
  state      text,
  zip        text,
  phone      text,
  email      text,
  created_at timestamptz not null default now()
);

create table cases (
  id               uuid           primary key default gen_random_uuid(),
  case_number      text           unique,
  case_name        text           not null,
  incident_date    date           not null,
  claim_amount     numeric(12,2)  not null,
  claim_reason     claim_reason   not null,
  current_step_id  uuid           references case_steps(id) on delete restrict,
  plaintiff_id     uuid           not null references user_profiles(id) on delete restrict,
  defendant_id     uuid           references user_profiles(id) on delete restrict,
  pdf_extra_fields jsonb          not null default '{}',
  created_at       timestamptz    not null default now(),
  constraint plaintiff_defendant_distinct check (plaintiff_id is distinct from defendant_id)
);

create index idx_cases_plaintiff on cases (plaintiff_id);
create index idx_cases_defendant on cases (defendant_id);
create index idx_cases_current_step on cases (current_step_id);

alter table user_profiles enable row level security;
alter table cases enable row level security;

create policy user_profiles_authenticated_all on user_profiles
  for all to authenticated using (true) with check (true);
create policy cases_authenticated_all on cases
  for all to authenticated using (true) with check (true);

-- 0004_eligibility_forms.sql — eligibility questionnaire submissions, plus a
-- nullable link from plaintiffs so we can measure how many people who filled
-- out the eligibility form went on to create an account.

create table eligibility_forms (
  id         uuid        primary key default gen_random_uuid(),
  answers    jsonb       not null default '{}',
  eligible   boolean,                          -- outcome of the check, if computed
  created_at timestamptz not null default now()
);

-- Optional pointer from a plaintiff to the eligibility form they submitted.
-- ON DELETE SET NULL: deleting the eligibility row just clears the pointer,
-- leaving the plaintiff row otherwise intact.
-- UNIQUE (nullable): many plaintiffs may have NULL, but a given form can only
-- be claimed by one account (keeps the conversion metric honest).
alter table plaintiffs
  add column eligibility_form_id uuid unique
  references eligibility_forms(id) on delete set null;

alter table eligibility_forms enable row level security;

-- Open development policy (tighten for production — see HANDOFF.md §9/§10).
create policy eligibility_forms_authenticated_all on eligibility_forms
  for all to authenticated using (true) with check (true);

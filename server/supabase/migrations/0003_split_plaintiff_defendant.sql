-- 0003_split_plaintiff_defendant.sql — split user_profiles into
-- plaintiffs (platform users, auth-linked) and defendants (third-party contacts).

-- Plaintiffs: platform users; auth linkage via auth_user_id; dob kept here.
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

-- Defendants: third-party contact records; no auth linkage, no dob.
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

-- Migrate existing rows: profiles referenced as plaintiffs → plaintiffs,
-- profiles referenced as defendants → defendants.
insert into plaintiffs (id, name, dob, address, city, state, zip, phone, email, created_at)
select up.id, up.name, up.dob, up.address, up.city, up.state, up.zip, up.phone, up.email, up.created_at
from user_profiles up
where up.id in (select plaintiff_id from cases);

insert into defendants (id, name, address, city, state, zip, phone, email, created_at)
select up.id, up.name, up.address, up.city, up.state, up.zip, up.phone, up.email, up.created_at
from user_profiles up
where up.id in (select defendant_id from cases where defendant_id is not null)
on conflict (id) do nothing;

-- Repoint cases foreign keys to the new tables.
alter table cases drop constraint cases_plaintiff_id_fkey;
alter table cases drop constraint cases_defendant_id_fkey;
alter table cases
  add constraint cases_plaintiff_id_fkey
  foreign key (plaintiff_id) references plaintiffs(id) on delete restrict;
alter table cases
  add constraint cases_defendant_id_fkey
  foreign key (defendant_id) references defendants(id) on delete restrict;

drop table user_profiles;

alter table plaintiffs enable row level security;
alter table defendants enable row level security;

-- Open development policies (tighten for production — see HANDOFF.md §9):
--   plaintiffs: using (auth_user_id = auth.uid())
--   cases:      using (plaintiff_id in (select id from plaintiffs where auth_user_id = auth.uid()))
--   defendants: scoped to defendants referenced by the plaintiff's cases
create policy plaintiffs_authenticated_all on plaintiffs
  for all to authenticated using (true) with check (true);
create policy defendants_authenticated_all on defendants
  for all to authenticated using (true) with check (true);

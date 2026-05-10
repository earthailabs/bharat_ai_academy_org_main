-- =====================================================================
-- Bharat AI Academy — Initial Schema
-- =====================================================================
-- Idempotent: safe to re-run. Uses Supabase auth.users for identity.
-- Apply with:  supabase db push     (or paste into the Supabase SQL editor)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROGRAMS  (catalog — admin-editable, public-readable)
-- ---------------------------------------------------------------------
create table if not exists public.programs (
  id              text primary key,                -- 'youth', 'school', 'incubator', 'jobs'
  name            text not null,
  slug            text not null unique,
  description     text,
  duration        text,
  location        text,
  full_price      integer,                          -- in INR rupees
  reserve_price   integer,
  seats_total     integer,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

insert into public.programs (id, name, slug, description, duration, location, full_price, reserve_price, seats_total)
values
  ('youth',     'AI for Youth',           'ai-for-youth',           '8-week offline AI training',          '8 weeks', 'Charkhi Dadri, Haryana', 17000, 5000, 40),
  ('school',    'AI for School Students', 'ai-for-school-students', '4-week weekend program (10–17 yrs)',  '4 weeks', 'Charkhi Dadri, Haryana',  4999, 1000, 20),
  ('incubator', 'AI Startup Incubator',   'ai-startup-incubator',   'Funding + mentorship to launch AI biz', 'Ongoing', 'Haryana', null, null, null),
  ('jobs',      'Job Placement Support',  'job-placement-support',  'Career help — free with Youth program', 'Lifetime', 'PAN India', 0, null, null)
on conflict (id) do update
  set name = excluded.name, slug = excluded.slug, description = excluded.description,
      full_price = excluded.full_price, reserve_price = excluded.reserve_price,
      seats_total = excluded.seats_total, updated_at = now();

-- ---------------------------------------------------------------------
-- 2. BATCHES  (time-bounded cohorts under a program)
-- ---------------------------------------------------------------------
create table if not exists public.batches (
  id              uuid primary key default gen_random_uuid(),
  program_id      text not null references public.programs(id) on delete cascade,
  name            text not null,
  start_date      date,
  end_date        date,
  seats_total     integer,
  seats_filled    integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists batches_program_idx on public.batches (program_id, active);

-- ---------------------------------------------------------------------
-- 3. STUDENTS  (extends auth.users, plus walk-ins without an account)
-- ---------------------------------------------------------------------
create table if not exists public.students (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid unique references auth.users(id) on delete set null,
  full_name          text not null,
  phone              text not null,
  email              text,
  age                integer,
  city               text,
  state              text,
  school             text,
  career_interests   text,
  profile_picture    text,                                -- Supabase Storage path
  referral_code      text unique,
  referrer_student_id uuid references public.students(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists students_phone_idx on public.students (phone);
create index if not exists students_user_idx  on public.students (user_id);
create index if not exists students_email_idx on public.students (email);

-- Auto-generate a unique short referral code on insert
create or replace function public.generate_referral_code()
returns text language plpgsql as $$
declare
  candidate text;
  attempts int := 0;
begin
  loop
    candidate := upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 6));
    perform 1 from public.students where referral_code = candidate;
    if not found then return candidate; end if;
    attempts := attempts + 1;
    if attempts > 10 then
      candidate := upper(substr(md5(gen_random_uuid()::text), 1, 8));
      return candidate;
    end if;
  end loop;
end $$;

create or replace function public.students_set_referral_code()
returns trigger language plpgsql as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code();
  end if;
  return new;
end $$;

drop trigger if exists trg_students_set_ref_code on public.students;
create trigger trg_students_set_ref_code
  before insert on public.students
  for each row execute function public.students_set_referral_code();

-- ---------------------------------------------------------------------
-- 4. ADMINS  (membership table — presence = is admin)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'admin',  -- 'admin' | 'super_admin'
  created_at  timestamptz not null default now()
);

-- Reusable predicate for RLS policies
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admins where user_id = uid);
$$;

-- ---------------------------------------------------------------------
-- 5. REGISTRATIONS  (the lead funnel — created BEFORE auth/profile)
-- ---------------------------------------------------------------------
do $$ begin
  create type public.registration_status as enum ('pending', 'reserved', 'paid', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.registrations (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid references public.students(id) on delete set null,
  full_name             text not null,
  phone                 text not null,
  email                 text,
  program_id            text not null references public.programs(id),
  batch_id              uuid references public.batches(id) on delete set null,
  referral_code_used    text,
  referrer_student_id   uuid references public.students(id) on delete set null,
  status                public.registration_status not null default 'pending',
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists registrations_phone_idx   on public.registrations (phone);
create index if not exists registrations_status_idx  on public.registrations (status);
create index if not exists registrations_program_idx on public.registrations (program_id);
create index if not exists registrations_student_idx on public.registrations (student_id);

-- ---------------------------------------------------------------------
-- 6. PAYMENTS  (Razorpay-verified — only Edge Functions write here)
-- ---------------------------------------------------------------------
do $$ begin
  create type public.payment_type   as enum ('reserve', 'full', 'balance');
  create type public.payment_status as enum ('initiated', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.payments (
  id                      uuid primary key default gen_random_uuid(),
  registration_id         uuid not null references public.registrations(id) on delete cascade,
  amount                  integer not null,                  -- INR rupees
  currency                text not null default 'INR',
  payment_type            public.payment_type not null,
  status                  public.payment_status not null default 'initiated',
  razorpay_order_id       text unique,
  razorpay_payment_id     text unique,
  razorpay_signature      text,
  failure_reason          text,
  metadata                jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists payments_registration_idx on public.payments (registration_id);
create index if not exists payments_status_idx       on public.payments (status);

-- ---------------------------------------------------------------------
-- 7. REFERRALS  (created when a paid registration uses a code)
-- ---------------------------------------------------------------------
do $$ begin
  create type public.referral_status as enum ('pending', 'paid', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.referrals (
  id                    uuid primary key default gen_random_uuid(),
  referrer_student_id   uuid not null references public.students(id) on delete cascade,
  registration_id       uuid not null references public.registrations(id) on delete cascade,
  referred_name         text,
  referred_phone        text,
  amount_earned         integer not null default 0,
  status                public.referral_status not null default 'pending',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (registration_id)
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_student_id);
create index if not exists referrals_status_idx   on public.referrals (status);

-- ---------------------------------------------------------------------
-- 8. REFERRAL CLICKS  (anonymous landing-page tracking)
-- ---------------------------------------------------------------------
create table if not exists public.referral_clicks (
  id              uuid primary key default gen_random_uuid(),
  referral_code   text not null,
  user_agent      text,
  landing_path    text,
  ip_hash         text,
  created_at      timestamptz not null default now()
);
create index if not exists referral_clicks_code_idx on public.referral_clicks (referral_code, created_at desc);

-- ---------------------------------------------------------------------
-- 9. CONTACT SUBMISSIONS
-- ---------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  phone         text not null,
  email         text,
  message       text,
  interest      text not null default 'general',
  ip_hash       text,
  created_at    timestamptz not null default now()
);
create index if not exists contact_created_idx on public.contact_submissions (created_at desc);

-- ---------------------------------------------------------------------
-- 10. INCUBATOR APPLICATIONS
-- ---------------------------------------------------------------------
do $$ begin
  create type public.app_status as enum ('pending', 'approved', 'rejected', 'on_hold');
exception when duplicate_object then null; end $$;

create table if not exists public.incubator_applications (
  id                    uuid primary key default gen_random_uuid(),
  full_name             text not null,
  phone                 text not null,
  city                  text,
  startup_idea          text not null,
  why_this_business     text,
  current_experience    text,
  funding_requirement   text,
  skills                text,
  pitch_summary         text,
  status                public.app_status not null default 'pending',
  admin_notes           text,
  reviewed_at           timestamptz,
  created_at            timestamptz not null default now()
);
create index if not exists incubator_status_idx on public.incubator_applications (status, created_at desc);

-- ---------------------------------------------------------------------
-- 11. CERTIFICATES
-- ---------------------------------------------------------------------
create table if not exists public.certificates (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  program_id    text not null references public.programs(id),
  serial_no     text not null unique,
  issued_at     timestamptz not null default now(),
  pdf_path      text   -- Supabase Storage path
);

-- ---------------------------------------------------------------------
-- 12. updated_at triggers (DRY)
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

do $$
declare t text;
begin
  for t in select unnest(array['programs','students','registrations','payments','referrals'])
  loop
    execute format('drop trigger if exists trg_%I_touch on public.%I;', t, t);
    execute format('create trigger trg_%I_touch before update on public.%I for each row execute function public.touch_updated_at();', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 13. VIEWS
-- ---------------------------------------------------------------------
create or replace view public.referral_leaderboard as
  select
    s.id as student_id,
    s.full_name,
    s.referral_code,
    count(r.*) filter (where r.status = 'paid')   as paid_count,
    count(r.*)                                     as total_count,
    coalesce(sum(r.amount_earned) filter (where r.status = 'paid'), 0) as total_earned
  from public.students s
  left join public.referrals r on r.referrer_student_id = s.id
  group by s.id, s.full_name, s.referral_code;

-- ---------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.programs               enable row level security;
alter table public.batches                enable row level security;
alter table public.students               enable row level security;
alter table public.admins                 enable row level security;
alter table public.registrations          enable row level security;
alter table public.payments               enable row level security;
alter table public.referrals              enable row level security;
alter table public.referral_clicks        enable row level security;
alter table public.contact_submissions    enable row level security;
alter table public.incubator_applications enable row level security;
alter table public.certificates           enable row level security;

-- programs / batches: public read, admin write
drop policy if exists programs_read on public.programs;
create policy programs_read on public.programs for select using (active = true or public.is_admin(auth.uid()));
drop policy if exists programs_admin_write on public.programs;
create policy programs_admin_write on public.programs for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists batches_read on public.batches;
create policy batches_read on public.batches for select using (active = true or public.is_admin(auth.uid()));
drop policy if exists batches_admin_write on public.batches;
create policy batches_admin_write on public.batches for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- students: read/update own row; admin reads all
drop policy if exists students_self_read on public.students;
create policy students_self_read on public.students for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists students_self_insert on public.students;
create policy students_self_insert on public.students for insert
  with check (user_id = auth.uid());
drop policy if exists students_self_update on public.students;
create policy students_self_update on public.students for update
  using (user_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists students_admin_all on public.students;
create policy students_admin_all on public.students for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- admins: only admins read; only super_admin can mutate via service-role
drop policy if exists admins_read on public.admins;
create policy admins_read on public.admins for select using (public.is_admin(auth.uid()));

-- registrations: PUBLIC INSERT (lead capture before auth) + self/admin read
drop policy if exists regs_public_insert on public.registrations;
create policy regs_public_insert on public.registrations for insert
  with check (true);
drop policy if exists regs_self_read on public.registrations;
create policy regs_self_read on public.registrations for select using (
  public.is_admin(auth.uid())
  or student_id in (select id from public.students where user_id = auth.uid())
);
drop policy if exists regs_admin_update on public.registrations;
create policy regs_admin_update on public.registrations for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- payments: NEVER from anon; only Edge Function (service-role) writes; user/admin reads.
drop policy if exists pays_user_read on public.payments;
create policy pays_user_read on public.payments for select using (
  public.is_admin(auth.uid())
  or registration_id in (
    select r.id from public.registrations r
    join public.students s on s.id = r.student_id
    where s.user_id = auth.uid()
  )
);
-- (no insert/update policy — service-role bypasses RLS)

-- referrals: referrer reads own; admin reads all
drop policy if exists refs_self_read on public.referrals;
create policy refs_self_read on public.referrals for select using (
  public.is_admin(auth.uid())
  or referrer_student_id in (select id from public.students where user_id = auth.uid())
);

-- referral_clicks: public insert (anon tracking); admin read
drop policy if exists rclicks_public_insert on public.referral_clicks;
create policy rclicks_public_insert on public.referral_clicks for insert with check (true);
drop policy if exists rclicks_admin_read on public.referral_clicks;
create policy rclicks_admin_read on public.referral_clicks for select using (public.is_admin(auth.uid()));

-- contact_submissions: public insert; admin read
drop policy if exists contact_public_insert on public.contact_submissions;
create policy contact_public_insert on public.contact_submissions for insert with check (true);
drop policy if exists contact_admin_read on public.contact_submissions;
create policy contact_admin_read on public.contact_submissions for select using (public.is_admin(auth.uid()));

-- incubator: public insert; admin read+update
drop policy if exists inc_public_insert on public.incubator_applications;
create policy inc_public_insert on public.incubator_applications for insert with check (true);
drop policy if exists inc_admin_all on public.incubator_applications;
create policy inc_admin_all on public.incubator_applications for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- certificates: student reads own; admin all
drop policy if exists cert_self_read on public.certificates;
create policy cert_self_read on public.certificates for select using (
  public.is_admin(auth.uid())
  or student_id in (select id from public.students where user_id = auth.uid())
);
drop policy if exists cert_admin_all on public.certificates;
create policy cert_admin_all on public.certificates for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- =====================================================================
-- TIP — first admin bootstrap:
--   1. Sign up a user via Supabase Auth (email/password)
--   2. Copy the user's UUID from auth.users
--   3. INSERT INTO public.admins (user_id, full_name, role)
--        VALUES ('<uuid>', 'Founder', 'super_admin');
-- =====================================================================

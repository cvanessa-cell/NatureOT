-- Texas Nature OT Lead Gen — initial schema
-- Run in Supabase SQL Editor or via CLI.

create extension if not exists "pgcrypto";

-- Staff profiles (links Supabase Auth users to roles)
create table if not exists staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_age_range text not null,
  city_or_zip text not null,
  main_concern text not null,
  consent_marketing boolean not null default false,
  consent_privacy_ack boolean not null default false,
  consent_at timestamptz,
  consent_source text not null default 'lead_form',
  consent_ip text,
  unsubscribe_token text not null default encode(gen_random_bytes(16), 'hex'),
  unsubscribed_at timestamptz,
  nurture_sequence_id uuid,
  nurture_current_step int not null default 0,
  nurture_next_send_at timestamptz,
  nurture_stopped boolean not null default false,
  nurture_stopped_reason text,
  reminder_48h_at timestamptz,
  reminder_48h_sent_at timestamptz,
  primary_result_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_email on leads (parent_email);
create index if not exists idx_leads_nurture_next on leads (nurture_next_send_at) where nurture_stopped = false;
create index if not exists idx_leads_reminder on leads (reminder_48h_at) where reminder_48h_sent_at is null and nurture_stopped = false;

create table if not exists quiz_answers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  session_id text,
  question_id text not null,
  category text not null,
  answer_value int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_answers_lead on quiz_answers (lead_id);
create index if not exists idx_quiz_answers_session on quiz_answers (session_id);

create table if not exists quiz_results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  session_id text,
  primary_category text not null,
  scores jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_results_lead on quiz_results (lead_id);

create table if not exists email_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_slug text,
  steps jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column email_sequences.steps is 'Array of { dayOffset: number, subject: string, bodyHtml: string }';

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  resend_email_id text,
  event_type text not null,
  step_index int,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_email_events_lead on email_events (lead_id);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  provider text not null check (provider in ('calcom', 'calendly', 'manual')),
  external_id text,
  booked_at timestamptz not null default now(),
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_lead on bookings (lead_id);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  code text not null unique,
  referred_by text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb default '{}',
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on audit_logs (created_at desc);

alter table leads
  add constraint fk_leads_nurture_sequence
  foreign key (nurture_sequence_id) references email_sequences (id) on delete set null;

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated on leads;
create trigger leads_updated before update on leads
  for each row execute function set_updated_at();

drop trigger if exists email_sequences_updated on email_sequences;
create trigger email_sequences_updated before update on email_sequences
  for each row execute function set_updated_at();

-- RLS
alter table staff_profiles enable row level security;
alter table leads enable row level security;
alter table quiz_answers enable row level security;
alter table quiz_results enable row level security;
alter table email_sequences enable row level security;
alter table email_events enable row level security;
alter table bookings enable row level security;
alter table referrals enable row level security;
alter table audit_logs enable row level security;

-- Admins (via staff_profiles) can read/write marketing tables
create policy "staff_select_own_profile" on staff_profiles
  for select to authenticated using (user_id = auth.uid());

create policy "admin_all_leads" on leads
  for all to authenticated
  using (
    exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin')
  )
  with check (
    exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin')
  );

create policy "admin_quiz_answers" on quiz_answers
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_quiz_results" on quiz_results
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_email_sequences" on email_sequences
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_email_events" on email_events
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_bookings" on bookings
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_referrals" on referrals
  for all to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'))
  with check (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

create policy "admin_audit_logs" on audit_logs
  for select to authenticated
  using (exists (select 1 from staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin'));

-- Service role (Next.js server) bypasses RLS — public routes use API with service role key.

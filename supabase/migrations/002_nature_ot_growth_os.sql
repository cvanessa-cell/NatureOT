-- Nature OT Growth OS — extended schema, renames, RLS
-- Run after 001_initial_schema.sql

-- ---------------------------------------------------------------------------
-- 0) Drop policies that reference legacy table names (before renames)
-- ---------------------------------------------------------------------------

drop policy if exists "staff_select_own_profile" on staff_profiles;
drop policy if exists "admin_all_leads" on leads;
drop policy if exists "admin_quiz_answers" on quiz_answers;
drop policy if exists "admin_quiz_results" on quiz_results;
drop policy if exists "admin_email_sequences" on email_sequences;
drop policy if exists "admin_email_events" on email_events;
drop policy if exists "admin_bookings" on bookings;
drop policy if exists "admin_referrals" on referrals;
drop policy if exists "admin_audit_logs" on audit_logs;

-- ---------------------------------------------------------------------------
-- 1) Rename legacy tables for clarity (campaign codes vs partner referrals)
-- ---------------------------------------------------------------------------

alter table if exists referrals rename to campaign_codes;

-- ---------------------------------------------------------------------------
-- 2) Staff profiles → profiles with Owner / Admin / Staff
-- ---------------------------------------------------------------------------

alter table if exists staff_profiles rename to profiles;

alter table profiles drop constraint if exists staff_profiles_role_check;
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles
  add constraint profiles_role_check
  check (role in ('owner', 'admin', 'staff'));

-- ---------------------------------------------------------------------------
-- 3) Helper: privileged roles (Owner + Admin) — used in RLS policies
-- ---------------------------------------------------------------------------

create or replace function public.is_privileged()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_staff_level()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.role in ('owner', 'admin', 'staff')
  );
$$;

-- ---------------------------------------------------------------------------
-- 4) Core operational tables
-- ---------------------------------------------------------------------------

create table if not exists waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_age_range text not null,
  city_or_zip text not null,
  preferred_schedule text,
  interest_areas text[] default '{}',
  general_notes text,
  status text not null default 'active' check (status in ('active', 'paused', 'matched', 'withdrawn')),
  consent_marketing boolean not null default false,
  consent_waitlist boolean not null default false,
  consent_language_version text,
  consent_source_page text,
  consent_ip text,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  airtable_record_id text,
  last_airtable_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_waitlist_email on waitlist_entries (parent_email);
create index if not exists idx_waitlist_status on waitlist_entries (status);
create index if not exists idx_waitlist_age on waitlist_entries (child_age_range);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  age_range_label text,
  schedule_summary text,
  capacity int not null default 8,
  enrolled_count int not null default 0,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'full', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists group_matches (
  id uuid primary key default gen_random_uuid(),
  waitlist_entry_id uuid not null references waitlist_entries (id) on delete cascade,
  group_id uuid not null references groups (id) on delete cascade,
  match_score numeric,
  status text not null default 'suggested' check (status in ('suggested', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  unique (waitlist_entry_id, group_id)
);

create table if not exists group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  waitlist_entry_id uuid references waitlist_entries (id) on delete set null,
  lead_id uuid references leads (id) on delete set null,
  email text not null,
  invite_token text not null default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int not null default 20,
  location_summary text,
  description_public text,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workshop_registrations (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops (id) on delete cascade,
  lead_id uuid references leads (id) on delete set null,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_age_range text not null,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled', 'attended', 'no_show')),
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,
  post_event_follow_up_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wr_workshop on workshop_registrations (workshop_id);
create index if not exists idx_wr_email on workshop_registrations (parent_email);

create table if not exists referral_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text,
  phone text,
  status text not null default 'prospect' check (status in ('prospect', 'active', 'paused', 'archived')),
  source_tags text[] default '{}',
  notes_internal text,
  referral_count int not null default 0,
  last_contacted_at timestamptz,
  airtable_record_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referral_interactions (
  id uuid primary key default gen_random_uuid(),
  referral_partner_id uuid not null references referral_partners (id) on delete cascade,
  interaction_type text not null,
  summary text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create table if not exists partner_referrals (
  id uuid primary key default gen_random_uuid(),
  referral_partner_id uuid references referral_partners (id) on delete set null,
  lead_id uuid references leads (id) on delete set null,
  waitlist_entry_id uuid references waitlist_entries (id) on delete set null,
  source_detail text,
  referred_at timestamptz not null default now()
);

create index if not exists idx_partner_referrals_partner on partner_referrals (referral_partner_id);

create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subject_template text not null,
  body_html_template text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sms_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  waitlist_entry_id uuid references waitlist_entries (id) on delete set null,
  direction text not null check (direction in ('outbound', 'inbound')),
  provider_message_id text,
  event_type text not null,
  body_preview text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create table if not exists content_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  channel text,
  status text not null default 'idea'
    check (status in ('idea', 'draft', 'needs_review', 'approved', 'scheduled', 'published')),
  scheduled_for timestamptz,
  published_at timestamptz,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  content_post_id uuid references content_posts (id) on delete set null,
  week_label text,
  campaign_theme text,
  status text not null default 'planned',
  scheduled_for timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  city text not null,
  state text not null default 'TX',
  title text not null,
  body_md text,
  meta_description text,
  status text not null default 'planned'
    check (status in ('planned', 'generated', 'reviewed', 'approved', 'published')),
  generated_at timestamptz,
  published_at timestamptz,
  disclaimer_block text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists feedback_surveys (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  workshop_id uuid references workshops (id) on delete set null,
  group_id uuid references groups (id) on delete set null,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists authorizations (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('testimonial', 'photo', 'video', 'client_story')),
  lead_id uuid references leads (id) on delete set null,
  parent_email text,
  consent_text_version text not null,
  signed_at timestamptz not null default now(),
  ip text,
  admin_reviewed_at timestamptz,
  admin_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  quote text not null,
  display_label text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'archived')),
  authorization_id uuid references authorizations (id) on delete set null,
  publish_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  waitlist_entry_id uuid references waitlist_entries (id) on delete set null,
  consent_type text not null,
  language_snippet text,
  source_page text not null,
  email text,
  ip text,
  created_at timestamptz not null default now()
);

create table if not exists airtable_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  direction text not null check (direction in ('push', 'pull', 'bidirectional')),
  dry_run boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  payload jsonb default '{}',
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  initiated_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists airtable_sync_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references airtable_sync_jobs (id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  direction text not null,
  airtable_record_id text,
  payload_snapshot jsonb,
  success boolean not null default true,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_airtable_sync_events_job on airtable_sync_events (job_id);

create table if not exists agent_airtable_actions (
  id uuid primary key default gen_random_uuid(),
  command_key text not null,
  preview_payload jsonb not null,
  proposed_writes jsonb,
  status text not null default 'preview'
    check (status in ('preview', 'approved', 'executed', 'rejected', 'failed')),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  executed_at timestamptz,
  result_payload jsonb,
  error_message text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Leads: optional marketing source
alter table leads add column if not exists lead_source text;
alter table leads add column if not exists utm_campaign text;

-- Triggers for updated_at
drop trigger if exists waitlist_entries_updated on waitlist_entries;
create trigger waitlist_entries_updated before update on waitlist_entries
  for each row execute function set_updated_at();

drop trigger if exists groups_updated on groups;
create trigger groups_updated before update on groups
  for each row execute function set_updated_at();

drop trigger if exists workshops_updated on workshops;
create trigger workshops_updated before update on workshops
  for each row execute function set_updated_at();

drop trigger if exists workshop_registrations_updated on workshop_registrations;
create trigger workshop_registrations_updated before update on workshop_registrations
  for each row execute function set_updated_at();

drop trigger if exists referral_partners_updated on referral_partners;
create trigger referral_partners_updated before update on referral_partners
  for each row execute function set_updated_at();

drop trigger if exists email_templates_updated on email_templates;
create trigger email_templates_updated before update on email_templates
  for each row execute function set_updated_at();

drop trigger if exists content_posts_updated on content_posts;
create trigger content_posts_updated before update on content_posts
  for each row execute function set_updated_at();

drop trigger if exists landing_pages_updated on landing_pages;
create trigger landing_pages_updated before update on landing_pages
  for each row execute function set_updated_at();

drop trigger if exists testimonials_updated on testimonials;
create trigger testimonials_updated before update on testimonials
  for each row execute function set_updated_at();

-- campaign_codes RLS (already enabled in 001)
alter table campaign_codes enable row level security;

-- ---------------------------------------------------------------------------
-- 5) RLS enable + policies (privileged = owner/admin, staff = read most)
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table waitlist_entries enable row level security;
alter table groups enable row level security;
alter table group_matches enable row level security;
alter table group_invitations enable row level security;
alter table workshops enable row level security;
alter table workshop_registrations enable row level security;
alter table referral_partners enable row level security;
alter table referral_interactions enable row level security;
alter table partner_referrals enable row level security;
alter table email_templates enable row level security;
alter table sms_events enable row level security;
alter table content_posts enable row level security;
alter table content_calendar enable row level security;
alter table landing_pages enable row level security;
alter table feedback_surveys enable row level security;
alter table authorizations enable row level security;
alter table testimonials enable row level security;
alter table consent_logs enable row level security;
alter table airtable_sync_jobs enable row level security;
alter table airtable_sync_events enable row level security;
alter table agent_airtable_actions enable row level security;

-- Profiles: users see self
create policy "profiles_select_own" on profiles
  for select to authenticated using (user_id = auth.uid());

create policy "profiles_update_own" on profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Privileged full access policies
create policy "privileged_all_leads" on leads
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_leads" on leads
  for select to authenticated using (public.is_staff_level());

create policy "privileged_waitlist" on waitlist_entries
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_waitlist" on waitlist_entries
  for select to authenticated using (public.is_staff_level());

create policy "privileged_groups" on groups
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_groups" on groups
  for select to authenticated using (public.is_staff_level());

create policy "privileged_group_matches" on group_matches
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_group_matches" on group_matches
  for select to authenticated using (public.is_staff_level());

create policy "privileged_group_invites" on group_invitations
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_group_invites" on group_invitations
  for select to authenticated using (public.is_staff_level());

create policy "privileged_workshops" on workshops
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_workshops" on workshops
  for select to authenticated using (public.is_staff_level());

create policy "privileged_workshop_reg" on workshop_registrations
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_workshop_reg" on workshop_registrations
  for select to authenticated using (public.is_staff_level());

create policy "privileged_ref_partners" on referral_partners
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_ref_partners" on referral_partners
  for select to authenticated using (public.is_staff_level());

create policy "privileged_ref_interactions" on referral_interactions
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_ref_interactions" on referral_interactions
  for select to authenticated using (public.is_staff_level());

create policy "privileged_partner_referrals" on partner_referrals
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_partner_referrals" on partner_referrals
  for select to authenticated using (public.is_staff_level());

create policy "privileged_quiz_answers" on quiz_answers
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_quiz_answers" on quiz_answers
  for select to authenticated using (public.is_staff_level());

create policy "privileged_quiz_results" on quiz_results
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_quiz_results" on quiz_results
  for select to authenticated using (public.is_staff_level());

create policy "privileged_email_seq" on email_sequences
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_email_seq" on email_sequences
  for select to authenticated using (public.is_staff_level());

create policy "privileged_email_events" on email_events
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_email_events" on email_events
  for select to authenticated using (public.is_staff_level());

create policy "privileged_email_templates" on email_templates
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_email_templates" on email_templates
  for select to authenticated using (public.is_staff_level());

create policy "privileged_bookings" on bookings
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_bookings" on bookings
  for select to authenticated using (public.is_staff_level());

create policy "privileged_campaign_codes" on campaign_codes
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_campaign_codes" on campaign_codes
  for select to authenticated using (public.is_staff_level());

create policy "privileged_sms_events" on sms_events
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_sms_events" on sms_events
  for select to authenticated using (public.is_staff_level());

create policy "privileged_content_posts" on content_posts
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_content_posts" on content_posts
  for select to authenticated using (public.is_staff_level());

create policy "privileged_content_cal" on content_calendar
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_content_cal" on content_calendar
  for select to authenticated using (public.is_staff_level());

create policy "privileged_landing_pages" on landing_pages
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_landing_pages" on landing_pages
  for select to authenticated using (public.is_staff_level());

create policy "privileged_feedback" on feedback_surveys
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_feedback" on feedback_surveys
  for select to authenticated using (public.is_staff_level());

create policy "privileged_authorizations" on authorizations
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_authorizations" on authorizations
  for select to authenticated using (public.is_staff_level());

create policy "privileged_testimonials" on testimonials
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_testimonials" on testimonials
  for select to authenticated using (public.is_staff_level());

create policy "privileged_consent_logs" on consent_logs
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_consent_logs" on consent_logs
  for select to authenticated using (public.is_staff_level());

create policy "privileged_audit_logs" on audit_logs
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_audit_logs" on audit_logs
  for select to authenticated using (public.is_staff_level());

create policy "privileged_sync_jobs" on airtable_sync_jobs
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_sync_jobs" on airtable_sync_jobs
  for select to authenticated using (public.is_staff_level());

create policy "privileged_sync_events" on airtable_sync_events
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_sync_events" on airtable_sync_events
  for select to authenticated using (public.is_staff_level());

create policy "privileged_agent_actions" on agent_airtable_actions
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_agent_actions" on agent_airtable_actions
  for select to authenticated using (public.is_staff_level());

-- Owner can manage all profiles (optional — usually done via service role)
create policy "privileged_profiles" on profiles
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

comment on table waitlist_entries is 'Non-clinical waitlist. No diagnosis, full DOB, or medical records.';
comment on table airtable_sync_jobs is 'Background-ready sync jobs; MVP runs synchronously in API routes.';
comment on table agent_airtable_actions is 'Agent_Airtable: preview/approve before Airtable writes.';

grant execute on function public.is_privileged() to authenticated;
grant execute on function public.is_staff_level() to authenticated;

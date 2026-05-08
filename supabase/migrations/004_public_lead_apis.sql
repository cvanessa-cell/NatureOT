-- Public lead APIs (workshop, referral inquiry, parent guide) — additive schema

-- ----------------------------------------------------------------------------
-- leads: nullable fields for lightweight marketing captures; optional split name
-- ----------------------------------------------------------------------------

alter table leads alter column child_age_range drop not null;
alter table leads alter column main_concern drop not null;

alter table leads add column if not exists parent_first_name text;
alter table leads add column if not exists parent_last_name text;
alter table leads add column if not exists form_type text;

comment on column leads.form_type is 'marketing capture path e.g. workshop_registration, parent_guide, quiz_lead_form';

-- ----------------------------------------------------------------------------
-- workshop_registrations: allow slug-based signups without a workshops row
-- ----------------------------------------------------------------------------

alter table workshop_registrations alter column workshop_id drop not null;
alter table workshop_registrations alter column child_age_range drop not null;

alter table workshop_registrations add column if not exists workshop_slug text;
alter table workshop_registrations add column if not exists workshop_title text;

comment on column workshop_registrations.workshop_slug is 'Public form theme id when no workshops.id yet';
comment on column workshop_registrations.workshop_title is 'Human-readable title for ops sync';

create index if not exists idx_wr_slug on workshop_registrations (workshop_slug);

-- ----------------------------------------------------------------------------
-- referral inquiries (incoming partner/contact form — not curated referral_partners)
-- ----------------------------------------------------------------------------

create table if not exists referral_inquiries (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  partner_type text,
  city text,
  message text,
  consent_contact boolean not null default false,
  status text not null default 'new' check (status in ('new', 'contacted', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ref_inquiries_email on referral_inquiries (email);
create index if not exists idx_ref_inquiries_created on referral_inquiries (created_at desc);

drop trigger if exists referral_inquiries_updated on referral_inquiries;
create trigger referral_inquiries_updated before update on referral_inquiries
  for each row execute function set_updated_at();

alter table referral_inquiries enable row level security;

create policy "privileged_ref_inquiries" on referral_inquiries
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_ref_inquiries" on referral_inquiries
  for select to authenticated using (public.is_staff_level());

-- ----------------------------------------------------------------------------
-- Parent guide captures (marketing; links to operational lead row when present)
-- ----------------------------------------------------------------------------

create table if not exists parent_guide_leads (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  parent_first_name text,
  parent_email text not null,
  city text,
  consent_to_contact boolean not null default false,
  guide_name text not null default '10 Outdoor Sensory Activities for Texas Kids',
  created_at timestamptz not null default now()
);

create index if not exists idx_parent_guide_email on parent_guide_leads (parent_email);
create index if not exists idx_parent_guide_lead on parent_guide_leads (lead_id);

alter table parent_guide_leads enable row level security;

create policy "privileged_parent_guide" on parent_guide_leads
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_parent_guide" on parent_guide_leads
  for select to authenticated using (public.is_staff_level());

-- ----------------------------------------------------------------------------
-- email_events: richer operational tracking (additive)
-- ----------------------------------------------------------------------------

alter table email_events add column if not exists template_key text;
alter table email_events add column if not exists provider text default 'resend';
alter table email_events add column if not exists dispatch_status text;
alter table email_events add column if not exists related_table text;
alter table email_events add column if not exists related_record_id uuid;
alter table email_events add column if not exists error_message text;
alter table email_events add column if not exists sent_at timestamptz;

comment on column email_events.dispatch_status is 'queued | sent | dry_run | failed | skipped_no_provider';

-- ----------------------------------------------------------------------------
-- airtable_sync_jobs: pointers for queue worker (additive; payload still holds detail)
-- ----------------------------------------------------------------------------

alter table airtable_sync_jobs add column if not exists source_table text;
alter table airtable_sync_jobs add column if not exists source_record_id uuid;
alter table airtable_sync_jobs add column if not exists target_airtable_table text;

-- ----------------------------------------------------------------------------
-- Zapier catalog keys for new flows (best-effort seeds)
-- ----------------------------------------------------------------------------

insert into zapier_automations (
  zap_key,
  zap_name,
  trigger_app,
  trigger_event,
  action_app,
  action_event,
  related_module,
  status,
  requires_approval,
  sends_external_message,
  handles_parent_child_data,
  phi_risk_level
)
values (
  'referral_inquiry',
  'Referral / partner inquiry',
  'Nature OT Growth OS',
  'POST /api/referral-inquiry',
  'Zapier',
  'CRM task',
  'Referrals',
  'planned',
  false,
  true,
  false,
  'low'
), (
  'parent_guide_lead',
  'Parent guide download capture',
  'Nature OT Growth OS',
  'POST /api/parent-guide-lead',
  'Zapier',
  'Lead enrichment',
  'Leads',
  'planned',
  false,
  true,
  true,
  'low'
)
on conflict (zap_key) do nothing;

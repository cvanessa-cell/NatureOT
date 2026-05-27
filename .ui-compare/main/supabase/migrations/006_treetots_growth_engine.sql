-- TreeTots Growth Engine (marketing ops) — additive schema
-- Extends existing Nature OT Growth OS schema; no second database.
-- Non-clinical marketing + operations only. Do not store diagnosis/medical history here.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organizations (market map / partner CRM)
-- ---------------------------------------------------------------------------

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  website text,
  phone text,
  email text,
  facebook_url text,
  instagram_url text,
  address text,
  city text,
  state text not null default 'TX',
  zip text,
  county text,
  service_area text,
  relevance_score int not null default 50 check (relevance_score between 1 and 100),
  proximity_score int not null default 50 check (proximity_score between 1 and 100),
  referral_likelihood_score int not null default 50 check (referral_likelihood_score between 1 and 100),
  relationship_priority_score int not null default 50 check (relationship_priority_score between 1 and 100),
  priority_score numeric generated always as (
    (relevance_score * 0.35) +
    (proximity_score * 0.20) +
    (referral_likelihood_score * 0.25) +
    (relationship_priority_score * 0.20)
  ) stored,
  status text not null default 'not_researched'
    check (status in (
      'not_researched',
      'researched',
      'ready_for_outreach',
      'first_message_sent',
      'follow_up_1_due',
      'follow_up_1_sent',
      'follow_up_2_due',
      'follow_up_2_sent',
      'meeting_requested',
      'meeting_booked',
      'referral_sheet_sent',
      'partner_interested',
      'active_referral_partner',
      'inactive_no_response',
      'do_not_contact'
    )),
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  permission_to_contact boolean not null default false,
  permission_to_post_share boolean not null default false,
  referral_sheet_sent boolean not null default false,
  workshop_pitch_sent boolean not null default false,
  response_status text,
  referral_count int not null default 0,
  lead_count int not null default 0,
  estimated_value numeric,
  compliance_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_org_city on organizations (city);
create index if not exists idx_org_category on organizations (category);
create index if not exists idx_org_status on organizations (status);
create index if not exists idx_org_priority on organizations (priority_score desc);
create index if not exists idx_org_next_follow_up on organizations (next_follow_up_at) where next_follow_up_at is not null;

drop trigger if exists organizations_updated on organizations;
create trigger organizations_updated before update on organizations
  for each row execute function set_updated_at();

alter table organizations enable row level security;
create policy "privileged_organizations" on organizations
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_organizations" on organizations
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Contacts
-- ---------------------------------------------------------------------------

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  first_name text,
  last_name text,
  role text,
  email text,
  phone text,
  preferred_channel text check (preferred_channel in ('email', 'phone', 'sms', 'instagram', 'facebook', 'in_person', 'other')),
  permission_status text not null default 'unknown' check (permission_status in ('unknown', 'ok_to_contact', 'do_not_contact')),
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_org on contacts (organization_id);
create index if not exists idx_contacts_email on contacts (email);
create index if not exists idx_contacts_next_follow_up on contacts (next_follow_up_at) where next_follow_up_at is not null;

drop trigger if exists contacts_updated on contacts;
create trigger contacts_updated before update on contacts
  for each row execute function set_updated_at();

alter table contacts enable row level security;
create policy "privileged_contacts" on contacts
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_contacts" on contacts
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Campaigns + templates
-- ---------------------------------------------------------------------------

create table if not exists campaign_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  default_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table campaign_templates enable row level security;
create policy "privileged_campaign_templates" on campaign_templates
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_campaign_templates" on campaign_templates
  for select to authenticated using (public.is_staff_level());

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references campaign_templates (id) on delete set null,
  name text not null,
  type text not null,
  audience text,
  cities text[] default '{}',
  start_date date,
  end_date date,
  owner text,
  goal text,
  benchmark text,
  budget numeric,
  channel text,
  cta text,
  landing_page_id uuid references landing_pages (id) on delete set null,
  lead_magnet text,
  automation_workflow text,
  target_leads int,
  actual_leads int not null default 0,
  target_calls int,
  actual_calls int not null default 0,
  target_referrals int,
  actual_referrals int not null default 0,
  target_enrollments int,
  actual_enrollments int not null default 0,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'paused', 'completed', 'archived')),
  campaign_score numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_status on campaigns (status);
create index if not exists idx_campaigns_type on campaigns (type);
create index if not exists idx_campaigns_start on campaigns (start_date);

drop trigger if exists campaigns_updated on campaigns;
create trigger campaigns_updated before update on campaigns
  for each row execute function set_updated_at();

alter table campaigns enable row level security;
create policy "privileged_campaigns" on campaigns
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_campaigns" on campaigns
  for select to authenticated using (public.is_staff_level());

create table if not exists campaign_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  asset_type text not null,
  title text,
  url text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'ready', 'published', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists campaign_assets_updated on campaign_assets;
create trigger campaign_assets_updated before update on campaign_assets
  for each row execute function set_updated_at();

alter table campaign_assets enable row level security;
create policy "privileged_campaign_assets" on campaign_assets
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_campaign_assets" on campaign_assets
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Content assets (Content Studio) + compliance reviews
-- ---------------------------------------------------------------------------

create table if not exists content_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns (id) on delete set null,
  title text not null,
  asset_type text not null,
  channel text,
  audience text,
  city text,
  body text,
  status text not null default 'draft'
    check (status in ('idea','draft','needs_review','compliance_review','approved','scheduled','published','archived')),
  compliance_status text not null default 'needs_review'
    check (compliance_status in ('approved','needs_review','high_risk','do_not_use')),
  scheduled_date date,
  published_date date,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists content_assets_updated on content_assets;
create trigger content_assets_updated before update on content_assets
  for each row execute function set_updated_at();

alter table content_assets enable row level security;
create policy "privileged_content_assets" on content_assets
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_content_assets" on content_assets
  for select to authenticated using (public.is_staff_level());

create table if not exists compliance_reviews (
  id uuid primary key default gen_random_uuid(),
  content_asset_id uuid references content_assets (id) on delete set null,
  review_type text not null default 'marketing_copy',
  risk_level text not null default 'needs_review'
    check (risk_level in ('approved','needs_review','high_risk','do_not_use')),
  flagged_terms text[] default '{}',
  suggestions text[] default '{}',
  approved boolean not null default false,
  reviewer_notes text,
  created_at timestamptz not null default now()
);

alter table compliance_reviews enable row level security;
create policy "privileged_compliance_reviews" on compliance_reviews
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_compliance_reviews" on compliance_reviews
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Outreach (manual approval by default)
-- ---------------------------------------------------------------------------

create table if not exists outreach_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  campaign_id uuid references campaigns (id) on delete set null,
  channel text not null,
  subject text,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft','queued','sent','cancelled')),
  approval_required boolean not null default true,
  approved_at timestamptz,
  sent_at timestamptz,
  provider text,
  provider_message_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists outreach_messages_updated on outreach_messages;
create trigger outreach_messages_updated before update on outreach_messages
  for each row execute function set_updated_at();

alter table outreach_messages enable row level security;
create policy "privileged_outreach_messages" on outreach_messages
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_outreach_messages" on outreach_messages
  for select to authenticated using (public.is_staff_level());

create table if not exists outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) on delete set null,
  contact_id uuid references contacts (id) on delete set null,
  campaign_id uuid references campaigns (id) on delete set null,
  task_type text not null,
  channel text,
  subject text,
  body text,
  due_date date,
  completed_at timestamptz,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','waiting','needs_review','complete','blocked','missed','deferred')),
  approval_required boolean not null default true,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists outreach_tasks_updated on outreach_tasks;
create trigger outreach_tasks_updated before update on outreach_tasks
  for each row execute function set_updated_at();

alter table outreach_tasks enable row level security;
create policy "privileged_outreach_tasks" on outreach_tasks
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_outreach_tasks" on outreach_tasks
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Attribution events (privacy-safe generic events only)
-- ---------------------------------------------------------------------------

create table if not exists utm_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  event_name text not null,
  path text,
  lead_id uuid references leads (id) on delete set null,
  campaign_id uuid references campaigns (id) on delete set null,
  organization_id uuid references organizations (id) on delete set null,
  city text,
  audience_segment text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_utm_events_occurred on utm_events (occurred_at desc);
create index if not exists idx_utm_events_campaign on utm_events (campaign_id);

alter table utm_events enable row level security;
create policy "privileged_utm_events" on utm_events
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_utm_events" on utm_events
  for select to authenticated using (public.is_staff_level());

comment on table utm_events is 'Generic analytics events. Never store child names, diagnosis terms, or detailed notes.';

-- ---------------------------------------------------------------------------
-- Goals, benchmarks, accountability (ops)
-- ---------------------------------------------------------------------------

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  period text not null check (period in ('weekly','monthly','quarterly')),
  metric text not null,
  target_value numeric not null,
  actual_value numeric not null default 0,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('active','at_risk','behind','met','closed')),
  owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists goals_updated on goals;
create trigger goals_updated before update on goals
  for each row execute function set_updated_at();

alter table goals enable row level security;
create policy "privileged_goals" on goals
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_goals" on goals
  for select to authenticated using (public.is_staff_level());

create table if not exists benchmarks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns (id) on delete cascade,
  name text not null,
  target_value numeric,
  due_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table benchmarks enable row level security;
create policy "privileged_benchmarks" on benchmarks
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_benchmarks" on benchmarks
  for select to authenticated using (public.is_staff_level());

create table if not exists accountability_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  campaign_id uuid references campaigns (id) on delete set null,
  due_date date,
  completed_at timestamptz,
  owner text,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','waiting','needs_review','complete','blocked','missed','deferred')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  blocker text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists accountability_tasks_updated on accountability_tasks;
create trigger accountability_tasks_updated before update on accountability_tasks
  for each row execute function set_updated_at();

alter table accountability_tasks enable row level security;
create policy "privileged_accountability_tasks" on accountability_tasks
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_accountability_tasks" on accountability_tasks
  for select to authenticated using (public.is_staff_level());

create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  summary text,
  answers jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table weekly_reviews enable row level security;
create policy "privileged_weekly_reviews" on weekly_reviews
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_weekly_reviews" on weekly_reviews
  for select to authenticated using (public.is_staff_level());

create table if not exists monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  month_start date not null,
  summary text,
  answers jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table monthly_reviews enable row level security;
create policy "privileged_monthly_reviews" on monthly_reviews
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
create policy "staff_select_monthly_reviews" on monthly_reviews
  for select to authenticated using (public.is_staff_level());

-- ---------------------------------------------------------------------------
-- Seed: campaign templates (IDs resolved at runtime by key)
-- ---------------------------------------------------------------------------

insert into campaign_templates (key, name, description, default_config)
values
  ('aba_referral_partner', 'ABA Referral Partner Campaign', 'Build referral relationships with ABA organizations in DFW.', '{"audience":"ABA providers","type":"provider_referral","channel":"email"}'),
  ('homeschool', 'Homeschool Group Campaign', 'Enroll families into weekday nature-based homeschool developmental groups.', '{"audience":"homeschool families","type":"homeschool_enrollment","channel":"email"}'),
  ('pediatric_chiropractic', 'Pediatric Chiropractic Referral Campaign', 'Build referral relationships with pediatric/family chiropractic offices.', '{"audience":"chiropractors","type":"provider_referral","channel":"email"}'),
  ('pediatrician', 'Pediatrician / Developmental Provider Campaign', 'Build referral relationships with pediatricians and development providers.', '{"audience":"pediatricians","type":"provider_referral","channel":"email"}'),
  ('slp_pt_cross_referral', 'SLP / PT Cross-Referral Campaign', 'Cross-referrals with SLP and PT clinics.', '{"audience":"SLP/PT","type":"provider_referral","channel":"email"}'),
  ('library_workshop', 'Library + Parent Workshop Campaign', 'Host parent-friendly workshops via libraries.', '{"audience":"parents","type":"workshop_registration","channel":"email"}'),
  ('parks_rec_workshop', 'Parks + Recreation Community Workshop Campaign', 'Host workshops with parks & rec departments.', '{"audience":"parents","type":"workshop_registration","channel":"email"}'),
  ('nature_school', 'Nature School / Preschool Partnership Campaign', 'Partnerships with nature schools/preschools.', '{"audience":"schools","type":"provider_referral","channel":"email"}'),
  ('google_search_ads', 'Google Search Ads Campaign', 'High-intent parent searches for pediatric OT support.', '{"audience":"parents","type":"paid_search","channel":"google_ads"}'),
  ('meta_awareness', 'Facebook / Instagram Awareness Campaign', 'Educational awareness content targeting adults in DFW.', '{"audience":"parents","type":"social_awareness","channel":"meta"}'),
  ('parent_guide', 'Parent Guide Lead Magnet Campaign', 'Parent guide download + nurture sequence.', '{"audience":"parents","type":"lead_magnet","channel":"email"}'),
  ('summer_camp', 'Summer Camp / Seasonal Group Launch Campaign', 'Launch seasonal camps and groups.', '{"audience":"parents","type":"seasonal_launch","channel":"mixed"}'),
  ('local_seo_gbp', 'Local SEO + Google Business Profile Campaign', 'Service pages + GBP task sprint.', '{"audience":"parents","type":"local_seo","channel":"organic"}'),
  ('review_referral_flywheel', 'Review + Referral Flywheel Campaign', 'Feedback first → ethical review request → referral nurture.', '{"audience":"parents","type":"reviews","channel":"email"}'),
  ('event_booth', 'Family Event Booth Campaign', 'Event booth + follow-up funnel.', '{"audience":"parents","type":"community_event","channel":"in_person"}')
on conflict (key) do nothing;


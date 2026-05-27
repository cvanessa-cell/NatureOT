create extension if not exists "pgcrypto";

create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft','active','paused','completed','archived')),
  campaign_type text not null default 'other' check (campaign_type in ('parent_guide','quiz','workshop','waitlist','book_call','referral_partner','local_seo','community_event','social','email','other')),
  target_audience text,
  primary_offer text,
  goal text,
  start_date date,
  end_date date,
  budget_cents integer not null default 0,
  owner_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists marketing_campaigns_updated on marketing_campaigns;
create trigger marketing_campaigns_updated before update on marketing_campaigns
for each row execute function set_updated_at();

create table if not exists campaign_links (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references marketing_campaigns(id) on delete cascade,
  label text not null,
  destination_url text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  generated_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists lead_attribution_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  email text,
  session_id text,
  campaign_id uuid references marketing_campaigns(id) on delete set null,
  event_type text not null,
  source_route text,
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  user_agent text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists lead_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  lifecycle_stage text not null check (lifecycle_stage in ('new_lead','guide_downloaded','quiz_completed','waitlist_joined','workshop_registered','book_call_clicked','call_booked','referral_partner','intake_started','converted_client','inactive','unsubscribed')),
  previous_stage text,
  source text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists lead_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  rules jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists lead_segments_updated on lead_segments;
create trigger lead_segments_updated before update on lead_segments
for each row execute function set_updated_at();

create table if not exists lead_segment_members (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  segment_id uuid not null references lead_segments(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (lead_id, segment_id)
);

create table if not exists marketing_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_type text not null check (trigger_type in ('parent_guide_download','quiz_completed','waitlist_joined','workshop_registered','book_call_abandoned','referral_partner_inquiry','manual')),
  status text not null default 'draft' check (status in ('draft','active','paused','archived')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists marketing_sequences_updated on marketing_sequences;
create trigger marketing_sequences_updated before update on marketing_sequences
for each row execute function set_updated_at();

create table if not exists marketing_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references marketing_sequences(id) on delete cascade,
  step_order integer not null,
  delay_hours integer not null default 0,
  channel text not null check (channel in ('email','sms','admin_task')),
  subject text,
  body text not null,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sequence_id, step_order)
);

create table if not exists marketing_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  sequence_id uuid not null references marketing_sequences(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','completed','stopped','unsubscribed')),
  current_step_order integer not null default 0,
  next_send_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  stopped_reason text
);

create table if not exists marketing_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  sequence_id uuid references marketing_sequences(id) on delete set null,
  sequence_step_id uuid references marketing_sequence_steps(id) on delete set null,
  channel text not null check (channel in ('email','sms','admin_task')),
  status text not null check (status in ('queued','sent','failed','skipped','blocked')),
  subject text,
  body_preview text,
  provider_message_id text,
  failure_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists marketing_consent_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  email text,
  phone text,
  consent_type text not null check (consent_type in ('email_marketing','sms_marketing','workshop_reminders','referral_followup')),
  consent_status text not null check (consent_status in ('granted','revoked')),
  consent_source text,
  consent_text text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists referral_partners (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  partner_type text check (partner_type in ('pediatrician','school','slp','pt','counselor','homeschool_group','nature_school','daycare','community_org','other')),
  city text,
  state text not null default 'TX',
  status text not null default 'prospect' check (status in ('prospect','contacted','meeting_scheduled','active','paused','not_fit')),
  referral_fit_score integer not null default 0,
  notes text,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists referral_partners_updated on referral_partners;
create trigger referral_partners_updated before update on referral_partners
for each row execute function set_updated_at();

create table if not exists partner_outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references referral_partners(id) on delete cascade,
  task_type text not null check (task_type in ('email','call','dropoff','meeting','follow_up','thank_you')),
  status text not null default 'todo' check (status in ('todo','done','skipped')),
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists content_calendar_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null default 'other' check (platform in ('facebook','instagram','google_business_profile','email','blog','flyer','community_calendar','other')),
  status text not null default 'idea' check (status in ('idea','draft','approved','scheduled','published','archived')),
  target_audience text,
  campaign_id uuid references marketing_campaigns(id) on delete set null,
  publish_at timestamptz,
  caption text,
  image_prompt text,
  cta_label text,
  cta_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists content_calendar_posts_updated on content_calendar_posts;
create trigger content_calendar_posts_updated before update on content_calendar_posts
for each row execute function set_updated_at();

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'other' check (event_type in ('workshop','library_event','park_playdate','homeschool_session','parent_talk','screening','resource_fair','other')),
  location_name text,
  city text,
  state text not null default 'TX',
  start_at timestamptz,
  end_at timestamptz,
  campaign_id uuid references marketing_campaigns(id) on delete set null,
  registration_url text,
  capacity integer,
  status text not null default 'idea' check (status in ('idea','planned','promoting','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists community_events_updated on community_events;
create trigger community_events_updated before update on community_events
for each row execute function set_updated_at();

create table if not exists marketing_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_attribution_events_email on lead_attribution_events (email);
create index if not exists idx_lead_attribution_events_lead_id on lead_attribution_events (lead_id);
create index if not exists idx_lead_attribution_events_utm_campaign on lead_attribution_events (utm_campaign);
create index if not exists idx_lead_attribution_events_created_at on lead_attribution_events (created_at);
create index if not exists idx_marketing_sequence_enrollments_next_send_at on marketing_sequence_enrollments (next_send_at);
create index if not exists idx_marketing_sequence_enrollments_status on marketing_sequence_enrollments (status);
create index if not exists idx_marketing_messages_status on marketing_messages (status);
create index if not exists idx_referral_partners_status on referral_partners (status);
create index if not exists idx_partner_outreach_tasks_due_at on partner_outreach_tasks (due_at);
create index if not exists idx_content_calendar_posts_publish_at on content_calendar_posts (publish_at);
create index if not exists idx_community_events_start_at on community_events (start_at);

alter table marketing_campaigns enable row level security;
alter table campaign_links enable row level security;
alter table lead_attribution_events enable row level security;
alter table lead_lifecycle_events enable row level security;
alter table lead_segments enable row level security;
alter table lead_segment_members enable row level security;
alter table marketing_sequences enable row level security;
alter table marketing_sequence_steps enable row level security;
alter table marketing_sequence_enrollments enable row level security;
alter table marketing_messages enable row level security;
alter table marketing_consent_events enable row level security;
alter table referral_partners enable row level security;
alter table partner_outreach_tasks enable row level security;
alter table content_calendar_posts enable row level security;
alter table community_events enable row level security;
alter table marketing_audit_logs enable row level security;

drop policy if exists privileged_marketing_campaigns on marketing_campaigns;
create policy privileged_marketing_campaigns on marketing_campaigns
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_campaigns on marketing_campaigns;
create policy staff_select_marketing_campaigns on marketing_campaigns
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_campaign_links on campaign_links;
create policy privileged_campaign_links on campaign_links
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_campaign_links on campaign_links;
create policy staff_select_campaign_links on campaign_links
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_lead_attribution_events on lead_attribution_events;
create policy privileged_lead_attribution_events on lead_attribution_events
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_lead_attribution_events on lead_attribution_events;
create policy staff_select_lead_attribution_events on lead_attribution_events
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_lead_lifecycle_events on lead_lifecycle_events;
create policy privileged_lead_lifecycle_events on lead_lifecycle_events
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_lead_lifecycle_events on lead_lifecycle_events;
create policy staff_select_lead_lifecycle_events on lead_lifecycle_events
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_lead_segments on lead_segments;
create policy privileged_lead_segments on lead_segments
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_lead_segments on lead_segments;
create policy staff_select_lead_segments on lead_segments
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_lead_segment_members on lead_segment_members;
create policy privileged_lead_segment_members on lead_segment_members
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_lead_segment_members on lead_segment_members;
create policy staff_select_lead_segment_members on lead_segment_members
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_sequences on marketing_sequences;
create policy privileged_marketing_sequences on marketing_sequences
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_sequences on marketing_sequences;
create policy staff_select_marketing_sequences on marketing_sequences
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_sequence_steps on marketing_sequence_steps;
create policy privileged_marketing_sequence_steps on marketing_sequence_steps
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_sequence_steps on marketing_sequence_steps;
create policy staff_select_marketing_sequence_steps on marketing_sequence_steps
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_sequence_enrollments on marketing_sequence_enrollments;
create policy privileged_marketing_sequence_enrollments on marketing_sequence_enrollments
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_sequence_enrollments on marketing_sequence_enrollments;
create policy staff_select_marketing_sequence_enrollments on marketing_sequence_enrollments
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_messages on marketing_messages;
create policy privileged_marketing_messages on marketing_messages
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_messages on marketing_messages;
create policy staff_select_marketing_messages on marketing_messages
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_consent_events on marketing_consent_events;
create policy privileged_marketing_consent_events on marketing_consent_events
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_consent_events on marketing_consent_events;
create policy staff_select_marketing_consent_events on marketing_consent_events
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_referral_partners on referral_partners;
create policy privileged_referral_partners on referral_partners
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_referral_partners on referral_partners;
create policy staff_select_referral_partners on referral_partners
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_partner_outreach_tasks on partner_outreach_tasks;
create policy privileged_partner_outreach_tasks on partner_outreach_tasks
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_partner_outreach_tasks on partner_outreach_tasks;
create policy staff_select_partner_outreach_tasks on partner_outreach_tasks
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_content_calendar_posts on content_calendar_posts;
create policy privileged_content_calendar_posts on content_calendar_posts
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_content_calendar_posts on content_calendar_posts;
create policy staff_select_content_calendar_posts on content_calendar_posts
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_community_events on community_events;
create policy privileged_community_events on community_events
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_community_events on community_events;
create policy staff_select_community_events on community_events
for select to authenticated using (public.is_staff_level());

drop policy if exists privileged_marketing_audit_logs on marketing_audit_logs;
create policy privileged_marketing_audit_logs on marketing_audit_logs
for all to authenticated using (public.is_privileged()) with check (public.is_privileged());
drop policy if exists staff_select_marketing_audit_logs on marketing_audit_logs;
create policy staff_select_marketing_audit_logs on marketing_audit_logs
for select to authenticated using (public.is_staff_level());

insert into lead_segments (name, description, rules, is_system)
values
  ('Homeschool Families', 'Leads indicating homeschool interest', '{"match":["homeschool"]}'::jsonb, true),
  ('Sensory Regulation Interest', 'Interest in sensory and regulation support', '{"match":["sensory","regulation"]}'::jsonb, true),
  ('Outdoor Confidence Interest', 'Interest in outdoor confidence', '{"match":["outdoor confidence"]}'::jsonb, true),
  ('Motor Skills Interest', 'Interest in motor skills support', '{"match":["motor"]}'::jsonb, true),
  ('Social Participation Interest', 'Interest in social participation', '{"match":["social participation"]}'::jsonb, true),
  ('Workshop Leads', 'Leads from workshop registrations', '{"lifecycle":"workshop_registered"}'::jsonb, true),
  ('Parent Guide Leads', 'Leads from parent guide', '{"lifecycle":"guide_downloaded"}'::jsonb, true),
  ('Quiz Leads', 'Leads from quiz completion', '{"lifecycle":"quiz_completed"}'::jsonb, true),
  ('Waitlist Leads', 'Leads from waitlist submissions', '{"lifecycle":"waitlist_joined"}'::jsonb, true),
  ('Referral Partners', 'Leads from referral partner forms', '{"lifecycle":"referral_partner"}'::jsonb, true),
  ('High Intent Leads', 'Leads with high-intent actions', '{"lifecycle_any":["book_call_clicked","call_booked","workshop_registered","referral_partner"]}'::jsonb, true),
  ('Inactive Leads', 'Leads marked inactive', '{"lifecycle":"inactive"}'::jsonb, true),
  ('Unsubscribed', 'Leads who unsubscribed', '{"lifecycle":"unsubscribed"}'::jsonb, true)
on conflict (name) do nothing;

insert into marketing_campaigns (name, slug, status, campaign_type, target_audience, primary_offer, goal, owner_name, notes)
values
  ('Parent Guide Lead Magnet', 'parent-guide-lead-magnet', 'active', 'parent_guide', 'parents of young children needing regulation, confidence, and participation support', 'Free outdoor regulation guide', 'Guide downloads and waitlist joins', 'TreeTots Team', 'Primary CTA: Download the guide'),
  ('Sensory Regulation Quiz', 'sensory-regulation-quiz', 'active', 'quiz', 'parents unsure whether nature-based groups are a fit', 'Quick parent quiz', 'quiz completions and booked calls', 'TreeTots Team', 'Primary CTA: Take the quiz'),
  ('Homeschool Nature OT Group', 'homeschool-nature-ot-group', 'active', 'waitlist', 'homeschool families in Texas', 'weekday nature-based OT-informed group', 'waitlist joins', 'TreeTots Team', 'Primary CTA: Join the homeschool group waitlist'),
  ('Outdoor Confidence Workshop', 'outdoor-confidence-workshop', 'active', 'workshop', 'parents wanting a low-pressure first TreeTots experience', 'low-cost or free parent-child outdoor workshop', 'workshop registrations and parent calls', 'TreeTots Team', 'Primary CTA: Register for workshop'),
  ('Referral Partner Outreach', 'referral-partner-outreach', 'active', 'referral_partner', 'pediatricians, SLPs, PTs, counselors, schools, homeschool groups, nature schools', 'referral resource page and collaboration call', 'referral relationships', 'TreeTots Team', 'Primary CTA: Partner with TreeTots'),
  ('Local SEO Growth', 'local-seo-growth', 'active', 'local_seo', 'parents searching in target Texas city', 'local nature-based pediatric OT group landing page', 'organic leads', 'TreeTots Team', 'Primary CTA: Book a parent call')
on conflict (slug) do nothing;

insert into content_calendar_posts (title, platform, status, target_audience, notes)
values
  ('What is nature-based occupational therapy for kids?', 'blog', 'idea', 'Parents', 'Seed idea'),
  ('5 outdoor regulation activities for kids', 'instagram', 'idea', 'Parents', 'Seed idea'),
  ('How outdoor play can support motor confidence', 'facebook', 'idea', 'Parents', 'Seed idea'),
  ('Signs your child may benefit from a small supportive group', 'blog', 'idea', 'Parents', 'Seed idea'),
  ('What to expect at a TreeTots outdoor group', 'email', 'idea', 'Parents', 'Seed idea'),
  ('Homeschool nature group interest list now open', 'community_calendar', 'idea', 'Homeschool families', 'Seed idea'),
  ('Free parent guide: outdoor regulation ideas', 'facebook', 'idea', 'Parents', 'Seed idea'),
  ('Upcoming TreeTots workshop', 'instagram', 'idea', 'Parents', 'Seed idea'),
  ('For pediatricians and therapists: how TreeTots supports participation', 'email', 'idea', 'Referral partners', 'Seed idea'),
  ('Why real-life practice matters for children''s confidence', 'blog', 'idea', 'Parents', 'Seed idea')
on conflict do nothing;

insert into marketing_sequences (name, trigger_type, status, description)
values
  ('Parent Guide Download Sequence', 'parent_guide_download', 'active', 'Guide nurture sequence'),
  ('Quiz Result Sequence', 'quiz_completed', 'active', 'Quiz follow-up sequence'),
  ('Workshop Registration Sequence', 'workshop_registered', 'active', 'Workshop confirmations and follow-up'),
  ('Waitlist Sequence', 'waitlist_joined', 'active', 'Waitlist follow-up sequence'),
  ('Referral Partner Sequence', 'referral_partner_inquiry', 'active', 'Referral partner follow-up')
on conflict do nothing;

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 1, 0, 'email', 'Your TreeTots outdoor regulation guide',
  'Hi {{parent_name}}, Here is your guide. TreeTots helps kids practice regulation, confidence, and participation through outdoor play-based OT-informed groups.',
  'View the guide / Book a parent call', null, true
from marketing_sequences s
where s.name = 'Parent Guide Download Sequence'
and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 1);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 2, 48, 'email', 'A simple outdoor regulation activity to try this week',
  'Try a short outdoor rhythm walk with a pause-breathe-check-in routine. This supports regulation practice without guarantees.',
  'Join the waitlist', null, true
from marketing_sequences s
where s.name = 'Parent Guide Download Sequence'
and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 2);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 3, 120, 'email', 'Is a nature-based group a fit for your child?',
  'TreeTots groups are designed to support participation, confidence, and practical skill practice in outdoor settings.',
  'Book a parent call', null, true
from marketing_sequences s
where s.name = 'Parent Guide Download Sequence'
and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 3);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 1, 0, 'email', 'Your TreeTots quiz result',
  'Here is your result summary and one practical next step for your family.',
  'Join the waitlist / Book a call', null, true
from marketing_sequences s
where s.name = 'Quiz Result Sequence'
and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 1);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 2, 72, 'email', 'What outdoor OT groups can support',
  'Outdoor groups may help children practice sensory regulation, motor confidence, social participation, and real-life participation.',
  'View upcoming workshops', null, true
from marketing_sequences s
where s.name = 'Quiz Result Sequence'
and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 2);

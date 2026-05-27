-- Zapier automation audit + automation catalog (operational mirror; not clinical records)

create table if not exists zapier_automations (
  id uuid primary key default gen_random_uuid(),
  zap_key text not null unique,
  zap_name text not null,
  trigger_app text,
  trigger_event text,
  action_app text,
  action_event text,
  related_module text,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'paused', 'needs_review', 'deprecated')),
  requires_approval boolean not null default false,
  sends_external_message boolean not null default false,
  handles_parent_child_data boolean not null default false,
  phi_risk_level text not null default 'low'
    check (phi_risk_level in ('none', 'low', 'medium', 'high')),
  last_tested_at timestamptz,
  last_run_at timestamptz,
  error_log text,
  owner text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_zapier_automations_status on zapier_automations (status);

create table if not exists zapier_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text not null default 'app',
  destination text not null default 'zapier',
  payload_summary jsonb default '{}'::jsonb,
  contains_parent_child_data boolean not null default false,
  phi_risk_level text not null default 'low'
    check (phi_risk_level in ('none', 'low', 'medium', 'high')),
  approval_required boolean not null default false,
  approval_status text not null default 'not_required'
    check (
      approval_status in (
        'not_required',
        'pending',
        'approved',
        'rejected'
      )
    ),
  sent_at timestamptz,
  result text not null default 'pending'
    check (
      result in (
        'pending',
        'received',
        'dry_run',
        'sent',
        'skipped_disabled',
        'skipped_unsubscribed',
        'skipped_no_url',
        'blocked_pending_approval',
        'blocked_missing_authorization',
        'blocked_not_approved_content',
        'blocked_testimonial',
        'failed'
      )
    ),
  error_message text,
  related_zap_key text references zapier_automations (zap_key) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_zapier_events_created on zapier_events (created_at desc);
create index if not exists idx_zapier_events_result on zapier_events (result);

drop trigger if exists zapier_automations_updated on zapier_automations;
create trigger zapier_automations_updated before update on zapier_automations
  for each row execute function set_updated_at();

alter table zapier_automations enable row level security;
alter table zapier_events enable row level security;

create policy "privileged_zapier_automations" on zapier_automations
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_zapier_automations" on zapier_automations
  for select to authenticated using (public.is_staff_level());

create policy "privileged_zapier_events" on zapier_events
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

create policy "staff_select_zapier_events" on zapier_events
  for select to authenticated using (public.is_staff_level());

comment on table zapier_events is 'Outbound/inbound Zapier automation audit trail; payloads are summarized/redacted.';
comment on table zapier_automations is 'Catalog of Zaps keyed for Growth OS dashboards and last-run bookkeeping.';

-- Seed catalog aligned with Growth OS playbook (editable in Supabase/Airtable sync later)
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
) values
  (
    'new_lead',
    'New quiz lead captured',
    'Nature OT Growth OS',
    'POST /api/leads',
    'Zapier',
    'Catch Hook / enrichment',
    'Leads',
    'active',
    false,
    true,
    true,
    'low'
  ),
  (
    'waitlist_entry',
    'New waitlist entry',
    'Nature OT Growth OS',
    'POST /api/waitlist',
    'Zapier',
    'Airtable + email ops',
    'Waitlist',
    'active',
    false,
    true,
    true,
    'low'
  ),
  (
    'workshop_registration',
    'Workshop registration',
    'Nature OT Growth OS',
    'workshop_registration',
    'Zapier',
    'Calendar + confirmation',
    'Workshops',
    'planned',
    false,
    true,
    true,
    'low'
  ),
  (
    'booking_created',
    'Booking created',
    'Nature OT Growth OS',
    'POST /api/bookings',
    'Zapier',
    'Pause nurture + notify',
    'Bookings',
    'active',
    false,
    true,
    true,
    'low'
  ),
  (
    'feedback_submitted',
    'Feedback submitted',
    'Nature OT Growth OS',
    'feedback_submitted',
    'Zapier',
    'Review outreach',
    'Feedback',
    'planned',
    true,
    true,
    true,
    'low'
  ),
  (
    'review_request',
    'Review request sequence',
    'Nature OT Growth OS',
    'review_request',
    'Zapier',
    'Email outreach',
    'Reviews',
    'planned',
    true,
    true,
    true,
    'low'
  ),
  (
    'referral_followup',
    'Referral partner follow-up due',
    'Nature OT Growth OS',
    'referral_partner_follow_up',
    'Zapier',
    'Admin notify / task',
    'Referrals',
    'planned',
    true,
    true,
    false,
    'low'
  ),
  (
    'content_scheduling',
    'Content approved scheduling',
    'Nature OT Growth OS',
    'content_calendar_approved',
    'Zapier',
    'Social scheduler',
    'Content',
    'planned',
    true,
    true,
    false,
    'low'
  ),
  (
    'local_seo_build',
    'Local SEO page approved → build task',
    'Nature OT Growth OS',
    'local_seo_approved',
    'Zapier',
    'App build workflow',
    'SEO',
    'planned',
    true,
    false,
    false,
    'low'
  ),
  (
    'automation_error',
    'Automation error alert',
    'Zapier',
    'Zap failure',
    'Nature OT Growth OS',
    'Inbound webhook log',
    'Ops',
    'active',
    false,
    true,
    false,
    'none'
  ),
  (
    'unsubscribe_event',
    'Marketing unsubscribe',
    'Nature OT Growth OS',
    'unsubscribe',
    'Zapier',
    'Suppression + CRM',
    'Compliance',
    'active',
    false,
    false,
    true,
    'low'
  )
on conflict (zap_key) do nothing;

-- Workshop event time for nurture relative to event; optional per registration
alter table workshop_registrations
  add column if not exists event_starts_at timestamptz;

comment on column workshop_registrations.event_starts_at is 'When known, anchors workshop reminder nurture steps (hours before / after event).';

-- Optional schedule hints for nurture steps beyond simple delay_hours
alter table marketing_sequence_steps
  add column if not exists schedule_metadata jsonb not null default '{}'::jsonb;

comment on column marketing_sequence_steps.schedule_metadata is 'timing keys: omit or empty = use delay_hours after previous send. timed keys: {"timing":"before_lead_event","hours":24}, {"timing":"after_lead_event","hours":24}; uses workshop_registrations.event_starts_at for lead.';

-- ---------------------------------------------------------------------------
-- Workshop Registration Sequence steps (confirmation + reminders + thanks)
-- ---------------------------------------------------------------------------

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 1, 0, '{}'::jsonb, 'email', 'You''re registered for the TreeTots workshop',
  'Hi {{parent_name}}, Thanks for registering. Date and time appear in staff follow-up messaging when your session is finalized. Comfortable layers, sunscreen, closed-toe shoes suitable for uneven ground. Expect a low-pressure introduction to TreeTots—educational, not individualized evaluation.',
  'Add to calendar', null, true
from marketing_sequences s
where s.name = 'Workshop Registration Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 1);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 2, 24, '{"timing":"before_lead_event","hours":24}'::jsonb, 'email', 'Reminder: TreeTots workshop tomorrow',
  'Quick reminder—we''ll be outdoors and weather-dependent. Layers, hydration, sunscreen, footwear for grass or dirt paths are helpful. Participation is caregiver-present; pacing is caregiver-led.',
  null, null, true
from marketing_sequences s
where s.name = 'Workshop Registration Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 2);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 3, 72, '{"timing":"after_lead_event","hours":24}'::jsonb, 'email', 'Thanks for joining TreeTots',
  'Hi {{parent_name}}, Thank you for spending time with us. If you''d like to stay close to openings, join the waitlist or book a short parent conversation when it helps.',
  'Join the waitlist / Book a parent call', null, true
from marketing_sequences s
where s.name = 'Workshop Registration Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 3);

-- Note: Step 3 uses delay_hours as fallback horizon when event_starts_at is unknown (engine applies fallback).

-- ---------------------------------------------------------------------------
-- Waitlist Sequence
-- ---------------------------------------------------------------------------

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 1, 0, '{}'::jsonb, 'email', 'You''re on the TreeTots waitlist',
  'Hi {{parent_name}}, We received your interest. We''ll reach out with next availability and orientation details—you can reply anytime with scheduling questions.',
  null, null, true
from marketing_sequences s
where s.name = 'Waitlist Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 1);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 2, 96, '{}'::jsonb, 'email', 'What TreeTots groups are designed to support',
  'Nature-based occupational therapy–informed groups can help children practice sensory regulation strategies, motor confidence, social participation, and everyday readiness in small outdoor settings—without promising specific outcomes.',
  'Book a parent call', null, true
from marketing_sequences s
where s.name = 'Waitlist Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 2);

-- ---------------------------------------------------------------------------
-- Referral Partner Sequence
-- ---------------------------------------------------------------------------

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 1, 0, '{}'::jsonb, 'email', 'Thanks for connecting with TreeTots',
  'Hello, thank you for your interest in collaboration. TreeTots supports pediatric participation through outdoor, play-based occupational therapy-informed groups—we focus on respectful partnership and compliant information sharing.',
  null, null, true
from marketing_sequences s
where s.name = 'Referral Partner Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 1);

insert into marketing_sequence_steps (sequence_id, step_order, delay_hours, schedule_metadata, channel, subject, body, cta_label, cta_url, is_active)
select s.id, 2, 24, '{}'::jsonb, 'admin_task', 'Follow up with referral partner',
  'Task: Follow up with referral partner by email or phone. Log outcome in CRM. No unsolicited mass messaging.',
  null, null, true
from marketing_sequences s
where s.name = 'Referral Partner Sequence'
  and not exists (select 1 from marketing_sequence_steps x where x.sequence_id = s.id and x.step_order = 2);

-- ---------------------------------------------------------------------------
-- Seed template partner outreach tasks (one library organization + repeatable task types)
-- ---------------------------------------------------------------------------

insert into referral_partners (organization_name, contact_name, partner_type, city, state, status, notes)
select '(Template library) Partner outreach playbook', null, 'other', null, 'TX', 'prospect',
  'Not a live partner row—stores template tasks for cloning in CRM.'
where not exists (
  select 1 from referral_partners rp where rp.organization_name = '(Template library) Partner outreach playbook'
);

insert into partner_outreach_tasks (partner_id, task_type, status, notes, due_at)
select rp.id, v.task_type, 'todo', v.notes, null
from referral_partners rp
cross join (values
  ('email'::text, 'Initial outreach email'),
  ('dropoff'::text, 'Drop-off flyer task'),
  ('call'::text, 'Follow-up call'),
  ('thank_you'::text, 'Thank-you email'),
  ('follow_up'::text, 'Quarterly check-in')
) as v(task_type, notes)
where rp.organization_name = '(Template library) Partner outreach playbook'
  and not exists (
    select 1 from partner_outreach_tasks pot
    where pot.partner_id = rp.id and pot.notes = v.notes
  );

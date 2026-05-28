-- Testimonial authorization queue (reviews admin UI)

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  parent_initials text not null,
  auth_status text not null default 'pending'
    check (auth_status in ('pending', 'authorized', 'denied')),
  admin_approval text not null default 'pending'
    check (admin_approval in ('pending', 'approved', 'rejected')),
  published boolean not null default false,
  published_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists testimonials_updated on testimonials;
create trigger testimonials_updated before update on testimonials
  for each row execute function set_updated_at();

alter table testimonials enable row level security;

drop policy if exists privileged_testimonials on testimonials;
create policy privileged_testimonials on testimonials
  for all to authenticated using (public.is_privileged()) with check (public.is_privileged());

drop policy if exists staff_select_testimonials on testimonials;
create policy staff_select_testimonials on testimonials
  for select to authenticated using (public.is_staff_level());

insert into testimonials (quote, parent_initials, auth_status, admin_approval, published)
values
  (
    'Our child looked forward to every week outdoors with the group.',
    'L.P.',
    'pending',
    'pending',
    false
  ),
  (
    'Clear communication and thoughtful pacing outdoors.',
    'T.R.',
    'authorized',
    'approved',
    true
  )
on conflict do nothing;

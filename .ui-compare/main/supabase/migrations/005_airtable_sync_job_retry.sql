-- Retry metadata for airtable_sync_jobs queue worker
alter table airtable_sync_jobs add column if not exists retry_count integer not null default 0;
alter table airtable_sync_jobs add column if not exists last_retry_at timestamptz;
alter table airtable_sync_jobs add column if not exists retry_metadata jsonb;

comment on column airtable_sync_jobs.retry_count is 'Incremented when a failed job is re-queued.';
comment on column airtable_sync_jobs.last_retry_at is 'Last time a failed row was reset to pending.';
comment on column airtable_sync_jobs.retry_metadata is 'Audit trail for prior failures (never store PHI payloads).';

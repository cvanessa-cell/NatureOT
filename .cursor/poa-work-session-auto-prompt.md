# Cursor Auto-Implement — Work Session

Execute this plan directly on main. Do not read or log .env values.

# Cursor Task Prompt

## Role
Senior full-stack engineer working on TreeTots / NatureOT / TreeTots Nature OT DFW (Healthcare / Pediatric OT).

## Goal
E2E smoke: book-call, waitlist, and provider-referral CTAs

## Context
Project: TreeTots / NatureOT / TreeTots Nature OT DFW

Nature-based pediatric OT in DFW: sensory regulation, motor confidence, outdoor play, parent education, provider referrals, groups and workshops. Next.js + Supabase + Sanity + Stripe + Cal.com.

Verify /book-call, /waitlist, /provider-referral, and homepage CTAs on mobile. Launch-readiness flags manual QA on core pages.

Milestone: Revenue launch

Current task status: doing

Project next best action: Polish /services → /checkout/[service] conversion, then smoke-test Airtable live sync after dry-run drills

Known blockers: Airtable/Zapier still dry-run on launch-readiness; SLP/PT/pediatrician referral landings missing; services→checkout E2E needs conversion polish; daily UI automation in progress on main

Project: TreeTots / NatureOT / TreeTots Nature OT DFW (treetots)
Framework: Next.js
Repo path: C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads
Task: E2E smoke: book-call, waitlist, and provider-referral CTAs
Description: Verify /book-call, /waitlist, /provider-referral, and homepage CTAs on mobile. Launch-readiness flags manual QA on core pages.
Suggested files:
- src/app/services/**
- src/app/checkout/**
- src/app/book-call/**
- src/app/waitlist/**
- src/app/provider-referral/**
- src/app/aba-referral-partners/**
- src/app/texas/**
- src/lib/env/operational-readiness.ts
- src/app/admin/**/launch-readiness/**
- **/stripe*
- supabase/**

Skipped — no web research integration configured. Set FIRECRAWL_API_KEY or ASSISTANT_WEB_RESEARCH_URL to enable.

# Implementation plan — E2E smoke: book-call, waitlist, and provider-referral CTAs

Option: cursor_auto

## Project analysis
Project: TreeTots / NatureOT / TreeTots Nature OT DFW (treetots)
Framework: Next.js
Repo path: C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads
Task: E2E smoke: book-call, waitlist, and provider-referral CTAs
Description: Verify /book-call, /waitlist, /provider-referral, and homepage CTAs on mobile. Launch-readiness flags manual QA on core pages.
Suggested files:
- src/app/services/**
- src/app/checkout/**
- src/app/book-call/**
- src/app/waitlist/**
- src/app/provider-referral/**
- src/app/aba-referral-partners/**
- src/app/texas/**
- src/lib/env/operational-readiness.ts
- src/app/admin/**/launch-readiness/**
- **/stripe*
- supabase/**

## Research
Skipped — no web research integration configured. Set FIRECRAWL_API_KEY or ASSISTANT_WEB_RESEARCH_URL to enable.

## Steps
1. Confirm working on the main repo checkout
2. Read project context and suggested files
3. Implement minimal focused diff for task goal
4. Run lint, test, and build
5. Commit on main with assistant(work-session) message

## Acceptance
- Task goal met with verifiable checks
- No secrets in code or logs
- Tests/build pass when available

All financial figures are estimates based on your inputs — not guarantees of income or outcomes.

## Files to inspect
- src/app/services/**
- src/app/checkout/**
- src/app/book-call/**
- src/app/waitlist/**
- src/app/provider-referral/**
- src/app/aba-referral-partners/**
- src/app/texas/**
- src/lib/env/operational-readiness.ts
- src/app/admin/**/launch-readiness/**
- **/stripe*
- supabase/**

## Requirements
Implement the goal completely with minimal, focused diff.
Match existing code style and conventions.
Do not remove unrelated functionality.
Add or update tests where behavior changes.

## Constraints
Never read, log, or commit .env secret values.
Follow project compliance rules (no PHI in marketing forms, safe OT language, no Snapchat scraping).
Do not rename env vars unless required.

## Acceptance tests
Feature "E2E smoke: book-call, waitlist, and provider-referral CTAs" works end-to-end in dev.
Build and lint pass.
No secrets in code or logs.

## Commands to run
```bash
npm install
npm run lint
npm run build
npm run test
```

## What to report back
Summarize files changed, how to verify manually, any blockers, and suggested follow-up tasks.


## Saved plan
# Implementation plan — E2E smoke: book-call, waitlist, and provider-referral CTAs

Option: cursor_auto

## Project analysis
Project: TreeTots / NatureOT / TreeTots Nature OT DFW (treetots)
Framework: Next.js
Repo path: C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads
Task: E2E smoke: book-call, waitlist, and provider-referral CTAs
Description: Verify /book-call, /waitlist, /provider-referral, and homepage CTAs on mobile. Launch-readiness flags manual QA on core pages.
Suggested files:
- src/app/services/**
- src/app/checkout/**
- src/app/book-call/**
- src/app/waitlist/**
- src/app/provider-referral/**
- src/app/aba-referral-partners/**
- src/app/texas/**
- src/lib/env/operational-readiness.ts
- src/app/admin/**/launch-readiness/**
- **/stripe*
- supabase/**

## Research
Skipped — no web research integration configured. Set FIRECRAWL_API_KEY or ASSISTANT_WEB_RESEARCH_URL to enable.

## Steps
1. Confirm working on the main repo checkout
2. Read project context and suggested files
3. Implement minimal focused diff for task goal
4. Run lint, test, and build
5. Commit on main with assistant(work-session) message

## Acceptance
- Task goal met with verifiable checks
- No secrets in code or logs
- Tests/build pass when available
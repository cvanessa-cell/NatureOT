# Cursor Task Prompt

## Role
Senior full-stack engineer working on TreeTots / NatureOT / TreeTots Nature OT DFW (Healthcare / Pediatric OT).

## Goal
Polish services page → Stripe checkout conversion path — Step 2: Implement checkout and payment path

## Context
Project: TreeTots / NatureOT / TreeTots Nature OT DFW

Nature-based pediatric OT in DFW: sensory regulation, motor confidence, outdoor play, parent education, provider referrals, groups and workshops. Next.js + Supabase + Sanity + Stripe + Cal.com.

Repo has src/app/services/page.tsx and src/app/checkout/[service]/page.tsx. Improve pricing clarity, service cards, and checkout success/cancel flows. Files: services page, checkout routes, Stripe API routes.

Milestone: Revenue launch

Current task status: doing

Project next best action: Polish /services → /checkout/[service] conversion, then smoke-test Airtable live sync after dry-run drills

Known blockers: Airtable/Zapier still dry-run on launch-readiness; SLP/PT/pediatrician referral landings missing; services→checkout E2E needs conversion polish; daily UI automation in progress on main

Breakdown step 2: Implement checkout and payment path

Deliver the primary scope for revenue conversion and payment flow. Use task description: Repo has src/app/services/page.tsx and src/app/checkout/[service]/page.tsx. Improve pricing clarity, service cards, and checkout success/cancel flows. Files: services page, checkout routes, Stripe API routes.

Why it matters: This step unlocks measurable progress toward the task goal and near-term revenue impact.

Risks: Scope creep beyond task title; Breaking existing flows

Financial context: Task score 53.9 (estimate). Strengths: profit impact, cash sooner, unlocks downstream work, confidence, urgency.

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
Deliver the primary scope for revenue conversion and payment flow. Use task description: Repo has src/app/services/page.tsx and src/app/checkout/[service]/page.tsx. Improve pricing clarity, service cards, and checkout success/cancel flows. Files: services page, checkout routes, Stripe API routes.
- Core behavior works in local dev
- Matches existing code conventions
- No unrelated refactors
- Secrets never logged or committed

## Constraints
Never read, log, or commit .env secret values.
Follow project compliance rules (no PHI in marketing forms, safe OT language, no Snapchat scraping).
Do not rename env vars unless required.

## Acceptance tests
Feature "Polish services page → Stripe checkout conversion path" works end-to-end in dev.
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

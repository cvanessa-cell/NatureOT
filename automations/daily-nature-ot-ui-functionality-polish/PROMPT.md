# Daily Nature OT UI + Functionality Polish

You are working in the Nature OT website repository for TreeTots / Nature OT in the Dallas-Fort Worth area.

## Mission

Make exactly one focused, production-quality improvement per run that increases at least one of:

- parent trust
- visual polish
- usability
- conversion
- accessibility
- mobile responsiveness
- lead-capture effectiveness

Keep the change small enough to review in one sitting.

## Brand and UX direction

- Warm, professional, calming, trustworthy, modern, parent-friendly
- Nature-based pediatric occupational therapy, not generic outdoor play
- Soft nature palette: warm whites, creams, sage greens, soft browns, muted sky blues
- Rounded cards, gentle shadows, polished spacing, clear hierarchy
- Parent-facing language should be emotionally reassuring and easy to understand
- Avoid harsh clinical language
- Avoid cluttered dashboards and generic tech-template styling

## Marketing and safety rules

- Do not claim to cure, fix, guarantee, treat, or eliminate challenges
- Prefer language like `supports`, `helps build`, `encourages`, `provides opportunities for`, and `may help`
- Do not invent licenses, certifications, addresses, prices, testimonials, provider names, or outcomes
- Do not collect unnecessary child health information in marketing flows
- Preserve privacy and parent trust

## Repo-specific context

- Framework: Next.js App Router
- Versions: `next@16.2.4`, `react@19.2.4`
- Styling: Tailwind CSS 4 in `src/app/globals.css`
- Content/data: Sanity-backed marketing content plus local fallback content
- Key homepage entrypoint: `src/app/page.tsx`
- Key marketing components: `src/components/marketing/`
- Key forms and lead flows:
  - `src/components/waitlist-form.tsx`
  - `src/components/lead-form.tsx`
  - `src/components/parent-guide-lead-form.tsx`
  - `src/components/referral-partner-form.tsx`
  - `src/app/book-call/page.tsx`
  - `src/app/waitlist/page.tsx`
  - `src/app/provider-referral/page.tsx`
  - `src/app/referral/page.tsx`
- Useful route families:
  - `src/app/about`
  - `src/app/services`
  - `src/app/groups`
  - `src/app/homeschool-groups`
  - `src/app/workshops`
  - `src/app/faq`

## Priority areas

1. Homepage hero polish
2. Service cards
3. Lead conversion
4. Provider/referral experience
5. Accessibility and responsiveness
6. Visual consistency
7. Functionality fixes

## Operating rules

1. Inspect the current repository structure first.
2. Identify the framework, routes, components, styling system, forms, and data sources relevant to today’s change.
3. Run the smallest useful checks first:
   - install dependencies only if needed
   - `npm.cmd run lint`
   - `npm.cmd test` if tests are present and practical for the touched area
   - `npm.cmd run build`
4. Choose exactly one focused improvement.
5. Preserve existing functionality unless intentionally improving it.
6. Avoid broad rewrites unless the existing code blocks the improvement.
7. Add or update tests only when practical and high-value.
8. Re-run verification after changes.
9. Do not merge or deploy automatically.
10. Prefer a branch or dedicated worktree checkout over the user’s active checkout.

## Worktree preference

- If running inside a prepared automation worktree, stay there.
- If not, attempt to use a dedicated background worktree before editing.
- Only use the active working directory when worktrees are unavailable.

## Output format

Return a concise report using exactly this structure:

## Daily Nature OT Improvement

### Improvement made
Explain the single main improvement completed today.

### Why this helps the business
Explain how it improves parent trust, conversion, clarity, accessibility, SEO, or usability.

### Files changed
List modified files.

### Verification
List commands run and whether each passed or failed.

### Manual review checklist
Give 3-6 quick things to visually check in the browser.

### Suggested next improvement
Recommend the best next daily improvement for tomorrow.

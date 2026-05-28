# Daily Nature OT UI + Functionality Polish

You are working in the Nature OT website repository for TreeTots / Nature OT in the Dallas-Fort Worth area.

## Primary goal

Make exactly one focused, production-quality improvement per run that increases at least one of:

- parent trust
- visual polish
- usability
- conversion
- accessibility
- mobile responsiveness
- lead-capture effectiveness

Keep the change small enough to review in one sitting.

## Project context

This is a nature-based pediatric occupational therapy website. The site should feel warm, professional, calming, trustworthy, modern, and parent-friendly. It should clearly communicate that nature-based OT is therapist-led, goal-directed, play-based occupational therapy delivered in outdoor or natural environments, not generic outdoor play.

## Brand and UX direction

- Soft nature-inspired aesthetic
- Warm whites, creams, sage greens, soft browns, muted sky blues, and gentle organic textures
- Rounded cards, soft shadows, polished spacing, and clear visual hierarchy
- Parent-facing language that is clear, emotionally reassuring, and easy to understand
- No cluttered dashboard feel
- No harsh clinical feel
- No generic tech-template look
- Mobile-first layout quality
- Strong but gentle calls to action
- Trust-building sections for parents and providers
- Clear service explanations for groups, workshops, referrals, waitlist, parent calls, and provider partnerships

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

## High-priority improvement areas

1. Homepage hero polish
2. Service cards
3. Lead conversion
4. Provider/referral experience
5. Accessibility and responsiveness
6. Visual consistency
7. Functionality fixes

## Safety and marketing rules

- Do not claim the program cures, fixes, guarantees, treats, or eliminates a child's challenges
- Prefer language like `supports`, `helps build`, `encourages`, `provides opportunities for`, and `may help`
- Do not add medical guarantees
- Do not invent licenses, certifications, addresses, prices, testimonials, provider names, or clinical outcomes
- Do not collect or store unnecessary child health information in marketing flows
- Keep parent trust and privacy at the center of every change

## Operating workflow

1. Inspect the current repository structure first.
2. Identify the framework, routes, components, styling system, forms, and data sources relevant to today's change.
3. Run the smallest useful checks first:
   - install dependencies only if needed
   - `npm.cmd run lint`
   - `npm.cmd test` if tests are present and practical for the touched area
   - `npm.cmd run build`
4. Review the relevant UI files and choose exactly one focused improvement.
5. Make the improvement with production-quality code.
6. Preserve existing functionality unless intentionally improving it.
7. Avoid broad rewrites unless the existing code blocks the improvement.
8. Add or update tests only when practical and high-value.
9. Re-run verification after changes.
10. Do not merge or deploy automatically.

## Active working directory mode

- Work directly in the active working directory.
- Use the `main` branch by default.
- Do not create or switch to a separate automation branch or worktree unless the user explicitly asks for one.

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

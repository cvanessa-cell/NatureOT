# Daily Nature OT UI + Functionality Polish

One focused, production-quality UI or functionality improvement per run for the Nature OT website.

## Schedule

**Daily at 6:00 AM Pacific** (`America/Los_Angeles`)

Use **either** Cursor in-app Automations **or** the Windows scheduled task below — not both, or you may get two runs per day.

## Cursor app registration (recommended)

Create a new automation in **Cursor → Automations** with:

| Field | Value |
|--------|--------|
| **Name** | `Daily Nature OT UI + Functionality Polish` |
| **Schedule** | Daily at `6:00 AM` Pacific |
| **Working directory** | `C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads--polish-ui` |
| **Instructions** | Full contents of `PROMPT.md` in this folder |

Machine-readable copy: `automation.manifest.json`

## Local scheduled run (Windows fallback)

If in-app Automations are unavailable, use the Windows scheduled task (runs on **local system time** — set Windows timezone to Pacific, or adjust the time in the register script).

```powershell
# From repo root — register daily 6:00 AM task
.\scripts\register-daily-polish-ui-scheduled-task.ps1

# Dry run (prep worktree only)
.\scripts\run-daily-polish-ui-automation.ps1 -DryRun

# Full run (requires CURSOR_API_KEY in .env.local)
.\scripts\run-daily-polish-ui-automation.ps1
```

Or via npm:

```bash
npm run automation:polish-ui:register-task
npm run automation:polish-ui:dry-run
npm run automation:polish-ui:run
```

### Headless runs (`CURSOR_API_KEY`)

1. Create an API key at https://cursor.com/settings
2. Add to `.env.local` (repo root): `CURSOR_API_KEY=...`
3. Run `npm run automation:polish-ui:run`

Runs use `@cursor/sdk` against the polish-ui worktree with `PROMPT.md` as the instruction body.

## Worktree

Dedicated branch/worktree so daily edits do not touch your active checkout:

```powershell
.\scripts\prepare-polish-ui-worktree.ps1
```

Default path: `..\texas-nature-ot-leads--polish-ui` on branch `automation/polish-ui`.

## Files

| File | Purpose |
|------|---------|
| `PROMPT.md` | Full automation instructions |
| `automation.manifest.json` | Registration metadata |
| `logs/` | Run logs (gitignored) |
| `../scripts/prepare-polish-ui-worktree.ps1` | Create/reuse worktree |
| `../scripts/run-daily-polish-ui-automation.ps1` | Daily runner |
| `../scripts/register-daily-polish-ui-scheduled-task.ps1` | Windows Task Scheduler |

## Repo context

- Next.js App Router (`next@16.2.4`, `react@19.2.4`)
- Marketing: `src/components/marketing/`, lead forms under `src/components/`
- Improve incrementally; do not rewrite lead flows in one pass

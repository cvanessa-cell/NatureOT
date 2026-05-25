# Daily Nature OT UI + Functionality Polish

One focused, production-quality UI or functionality improvement per run for the Nature OT website.

## Schedule

Daily at 6:00 AM Pacific (`America/Los_Angeles`)

Use either Cursor in-app Automations or the Windows scheduled task below, not both.

## Run mode

- Prefer the dedicated worktree at `C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads--polish-ui`
- Branch: `automation/polish-ui`
- Fall back to the active working directory only if worktrees are unavailable

## Files

| File | Purpose |
|------|---------|
| `PROMPT.md` | Full automation instructions and daily report format |
| `automation.toml` | Standalone automation config |
| `automation.manifest.json` | Machine-readable registration metadata |
| `logs/` | Local run logs |
| `../scripts/prepare-polish-ui-worktree.ps1` | Create or reuse the dedicated worktree |
| `../scripts/run-daily-polish-ui-automation.ps1` | Daily runner |
| `../scripts/register-daily-polish-ui-scheduled-task.ps1` | Windows Task Scheduler registration |

## Cursor app registration

This session does not expose the app-level `automation_update` tool, so registration cannot be completed from here. If you want this registered in the app, use Cursor -> Automations and copy from either:

- `automation.manifest.json` for machine-readable values
- `PROMPT.md` for the full instruction body

Recommended values:

| Field | Value |
|------|-------|
| Name | `Daily Nature OT UI + Functionality Polish` |
| Schedule | Daily at `6:00 AM` Pacific |
| Working directory | `C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads--polish-ui` |
| Run mode | Dedicated background worktree |
| Instructions | Full contents of `PROMPT.md` |

## Windows fallback

If in-app Automations are unavailable, register a local scheduled task. It runs on the machine's local clock, so keep Windows set to Pacific time or adjust the task time accordingly.

```powershell
.\scripts\register-daily-polish-ui-scheduled-task.ps1
.\scripts\run-daily-polish-ui-automation.ps1 -DryRun
.\scripts\run-daily-polish-ui-automation.ps1
```

Or via npm:

```bash
npm run automation:polish-ui:register-task
npm run automation:polish-ui:dry-run
npm run automation:polish-ui:run
```

## Headless runs

The full headless agent path uses `@cursor/sdk` and requires `CURSOR_API_KEY`.

1. Create an API key at [cursor.com/settings](https://cursor.com/settings).
2. Add `CURSOR_API_KEY=...` to `.env.local` in the repo root.
3. Run `npm run automation:polish-ui:run`.

If `CURSOR_API_KEY` is missing, the runner now degrades to a safe local fallback instead of skipping the day entirely. The fallback:

- prepares or reuses the same polish worktree
- records git status
- records the available npm scripts
- runs `npm.cmd run lint` when `node_modules` is available
- inspects likely UI targets for CTA, form, accessibility, placeholder, and conversion-copy signals
- writes a Markdown fallback report in `automations/daily-nature-ot-ui-functionality-polish/logs/`
- exits successfully because missing headless-agent auth is an expected degraded mode, not a repo failure

The fallback does not edit files, commit, merge, deploy, or attempt to replace the full agent workflow.

## Scope rules

- Make exactly one focused improvement per run.
- Keep changes reviewable in one sitting.
- Do not merge or deploy automatically.
- Preserve parent trust, privacy, and safe marketing language.

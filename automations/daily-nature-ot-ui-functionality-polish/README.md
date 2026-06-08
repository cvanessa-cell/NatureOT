# Daily Nature OT UI + Functionality Polish

One focused, production-quality UI or functionality improvement per run for the Nature OT website.

## Schedule

Daily at 6:00 AM Pacific (`America/Los_Angeles`)

Use either Cursor in-app Automations or the Windows scheduled task below, not both.

## Run mode

- Use the active working directory at `C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads`
- The runner creates a temporary review worktree and branch from `main`
- After a successful edit it runs debug/test checks, commits, reruns checks, merges to `main`, pushes `main`, then deletes the temporary review branch and worktree

## Files

| File | Purpose |
|------|---------|
| `PROMPT.md` | Full automation instructions and daily report format |
| `automation.toml` | Standalone automation config |
| `automation.manifest.json` | Machine-readable registration metadata |
| `logs/` | Local run logs |
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
| Working directory | `C:\Users\cvane\.cursor\projects\C-Users-cvane-AppData-Local-Temp-ef3e6400-05b7-41f9-8006-7a0f2b30cb22\texas-nature-ot-leads` |
| Run mode | Runner-managed review branch, merge to `main`, push, then branch cleanup |
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

- runs in the temporary review worktree
- records git status
- records the available npm scripts
- inspects likely UI targets for CTA, form, accessibility, placeholder, and conversion-copy signals
- writes a Markdown fallback report in `automations/daily-nature-ot-ui-functionality-polish/logs/`
- exits successfully because missing headless-agent auth is an expected degraded mode, not a repo failure

The fallback does not intentionally edit files. Because no review changes are committed, the runner removes the empty temporary branch/worktree and does not merge or push.

## Publish flow

For a successful headless edit, the runner performs this sequence:

1. Create a temporary review branch and worktree from `main`.
2. Run the headless Cursor agent against that worktree.
3. Run `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run build`.
4. Commit meaningful worktree changes, excluding SDK state and local automation logs.
5. Run the same checks again after the commit.
6. Confirm the base `main` checkout has no meaningful uncommitted user changes.
7. Fast-forward `main` from the remote, merge the review branch, rerun checks on `main`, push `main`, then delete the temporary branch/worktree.

If merge, push, or verification fails, the runner preserves the review branch and worktree for debugging.

## Scope rules

- Make exactly one focused improvement per run.
- Keep changes reviewable in one sitting.
- Merge and push only through the runner-managed publish flow.
- Preserve parent trust, privacy, and safe marketing language.

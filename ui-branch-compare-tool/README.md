# UI Branch Compare Tool

Copy these files into the root of any Node-based app project:

```text
compare-ui.cmd
scripts/compare-ui-branches.mjs
docs/UI_BRANCH_COMPARISON.md
```

Then add this script to that project's `package.json`:

```json
"compare:ui": "node scripts/compare-ui-branches.mjs"
```

Run by double-clicking `compare-ui.cmd`, or from a terminal:

```powershell
npm run compare:ui
```

Common commands:

```powershell
npm run compare:ui -- --current-working-copy
npm run compare:ui -- --branch feature/calendar-links
npm run compare:ui -- --branch feature/calendar-links --routes /,/events,/calendar
```

The tool compares clean `main` on `http://localhost:3131` against the selected branch or current working copy on `http://localhost:3132`.

It does not commit, merge, reset, rebase, stash, push, deploy, or delete worktrees automatically.

Screenshot diffs require optional dev dependencies: `playwright`, `pixelmatch`, and `pngjs`. If they are missing, the script asks before installing them.

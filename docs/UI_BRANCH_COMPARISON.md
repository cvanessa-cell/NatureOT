# UI Branch Comparison

This repo includes:

1. **Web dashboard** (`npm run ui-compare`) — lists main, branches, and uncommitted changes with relative diff descriptions; optional commit; split-screen compare with indexed difference notes.
2. **CLI script** (`npm run compare:ui`) — terminal workflow for the same comparisons.

The script does not commit, merge, reset, rebase, stash, push, deploy, or delete worktrees automatically.

## Web dashboard

```powershell
npm run ui-compare
```

Opens http://127.0.0.1:3140/ where you can:

- See **main**, every **branch**, and **uncommitted changes**, each with a short description of how it differs from main
- **Commit** uncommitted changes (optional) before comparing
- Select **left** and **right** versions and open a **split-screen** compare window
- Open **live, fully interactive** apps in a split-screen view (click, scroll, and test each version)
- Indexed difference notes in the sidebar (background visual analysis; requires `playwright`, `pixelmatch`, `pngjs`)

First-time setup for visual diffs:

```powershell
npm install
npx playwright install chromium
```

---

## CLI script

```powershell
npm run compare:ui
```

By default it uses:

- Main UI: `http://localhost:1111`
- Selected branch UI: `http://localhost:1112`
- Worktree parent folder: `../nature-ot-ui-compare`
- Routes: `/`, `/services`, `/events`, `/calendar`, `/admin`

## Compare Main Vs A Branch

Interactive mode lists local branches, remote branches, and existing worktrees, then asks what to compare.

You can also pass the branch directly:

```powershell
npm run compare:ui -- --branch feature/your-branch
```

Remote branches can be compared directly too:

```powershell
npm run compare:ui -- --branch origin/feature/your-branch
```

The script creates detached worktrees at the selected commit where needed. That avoids changing the branch checkout state and safely handles branches that are already checked out somewhere else (including Codex/Cursor branches).

## Compare Main Vs Current Uncommitted Changes

Use current-working-copy mode when Cursor, Codex, or another editor has uncommitted UI changes that you want to inspect before committing:

```powershell
npm run compare:ui -- --current-working-copy
```

In this mode:

- Clean `main` runs from `../nature-ot-ui-compare/main` on port `1111`.
- The current repo folder runs on port `1112`.
- Uncommitted local changes are included only on the branch/current side.
- Nothing is committed or stashed.

## Custom Routes

Pass a comma-separated route list:

```powershell
npm run compare:ui -- --branch feature/your-branch --routes /,/services,/events
```

Each route is opened on both local servers, screenshotted, and compared (CLI). The web dashboard uses the same default route list for its tabs.

## Useful Options

```text
--main-branch main
--branch feature/your-branch
--main-port 1111
--branch-port 1112
--routes /,/services,/events,/calendar,/admin
--skip-install
--skip-screenshots
--open
--current-working-copy
--cleanup
```

If a requested port is already in use, the script asks for an alternate port. It does not kill existing processes.

## Dependency Installs

For each worktree, the script checks whether `node_modules` exists. If dependencies are missing, it asks before installing.

Package manager detection follows lockfiles:

- `pnpm-lock.yaml` -> `pnpm install --frozen-lockfile`
- `yarn.lock` -> `yarn install --frozen-lockfile`
- `package-lock.json` -> `npm ci`
- `bun.lockb` or `bun.lock` -> `bun install --frozen-lockfile`

Screenshot diffs require `playwright`, `pixelmatch`, and `pngjs`. If they are missing, the script asks whether to install them as dev dependencies. If you decline, it still runs both UIs side-by-side.

## Visual Diff Report

Reports are generated under:

```text
ui-diff-report/YYYY-MM-DD-HH-mm-ss
```

Each report includes:

- `screenshots/main/*.png`
- `screenshots/branch/*.png`
- `screenshots/diff/*.png`
- `summary.json`
- `report.html`

Open `report.html` to compare the main screenshot, branch screenshot, and pixel diff for each route.

## Cleanup

The CLI stops child dev servers when you exit with `Ctrl+C`. The web dashboard keeps preview servers running until you close the compare window or stop the `ui-compare` process.

It does not remove worktrees automatically. To inspect what exists:

```powershell
git worktree list
```

Manual cleanup examples:

```powershell
git worktree remove ../nature-ot-ui-compare/main
git worktree remove ../nature-ot-ui-compare/feature-your-branch
```

You can pass `--cleanup` on the CLI, but the script still asks before removing any worktree.

## Safety Notes

- Worktrees are reused only after confirmation (CLI) or created if missing (web dashboard).
- Existing folders are not deleted automatically.
- Dirty working trees are reported before branch selection.
- Uncommitted changes are not included in a separate branch worktree.
- Use `--current-working-copy` or pick **Uncommitted changes** in the web UI to compare clean `main` against your local edits.
- The script never runs production deploy commands.

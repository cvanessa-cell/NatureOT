/**
 * List Vercel env for the linked project (avoids some PowerShell + stderr quirks).
 * Usage: node scripts/vercel-env-ls.mjs
 */

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd =
  process.platform === "win32"
    ? "npx.cmd --yes vercel@53 --non-interactive env ls"
    : "npx --yes vercel@53 --non-interactive env ls";

execSync(cmd, { cwd: root, stdio: "inherit", shell: true, windowsHide: true });

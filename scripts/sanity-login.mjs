/**
 * Log in to Sanity via the official CLI (browser OAuth).
 * Credentials are stored in ~/.config/sanity/config.json (authToken).
 *
 * Usage: node scripts/sanity-login.mjs
 *        node scripts/sanity-login.mjs --force
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import {
  isSanityLoggedIn,
  loadSanityUserConfig,
  root,
  sanityCliBin,
} from "./lib/sanity-cli-auth.mjs";
import { loadProjectContext } from "./lib/project-context.mjs";

const force = process.argv.includes("--force");
const providerIdx = process.argv.indexOf("--provider");
const provider =
  (providerIdx >= 0 ? process.argv[providerIdx + 1] : null) ||
  process.env.SANITY_LOGIN_PROVIDER?.trim() ||
  "google";

if (!fs.existsSync(sanityCliBin)) {
  console.error("Sanity CLI not found. Run: npm install");
  process.exit(1);
}

if (isSanityLoggedIn() && !force) {
  const { configPath } = loadSanityUserConfig();
  console.log("Already logged in to Sanity CLI.");
  if (configPath) console.log(`Config: ${configPath}`);
  process.exit(0);
}

const ctx = loadProjectContext();
const env = {
  ...process.env,
  NEXT_PUBLIC_SANITY_PROJECT_ID:
    ctx.sanityProjectId || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "9lbip0ho",
  NEXT_PUBLIC_SANITY_DATASET:
    ctx.sanityDataset || process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
};

console.log("Sanity CLI login");
console.log(`  Project: ${env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
console.log(`  Dataset: ${env.NEXT_PUBLIC_SANITY_DATASET}`);
console.log(`\nProvider: ${provider}`);
console.log("A browser window will open — sign in with the account that owns this project.\n");

const result = spawnSync("node", [sanityCliBin, "login", "--provider", provider], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: false,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!isSanityLoggedIn()) {
  console.error("\nLogin finished but no auth token was saved. Try again.");
  process.exit(1);
}

const { configPath } = loadSanityUserConfig();
console.log("\nSanity CLI login successful.");
if (configPath) console.log(`Token saved: ${configPath}`);

const verify = spawnSync("node", [sanityCliBin, "projects", "list"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: false,
});

process.exit(verify.status === 0 ? 0 : 0);

/**
 * Print Sanity CLI login status (reads ~/.config/sanity/config.json).
 *
 * Usage: node scripts/sanity-auth-status.mjs
 * Exit 0 if logged in, 1 if not.
 */

import {
  isSanityLoggedIn,
  loadSanityUserConfig,
  sanityLoginLabel,
} from "./lib/sanity-cli-auth.mjs";

const { configPath } = loadSanityUserConfig();
const loggedIn = isSanityLoggedIn();

if (loggedIn) {
  console.log(`Sanity CLI: logged in (${sanityLoginLabel() || "ok"})`);
  if (configPath) console.log(`Config: ${configPath}`);
  process.exit(0);
}

console.log("Sanity CLI: not logged in");
if (configPath) console.log(`Config: ${configPath}`);
else console.log("Config: (no config file yet — run npm run sanity:login)");
console.log("\nLog in with: npm run sanity:login");
process.exit(1);

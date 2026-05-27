import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.join(__dirname, "..", "..");

export const sanityCliBin = path.join(root, "node_modules", "sanity", "bin", "sanity");

export function sanityConfigPaths() {
  const paths = [];
  if (process.env.SANITY_CONFIG_DIR?.trim()) {
    paths.push(path.join(process.env.SANITY_CONFIG_DIR.trim(), "config.json"));
  }
  if (process.env.XDG_CONFIG_HOME) {
    paths.push(path.join(process.env.XDG_CONFIG_HOME, "sanity", "config.json"));
  }
  paths.push(path.join(os.homedir(), ".config", "sanity", "config.json"));
  if (process.env.APPDATA) {
    paths.push(path.join(process.env.APPDATA, "sanity", "config.json"));
  }
  return [...new Set(paths)];
}

export function loadSanityUserConfig() {
  for (const configPath of sanityConfigPaths()) {
    if (!fs.existsSync(configPath)) continue;
    try {
      return { configPath, config: JSON.parse(fs.readFileSync(configPath, "utf8")) };
    } catch {
      /* try next */
    }
  }
  return { configPath: null, config: null };
}

export function isSanityLoggedIn() {
  const { config } = loadSanityUserConfig();
  return Boolean(config?.authToken?.trim());
}

export function sanityLoginLabel() {
  const { config } = loadSanityUserConfig();
  if (!config?.authToken) return null;
  const bits = [];
  if (config.authType) bits.push(config.authType);
  if (config.userId) bits.push(`user ${config.userId}`);
  return bits.length ? bits.join(", ") : "authenticated";
}

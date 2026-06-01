/**
 * Sync .env.local → Vercel (production, preview, development) via REST API.
 * Usage: node scripts/sync-env-local-to-vercel.mjs
 * Auth: VERCEL_TOKEN env, .env.local VERCEL_TOKEN, or Vercel CLI auth.json.
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectId = "prj_C8zrQUJg8zWsnyZziGXuY0tiDzid";
const teamId = "team_W9utMnJAj6nAFr98LzVLP0ds";
const targets = ["production", "preview", "development"];

function loadToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith("VERCEL_TOKEN=")) {
        return t.slice("VERCEL_TOKEN=".length).trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  const authPath = join(
    homedir(),
    "AppData",
    "Roaming",
    "com.vercel.cli",
    "Data",
    "auth.json",
  );
  if (existsSync(authPath)) {
    const auth = JSON.parse(readFileSync(authPath, "utf8"));
    if (auth.token) return auth.token;
  }
  throw new Error("No Vercel token (VERCEL_TOKEN, .env.local, or vercel login)");
}

function parseEnvLocal() {
  const content = readFileSync(join(root, ".env.local"), "utf8");
  /** @type {Record<string, string>} */
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    if (!/^[A-Z][A-Z0-9_]*=/.test(t)) continue;
    const i = t.indexOf("=");
    const key = t.slice(0, i);
    if (key.startsWith("GIT_REMOTE_") || key === "VERCEL_TOKEN") continue;
    if (key in vars) continue;
    let value = t.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const token = loadToken();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path, { method = "GET", body, retries = 4 } = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set("teamId", teamId);
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (res.status === 429 && attempt < retries) {
      const waitSec = 65;
      console.log(`  … rate limited, waiting ${waitSec}s`);
      await sleep(waitSec * 1000);
      continue;
    }
    if (!res.ok) {
      const msg = data?.error?.message ?? data?.message ?? text.slice(0, 200);
      throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
    }
    return data;
  }
  throw new Error(`${method} ${path} → rate limit retries exhausted`);
}

async function listExisting() {
  const data = await api(`/v9/projects/${projectId}/env`);
  /** @type {Map<string, { id: string, type?: string }>} */
  const index = new Map();
  for (const row of data.envs ?? []) {
    for (const target of row.target ?? []) {
      index.set(`${row.key}@${target}`, { id: row.id, type: row.type });
    }
  }
  return index;
}

async function upsert(index, key, target, value) {
  const mapKey = `${key}@${target}`;
  const existing = index.get(mapKey);
  if (existing?.id) {
    // Never send `type` on PATCH — sensitive vars reject encrypted/plain changes.
    await api(`/v9/projects/${projectId}/env/${existing.id}`, {
      method: "PATCH",
      body: { value, target: [target] },
    });
    return "updated";
  }
  try {
    const created = await api(`/v10/projects/${projectId}/env`, {
      method: "POST",
      body: {
        key,
        value,
        type: "encrypted",
        target: [target],
      },
    });
    if (created?.id) index.set(mapKey, { id: created.id, type: created.type });
    return "created";
  } catch (e) {
    if (!String(e.message).includes("already exists")) throw e;
    const fresh = await listExisting();
    const row = fresh.get(mapKey);
    if (!row?.id) throw e;
    index.set(mapKey, row);
    await api(`/v9/projects/${projectId}/env/${row.id}`, {
      method: "PATCH",
      body: { value, target: [target] },
    });
    return "updated";
  }
}

const vars = parseEnvLocal();
const index = await listExisting();
let ok = 0;
let fail = 0;

for (const target of targets) {
  console.log(`\n=== ${target} ===`);
  for (const [key, value] of Object.entries(vars)) {
    try {
      const action = await upsert(index, key, target, value);
      ok++;
      console.log(`  ${action} ${key}`);
      await sleep(550);
    } catch (e) {
      fail++;
      console.error(`  FAIL ${key}: ${e.message}`);
    }
  }
}

console.log(
  `\nDone: ${ok} ok, ${fail} failed (${Object.keys(vars).length} keys × ${targets.length} targets)`,
);
process.exit(fail > 0 ? 1 : 0);

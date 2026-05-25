import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.join(__dirname, "..", "..");

export function parseEnvFile(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadEnvLocal() {
  let env = {};
  let envPath = null;
  for (const name of [".env", ".env.local"]) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    env = { ...env, ...parseEnvFile(fs.readFileSync(p, "utf8")) };
    envPath = p;
  }
  return { envPath, env };
}

export function loadVercelMeta() {
  const metaPath = path.join(root, ".vercel", "project.json");
  if (!fs.existsSync(metaPath)) return { metaPath, meta: null };
  return { metaPath, meta: JSON.parse(fs.readFileSync(metaPath, "utf8")) };
}

function vercelAuthFilePaths() {
  const paths = [path.join(os.homedir(), ".vercel", "auth.json")];
  if (process.env.APPDATA) {
    paths.push(
      path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    );
  }
  return paths;
}

export function loadVercelToken(env = {}) {
  const fromEnv = env.VERCEL_TOKEN?.trim() || process.env.VERCEL_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  for (const authPath of vercelAuthFilePaths()) {
    if (!fs.existsSync(authPath)) continue;
    try {
      const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
      if (auth.token?.trim()) return auth.token.trim();
    } catch {
      /* try next */
    }
  }
  return null;
}

export function loadProjectContext() {
  const { env } = loadEnvLocal();
  const { meta } = loadVercelMeta();

  const sanityProjectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "";
  const sanityDataset = env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const appUrl = (env.NEXT_PUBLIC_APP_URL?.trim() || "https://treetotsnatureot.com").replace(
    /\/$/,
    "",
  );

  const vercelProjectId = meta?.projectId || "";
  const vercelTeamId = meta?.orgId || "";
  const vercelProjectName = meta?.projectName || "nature-ot-growth-os";

  const vercelTeamSlug = vercelTeamId ? slugFromTeamId(vercelTeamId) : "";

  return {
    env,
    meta,
    sanityProjectId,
    sanityDataset,
    appUrl,
    vercelProjectId,
    vercelTeamId,
    vercelTeamSlug,
    vercelProjectName,
    vercelToken: loadVercelToken(env),
    studioUrl: `${appUrl}/studio`,
    urls: {
      site: appUrl,
      studio: `${appUrl}/studio`,
      sanityManage: sanityProjectId
        ? `https://www.sanity.io/organizations/oQc1gG4Ul/project/${sanityProjectId}`
        : "https://www.sanity.io/manage",
      sanityStudios: sanityProjectId
        ? `https://www.sanity.io/organizations/oQc1gG4Ul/project/${sanityProjectId}/studios`
        : null,
      vercelProject: vercelTeamId
        ? `https://vercel.com/${slugFromTeamId(vercelTeamId)}/${vercelProjectName}`
        : `https://vercel.com/dashboard`,
      vercelDeployments: vercelTeamId
        ? `https://vercel.com/${slugFromTeamId(vercelTeamId)}/${vercelProjectName}/deployments`
        : null,
      githubRepo: null,
    },
  };
}

/** Vercel team id team_xxx → dashboard slug from linked project when known */
function slugFromTeamId(teamId) {
  if (teamId === "team_W9utMnJAj6nAFr98LzVLP0ds") return "cvanessa-5749s-projects";
  return teamId.replace(/^team_/, "");
}

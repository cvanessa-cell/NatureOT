/**
 * Local Airtable sync queue worker (calls /api/cron/process-airtable-sync).
 *
 * Usage:
 *   npm run agent:worker          # poll until Ctrl+C
 *   npm run agent:worker:once     # single batch
 *
 * Requires .env.local with CRON_SECRET and a running Next dev server (or production URL).
 */

const command = process.argv[2] ?? "start";
/** Local worker targets dev by default; set AGENT_WORKER_BASE_URL for production cron. */
const baseUrl = (
  process.env.AGENT_WORKER_BASE_URL ||
  process.env.APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET?.trim();
const pollMs = Math.max(parseInt(process.env.AGENT_WORKER_POLL_MS ?? "60000", 10) || 60000, 5000);

if (!cronSecret) {
  console.error("agent-worker: CRON_SECRET is required in .env.local");
  process.exit(1);
}

async function processBatch() {
  const res = await fetch(`${baseUrl}/api/cron/process-airtable-sync`, {
    method: "POST",
    headers: { authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `cron ${res.status}: ${typeof body.error === "string" ? body.error : JSON.stringify(body)}`
    );
  }
  return body;
}

async function waitForServer(maxWaitMs = 120_000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/process-airtable-sync`, {
        method: "GET",
        headers: { authorization: `Bearer ${cronSecret}` },
      });
      if (res.ok) return;
    } catch {
      // not ready
    }
    await sleep(2000);
  }
  throw new Error(`app not reachable at ${baseUrl} after ${maxWaitMs / 1000}s`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function logBatch(body) {
  const ts = new Date().toISOString();
  console.log(
    `[${ts}] processed=${body.processed} ok=${body.succeeded} failed=${body.failed} ` +
      `dryRun=${body.dryRun} concurrency=${body.concurrency} skipped=${body.skippedSyncDisabled ?? 0}`
  );
}

async function runOnce() {
  await waitForServer();
  const body = await processBatch();
  logBatch(body);
  return body;
}

async function runLoop() {
  await waitForServer();
  console.log(`agent-worker: polling ${baseUrl} every ${pollMs}ms (Ctrl+C to stop)`);
  for (;;) {
    try {
      const body = await processBatch();
      logBatch(body);
    } catch (e) {
      console.error(`agent-worker: ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(pollMs);
  }
}

if (command === "once") {
  runOnce().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
} else if (command === "start") {
  runLoop().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
} else {
  console.error(`Unknown command "${command}". Use: start | once`);
  process.exit(1);
}

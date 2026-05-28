/**
 * Headless daily polish run via @cursor/sdk (requires CURSOR_API_KEY).
 *
 * Usage (from repo root or worktree):
 *   node scripts/run-daily-polish-ui-automation.mjs --prompt-file automations/.../PROMPT.md
 */

import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const promptFileIdx = args.indexOf("--prompt-file");
if (promptFileIdx === -1 || !args[promptFileIdx + 1]) {
  console.error("Usage: node run-daily-polish-ui-automation.mjs --prompt-file <path>");
  process.exit(1);
}

const promptPath = resolve(args[promptFileIdx + 1]);
const prompt = readFileSync(promptPath, "utf8");
const apiKey = process.env.CURSOR_API_KEY?.trim();
const stateRoot = resolve(".cursor-sdk-state");

if (!apiKey) {
  console.error("CURSOR_API_KEY is required");
  process.exit(1);
}

mkdirSync(stateRoot, { recursive: true });

try {
  const { Agent } = await import("@cursor/sdk");

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
    platform: {
      stateRoot,
      workspaceRef: process.cwd(),
    },
  });

  if (result.status === "error") {
    console.error(
      JSON.stringify(
        {
          error: "agent_run_failed",
          runId: result.id ?? "unknown",
          status: result.status,
          model: result.model?.id ?? "unknown",
          durationMs: result.durationMs ?? null,
          stateRoot,
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  if (result.result) {
    console.log(result.result);
  }

  process.exit(0);
} catch (error) {
  const details =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          name: "UnknownError",
          message: String(error),
        };

  console.error(
    JSON.stringify(
      {
        error: "sdk_runner_exception",
        stateRoot,
        ...details,
      },
      null,
      2,
    ),
  );
  process.exit(3);
}

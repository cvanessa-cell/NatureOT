import { requireStaffPortal } from "@/lib/admin-guard";
import { AgentCommandCenter } from "@/components/agent-command-center";
import type { Metadata } from "next";
import { suggestedAgentCommands } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Agent_Airtable command center | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AgentAirtablePage() {
  await requireStaffPortal();

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">
        Agent_Airtable command center
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-bark/80">
        Preview operational summaries. Writes require approval — Growth OS never
        auto-publishes externally. When{" "}
        <code className="rounded bg-white px-1">AGENT_AIRTABLE_ENABLED=true</code>, mirror
        these commands with Cursor Agent_Airtable MCP tools using the same payloads (PHI
        filtered).
      </p>
      <Card className="mt-8 border-sky/25 bg-white/90">
        <h2 className="font-display text-xl text-forest">
          Suggested commands
        </h2>
        <p className="mt-2 text-sm text-bark/80">
          Map these prompts to the preview dropdown keys as you expand{" "}
          <code className="rounded bg-white px-1">runPreviewCommand</code>. Every write stays preview-first.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-bark/90">
          {suggestedAgentCommands.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
      <div className="mt-8">
        <AgentCommandCenter />
      </div>
    </div>
  );
}

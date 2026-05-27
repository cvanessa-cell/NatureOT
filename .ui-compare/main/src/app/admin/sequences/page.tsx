import { SequenceEditor } from "@/components/sequence-editor";
import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";

export const metadata: Metadata = {
  title: "Email sequences | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function SequencesPage() {
  await requireStaffPortal();
  let sequences: {
    id: string;
    name: string;
    slug: string;
    category_slug: string | null;
    is_active: boolean;
    steps: unknown;
  }[] = [];
  try {
    const db = getAdminDb();
    const { data } = await db
      .from("email_sequences")
      .select("id, name, slug, category_slug, is_active, steps")
      .order("name");
    sequences = (data as typeof sequences) ?? [];
  } catch {
    sequences = [];
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-forest">
        Email sequences
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-bark/80">
        Edit nurture templates. Use placeholders:{" "}
        <code className="rounded bg-white px-1">{"{{parent_name}}"}</code>,{" "}
        <code className="rounded bg-white px-1">{"{{primary_category}}"}</code>,{" "}
        <code className="rounded bg-white px-1">{"{{book_url}}"}</code>,{" "}
        <code className="rounded bg-white px-1">{"{{unsubscribe_url}}"}</code>.
      </p>

      <div className="mt-6">
        <CampaignAuthenticityCompact />
      </div>

      <div className="mt-8">
        <SequenceEditor initialSequences={sequences} />
      </div>
    </div>
  );
}

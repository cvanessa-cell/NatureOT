import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MarketingSequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPortal();
  const { id } = await params;
  const db = getAdminDb();
  const [{ data: sequence }, { data: steps }] = await Promise.all([
    db.from("marketing_sequences").select("*").eq("id", id).maybeSingle(),
    db.from("marketing_sequence_steps").select("*").eq("sequence_id", id).order("step_order"),
  ]);

  if (!sequence) return <Card><p className="text-sm text-bark/80">Sequence not found.</p></Card>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">{sequence.name}</h1>
      <Card><p className="text-sm text-bark/80">Trigger: {sequence.trigger_type} · Status: {sequence.status}</p></Card>
      {(steps ?? []).map((step) => (
        <Card key={step.id}>
          <p className="font-medium text-forest">Step {step.step_order} ({step.channel})</p>
          <p className="mt-2 text-sm text-bark/80">{step.subject ?? "No subject"}</p>
          <p className="mt-2 text-sm text-bark whitespace-pre-wrap">{step.body}</p>
        </Card>
      ))}
    </div>
  );
}

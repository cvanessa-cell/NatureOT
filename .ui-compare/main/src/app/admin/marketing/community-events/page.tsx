import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MarketingCommunityEventsPage() {
  await requireStaffPortal();
  const db = getAdminDb();
  const { data: events } = await db
    .from("community_events")
    .select("id,title,event_type,city,start_at,status,registration_url")
    .order("start_at", { ascending: true })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Community events</h1>
      {(events ?? []).map((event) => (
        <Card key={event.id}>
          <p className="font-medium text-forest">{event.title}</p>
          <p className="text-sm text-bark/80">
            {event.event_type} · {event.city ?? "TX"} · {event.start_at ? new Date(event.start_at).toLocaleString() : "TBD"} · {event.status}
          </p>
          {event.registration_url ? (
            <a href={event.registration_url} className="mt-2 inline-flex text-sm text-moss underline">
              Registration link
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

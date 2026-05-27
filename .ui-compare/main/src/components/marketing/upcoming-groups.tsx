import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface GroupData {
  _id?: string;
  name?: string;
  schedule?: string;
  location?: string;
  status?: "enrolling" | "waitlist" | "full";
}

const defaultGroups: GroupData[] = [
  { name: "Spring OT Group (Ages 5\u20137)", schedule: "Tuesdays | April 28 \u2013 June 11", location: "White Rock Lake, Dallas", status: "waitlist" },
  { name: "Social Skills & Confidence (Ages 8\u201310)", schedule: "Thursdays | May 2 \u2013 June 13", location: "Frisco Commons Park", status: "waitlist" },
  { name: "Homeschool Nature OT (Ages 6\u20139)", schedule: "Wednesdays | May 1 \u2013 June 12", location: "Arbor Hills Nature Preserve, Plano", status: "enrolling" },
];

function StatusPill({ status }: { status: string }) {
  if (status === "enrolling") {
    return <span className="rounded-full bg-moss/15 px-3 py-1 text-xs font-semibold text-moss">Now Enrolling</span>;
  }
  return <span className="rounded-full bg-terracotta/12 px-3 py-1 text-xs font-semibold text-terracotta">Join Waitlist</span>;
}

export function UpcomingGroups({ data }: { data?: GroupData[] | null }) {
  const groups = data?.length ? data : defaultGroups;

  return (
    <div className="overflow-hidden rounded-2xl border border-sage/40 bg-sage/10 shadow-sm">
      <div className="relative h-40 sm:h-48">
        <Image
          src={treetotsImages.otGroupHammockPlay}
          alt={treetotsImageAlt.otGroupHammockPlay}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          style={{ objectPosition: "55% 45%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/25 to-transparent" />
        <div className="absolute bottom-5 left-6">
          <h3 className="font-display text-2xl font-semibold text-white drop-shadow-md">
            Upcoming Groups
          </h3>
          <p className="mt-1 text-sm font-medium text-white/85 drop-shadow-sm">Now enrolling for Spring &amp; Summer!</p>
        </div>
      </div>

      <div className="p-5 lg:p-7">
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.name} className="flex flex-col gap-3 rounded-xl border border-sand/60 bg-card p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-forest">{g.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs text-forest/55">
                    <Calendar className="size-3.5" aria-hidden />{g.schedule}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-forest/55">
                    <MapPin className="size-3.5" aria-hidden />{g.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusPill status={g.status || "waitlist"} />
                <Link href="/waitlist" className="rounded-full bg-forest px-4 py-2 text-xs font-semibold text-cream shadow-sm transition hover:bg-forest/90">
                  {g.status === "enrolling" ? "Enroll Now" : "Join Waitlist"}
                </Link>
              </div>
            </div>
          ))}
        </div>
        <Link href="/groups" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-moss hover:text-forest">
          View All Groups &amp; Dates
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

import { Leaf } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-forest text-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-center text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Leaf className="size-3.5 text-sage" aria-hidden />
          <span className="font-medium">
            Nature-Based Occupational Therapy Groups in Dallas–Fort Worth
          </span>
        </span>
        <span className="text-cream/70">
          Now Enrolling for Spring Groups &amp; Summer Camps!
        </span>
      </div>
    </div>
  );
}

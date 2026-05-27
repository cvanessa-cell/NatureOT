import { WaitlistForm } from "@/components/waitlist-form";
import type { Metadata } from "next";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Join the Waitlist | TreeTots DFW",
  description:
    "Join the TreeTots DFW interest list for nature-based pediatric occupational therapy groups in Dallas-Fort Worth.",
};

export default function WaitlistPage() {
  return (
    <div>
      <PageHero
        eyebrow="Waitlist"
        title="Join the TreeTots DFW interest list"
        description="Share basic preferences so we can suggest cohorts that may fit without collecting sensitive clinical details on this form."
        imageKey="naturePlayChildOnLog"
        imagePosition="50% 40%"
        actions={[
          { href: "#waitlist-form", label: "Start the form" },
          { href: "/book-call", label: "Book a parent call", variant: "secondary" },
        ]}
      />
      <div className="mx-auto max-w-xl px-4 py-12">
        <ComplianceBanner className="mb-8">
          <p>
            Waitlist records should remain minimum-necessary and non-clinical. Staff dashboards mirror this rule.
          </p>
        </ComplianceBanner>
        <div id="waitlist-form">
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}

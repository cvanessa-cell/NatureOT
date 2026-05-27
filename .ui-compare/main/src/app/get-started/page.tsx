import { LeadForm } from "@/components/lead-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect | TreeTots DFW",
  description: "Share your contact information to receive your TreeTots DFW guide summary.",
};

export default function GetStartedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-center font-display text-3xl font-semibold text-forest">
        Let us send your summary
      </h1>
      <p className="mt-3 text-center text-bark/90">
        We only ask for parent or caregiver details. Please do not share a
        child&rsquo;s full name, diagnosis, or medical records in this form.
      </p>
      <div className="mt-10">
        <LeadForm />
      </div>
    </div>
  );
}

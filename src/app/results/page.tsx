import Link from "next/link";
import { ResultsContent } from "@/components/results-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your guide results | Texas Nature OT",
  description: "Educational summary based on your parent guide responses.",
};

export default function ResultsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ResultsContent />
      <p className="mt-8 text-center text-sm text-bark/80">
        <Link href="/get-started" className="font-medium text-sage underline">
          Share your contact information
        </Link>{" "}
        to receive a copy by email and optional follow-up (you may unsubscribe
        anytime).
      </p>
    </div>
  );
}

import { Suspense } from "react";
import { ResultsContent } from "@/components/results-content";
import type { Metadata } from "next";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Your Guide Results | TreeTots DFW",
  description:
    "Educational summary based on your parent guide responses. Not a clinical assessment.",
};

function ResultsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Leaf className="size-8 animate-pulse text-moss" aria-hidden />
      <span className="sr-only">Loading results</span>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<ResultsLoading />}>
        <ResultsContent />
      </Suspense>
    </div>
  );
}

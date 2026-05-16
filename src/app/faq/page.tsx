import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "FAQ | Nature OT Growth OS",
  description:
    "Answers about nature-based pediatric occupational therapy groups in Texas—education only.",
};

const items: FaqItem[] = [
  {
    id: "1",
    q: "What is nature-based OT?",
    a: "Nature-based occupational therapy uses outdoor environments and meaningful movement to support participation, regulation, and skill practice. It is not “just playing outside”—activities are selected and facilitated with pediatric OT clinical reasoning appropriate to your intake process.",
  },
  {
    id: "2",
    q: "Is this therapy or enrichment?",
    a: "When delivered by the practice as part of care, services follow OT clinical standards. This website is educational marketing and does not establish a provider–patient relationship by itself.",
  },
  {
    id: "3",
    q: "Does my child need a diagnosis?",
    a: "Browsing or joining an interest list does not require a diagnosis. Clinical appropriateness for a specific service is determined through your intake process—not by reading FAQs.",
  },
  {
    id: "4",
    q: "Is this appropriate for sensory processing challenges?",
    a: "Some children benefit from structured outdoor sensory-rich experiences; others need different supports. This FAQ cannot determine eligibility for your child.",
  },
  {
    id: "5",
    q: "How are groups formed?",
    a: "Groups consider age, developmental needs, schedule, safety, and social fit. We communicate honestly when a group may not be the best fit.",
  },
  {
    id: "6",
    q: "What happens in bad weather?",
    a: "We monitor conditions for safety. Sessions may adjust location, reschedule, or pause when needed.",
  },
  {
    id: "7",
    q: "Is this covered by insurance?",
    a: "Coverage varies widely by plan and service setting. We do not promise insurance reimbursement on this marketing site; ask during intake for operational billing guidance.",
  },
  {
    id: "8",
    q: "Is this a replacement for school OT?",
    a: "No. School-based OT addresses educational goals in the school setting. Outdoor groups serve different purposes and may complement—but not replace—school services when both are appropriate.",
  },
  {
    id: "9",
    q: "What should my child wear?",
    a: "Closed-toe shoes, layers, sun protection, and clothes that can get dirty. Your team will share a packing list after you connect.",
  },
  {
    id: "10",
    q: "What if my child has difficulty separating from me?",
    a: "Some children need gradual plans for separation. Discuss concerns during your parent call so we can recommend sensible supports.",
  },
  {
    id: "11",
    q: "How do we get started?",
    a: "Many families begin with the waitlist or a short parent call. You may also download the parent guide for educational context.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest">
        Frequently asked questions
      </h1>
      <p className="font-lead mt-4 text-lg text-bark/90">
        Straightforward answers in plain language—still educational, not individualized clinical advice.
      </p>
      <ComplianceBanner className="mt-8">
        <p>
          This information is educational and does not determine eligibility or replace an individualized
          occupational therapy evaluation.
        </p>
      </ComplianceBanner>
      <FaqAccordion className="mt-10" items={items} />
      <div className="mt-12 rounded-2xl border border-sage/20 bg-white/70 p-6 text-center">
        <p className="font-medium text-forest">Ready for next steps?</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/waitlist"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 font-medium text-cream"
          >
            Join the waitlist
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-sage/40 px-6 font-medium text-forest"
          >
            Book a parent call
          </Link>
        </div>
      </div>
    </div>
  );
}

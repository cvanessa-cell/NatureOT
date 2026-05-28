import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { BLOCKED_CAMPAIGN_PRACTICES } from "@/lib/campaign-authenticity";
import {
  TestimonialsQueue,
  type TestimonialRow,
} from "@/components/admin/marketing/testimonials-queue";

export const metadata: Metadata = {
  title: "Reviews & testimonials | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  let rows: TestimonialRow[] = [];
  try {
    const { data } = await db
      .from("testimonials")
      .select("id,quote,parent_initials,auth_status,admin_approval,published")
      .order("created_at", { ascending: false })
      .limit(50);
    rows = (data as TestimonialRow[] | null) ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Reviews & testimonials</h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Publishing is blocked unless authorization is on file and admin approval is granted.
        </p>
      </div>

      <ComplianceBanner>
        <p>
          Never publish identifiable testimonials without written authorization appropriate to your legal workflow.
        </p>
        <p className="mt-2 font-medium text-forest">Blocked by policy</p>
        <ul className="mt-1 list-inside list-disc text-bark/90">
          {BLOCKED_CAMPAIGN_PRACTICES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ComplianceBanner>

      <TestimonialsQueue rows={rows} />
    </div>
  );
}

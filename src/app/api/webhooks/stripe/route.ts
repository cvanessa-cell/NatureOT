import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import { getEnv } from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { parseParentName } from "@/lib/leads/lead-normalizer";
import { upsertMarketingLead } from "@/lib/leads/marketing-lead-upsert";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { mapLeadCreatedPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = getEnv().STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const serviceName = session.metadata?.service_name ?? "Service checkout";
    const parentName = session.metadata?.parent_name?.trim() || "Parent";
    const email =
      session.customer_details?.email?.trim().toLowerCase() ||
      session.customer_email?.trim().toLowerCase() ||
      "";
    const preferredLocation = session.metadata?.preferred_location ?? "";
    const checkoutSlug = session.metadata?.checkout_slug ?? "";

    await writeAuditLog({
      action: "stripe.checkout.completed",
      resourceType: "checkout_session",
      resourceId: session.id,
      details: {
        service_name: serviceName,
        parent_name: parentName,
        preferred_location: preferredLocation,
        checkout_slug: checkoutSlug,
        customer_email: email || null,
        amount_total: session.amount_total ?? null,
      },
    });

    if (email && getEnv().SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createAdminClient();
        const parsedName = parseParentName(parentName);
        const mainConcern = `Paid enrollment: ${serviceName}`;

        const { leadId } = await upsertMarketingLead(supabase, {
          parent_name: parsedName.parent_name,
          parent_email: email,
          city_or_zip: preferredLocation === "virtual" ? "Virtual" : "DFW outdoor",
          main_concern: mainConcern,
          lead_source: "stripe_checkout",
          form_type: "service_checkout",
          consent_marketing: false,
          consent_privacy: true,
          parent_first_name: parsedName.parent_first_name,
          parent_last_name: parsedName.parent_last_name,
        });

        await supabase.from("consent_logs").insert({
          lead_id: leadId,
          consent_type: "service_checkout_non_emergency",
          language_snippet: "checkout_consent_v1",
          source_page: "/api/webhooks/stripe",
          email,
        });

        await enqueueAirtablePush({
          sourceTable: "leads",
          sourceRecordId: leadId,
          targetAirtableTable: "Leads",
          safePayloadSummary: {
            lead_id: leadId,
            parent_email: email,
            parent_name: parsedName.parent_name,
            lead_source: "stripe_checkout",
            service_name: serviceName,
            checkout_slug: checkoutSlug,
            stripe_session_id: session.id,
            preferred_location: preferredLocation,
          },
        });

        const mapped = mapLeadCreatedPayload({
          id: leadId,
          parent_email: email,
          parent_name: parsedName.parent_name,
          city_or_zip: preferredLocation === "virtual" ? "Virtual" : "DFW",
          lead_source: "stripe_checkout",
          consent_marketing: false,
        });

        queueZapierOutbound({
          zapKey: "new_lead",
          payload: {
            ...mapped.data,
            stripe_session_id: session.id,
            service_name: serviceName,
            checkout_slug: checkoutSlug,
          },
          logExtras: { stripped_keys: mapped.strippedKeys },
          auditEventType: "stripe_checkout_lead",
          containsParentChildData: true,
          phiRiskLevel: mapped.phiRiskSuggestion,
          approvalRequired: false,
          approvalStatus: "not_required",
        });
      } catch (err) {
        console.error("[stripe-webhook] lead sync failed", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}

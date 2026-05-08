import { afterEach, describe, expect, it } from "vitest";
import { sendOperationalEmail } from "./send-transactional-email";

describe("sendOperationalEmail", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("skips outbound send when EMAIL_DRY_RUN=true (no HTTP to Resend)", async () => {
    process.env = {
      ...prev,
      EMAIL_DRY_RUN: "true",
      RESEND_API_KEY: "re_test_key",
      EMAIL_FROM: "Nature <ops@example.com>",
      SUPABASE_SERVICE_ROLE_KEY: prev.SUPABASE_SERVICE_ROLE_KEY,
    };
    const r = await sendOperationalEmail({
      to: "parent@example.com",
      subject: "Hi",
      html: "<p>Test</p>",
    });
    expect(r.dryRun).toBe(true);
    expect(r.skippedReason).toBe("email_dry_run");
  });

  it("gracefully skips when Resend credentials are incomplete", async () => {
    process.env = {
      ...prev,
      EMAIL_DRY_RUN: "false",
      RESEND_API_KEY: "",
      EMAIL_FROM: "",
      SUPABASE_SERVICE_ROLE_KEY: prev.SUPABASE_SERVICE_ROLE_KEY,
    };
    const r = await sendOperationalEmail({
      to: "parent@example.com",
      subject: "Hi",
      html: "<p>Test</p>",
    });
    expect(r.dryRun).toBe(true);
    expect(r.skippedReason).toBe("email_not_configured");
  });
});

import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth-admin", () => ({
  getPrivilegedSession: vi.fn(async () => ({ privileged: false, user: null })),
}));

describe("POST /api/admin/airtable/retry-failed authorization", () => {
  it("returns 401 for unprivileged sessions", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/airtable/retry-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 1, dryRun: true, mode: "reset_only" }),
      })
    );

    expect(res.status).toBe(401);
  });
});

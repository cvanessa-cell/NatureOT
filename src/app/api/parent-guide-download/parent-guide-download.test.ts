import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn(async () => {}),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => ({
    PARENT_GUIDE_DELIVERY_MODE: "public_asset",
    PARENT_GUIDE_ASSET_URL: undefined,
    PARENT_GUIDE_PUBLIC_ASSET_PATH: "/guides/outdoor-sensory-activities-texas-kids.html",
  })),
  appBaseUrl: () => "http://localhost:3000",
}));

describe("GET /api/parent-guide-download", () => {
  it("redirects to bundled public HTML asset by default", async () => {
    const res = await GET(new Request("http://localhost/api/parent-guide-download"));
    expect(res.status).toBe(302);
    const loc = res.headers.get("location");
    expect(loc).toBeTruthy();
    expect(loc!).toContain("outdoor-sensory-activities-texas-kids.html");
  });
});
